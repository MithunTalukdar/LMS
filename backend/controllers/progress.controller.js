import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";
import Task from "../models/Task.js";

/**
 * Get progress for a specific user (Student view)
 */
export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await Progress.find({ userId })
      .populate("courseId", "title");

    const progressWithPercent = progress.map(p => {
      const total = (p.totalTasks || 0) + (p.totalLessons || 0);
      const completed = (p.completedTasks || 0) + (p.completedLessons || 0);
      const percent = total === 0 ? 100 : Math.round((completed / total) * 100);
      return { ...p.toObject(), percent, progress: percent };
    });

    res.json(progressWithPercent);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user progress" });
  }
};

/**
 * Get progress of all students for a course (Teacher view)
 */
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await Progress.find({ courseId })
      .populate("userId", "name email");

    const progressWithPercent = progress.map(p => {
      const total = (p.totalTasks || 0) + (p.totalLessons || 0);
      const completed = (p.completedTasks || 0) + (p.completedLessons || 0);
      const percent = total === 0 ? 100 : Math.round((completed / total) * 100);
      return { ...p.toObject(), percent, progress: percent };
    });

    res.json(progressWithPercent);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch course progress" });
  }
};

/**
 * Update progress (used by quiz auto-update)
 */
export const updateProgress = async (req, res) => {
  try {
    const { userId, courseId, completedLessons, totalLessons } = req.body;

    const progress = await Progress.findOneAndUpdate(
      { userId, courseId },
      { completedLessons, totalLessons },
      { new: true, upsert: true }
    );

    const total = (progress.totalTasks || 0) + (progress.totalLessons || 0);
    const completed = (progress.completedTasks || 0) + (progress.completedLessons || 0);
    const percent = total === 0 ? 100 : Math.round((completed / total) * 100);

    // 🔥 AUTO-CERTIFICATE GENERATION (Based on overall %)
    if (percent === 100) {
      const exists = await Certificate.findOne({ userId, courseId });
      if (!exists) {
        await Certificate.create({
          userId,
          courseId,
          issuedAt: new Date()
        });
      }
    }

    res.json({ ...progress.toObject(), percent, progress: percent });
  } catch (err) {
    res.status(500).json({ message: "Failed to update progress" });
  }
};

/**
 * 🔄 Force recalculate progress (Fix inconsistencies)
 */
export const recalculateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID required" });
    }

    // 1. Count actual completed tasks from Task collection
    const tasks = await Task.find({ courseId });
    let completedTasks = 0;

    tasks.forEach(task => {
      const submissions = Array.isArray(task.submissions) ? task.submissions : [];
      const submission = submissions.find(s => s.studentId.toString() === userId);
      if (submission?.status === "pass") {
        completedTasks++;
      }
    });

    // 2. Get current progress (to preserve lessons data)
    const currentProgress = await Progress.findOne({ userId, courseId });
    const totalLessons = currentProgress?.totalLessons || 0;
    const completedLessons = currentProgress?.completedLessons || 0;

    // 3. Update Progress
    const progress = await Progress.findOneAndUpdate(
      { userId, courseId },
      {
        completedTasks,
        totalTasks: tasks.length,
        totalLessons,
        completedLessons
      },
      { new: true, upsert: true }
    );

    // 4. Calculate Percent
    const total = (progress.totalTasks || 0) + (progress.totalLessons || 0);
    const completed = (progress.completedTasks || 0) + (progress.completedLessons || 0);
    const percent = total === 0 ? 100 : Math.round((completed / total) * 100);

    // 🔥 AUTO-CERTIFICATE GENERATION
    if (percent === 100) {
      const exists = await Certificate.findOne({ userId, courseId });
      if (!exists) {
        await Certificate.create({
          userId,
          courseId,
          issuedAt: new Date()
        });
      }
    }

    res.json({ ...progress.toObject(), percent, progress: percent });
  } catch (err) {
    console.error("Recalculate error:", err);
    res.status(500).json({ message: "Failed to recalculate progress" });
  }
};
