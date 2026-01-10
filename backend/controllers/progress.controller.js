import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";

/**
 * Get progress for a specific user (Student view)
 */
export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await Progress.find({ userId })
      .populate("courseId", "title");

    res.json(progress);
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

    res.json(progress);
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

    // 🔥 AUTO-CERTIFICATE GENERATION
    if (completedLessons >= totalLessons) {
      const exists = await Certificate.findOne({ userId, courseId });
      if (!exists) {
        await Certificate.create({
          userId,
          courseId,
          issuedAt: new Date()
        });
      }
    }

    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Failed to update progress" });
  }
};
