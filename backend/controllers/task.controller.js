import Task from "../models/Task.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";

/* 👨‍🏫 Teacher creates task */
export const createTask = async (req, res) => {
  const { courseId, title, description, deadline } = req.body;

  const task = await Task.create({
    courseId,
    title,
    description,
    deadline,
    createdBy: req.user.id
  });

  // 🔥 UPDATE totalTasks for all students in this course
  await Progress.updateMany(
    { courseId },
    { $inc: { totalTasks: 1 } }
  );

  res.status(201).json(task);
};

export const submitTask = async (req, res) => {
  const { taskId, answer } = req.body;

  if (!taskId || !answer) {
    return res.status(400).json({ message: "TaskId and answer required" });
  }

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  // prevent resubmission
  const alreadySubmitted = task.submissions?.some(
    s => s.studentId.toString() === req.user.id
  );

  if (alreadySubmitted) {
    return res.status(400).json({ message: "Already submitted" });
  }

  task.submissions.push({
    studentId: req.user.id,
    answer,
    status: "pending"
  });

  await task.save();

  res.json({ message: "Task submitted" });
};

export const gradeTask = async (req, res) => {
  const { taskId, submissionId, status } = req.body;

  const task = await Task.findById(taskId);
  const submission = task.submissions.id(submissionId);

  const previousStatus = submission.status;
  submission.status = status;
  await task.save();

  // 🔥 UPDATE PROGRESS ONLY IF PASS
  if (status === "pass" && previousStatus !== "pass") {
    await Progress.findOneAndUpdate(
      {
        userId: submission.studentId,
        courseId: task.courseId
      },
      { $inc: { completedTasks: 1 } }
    );
  } else if (previousStatus === "pass" && status !== "pass") {
    await Progress.findOneAndUpdate(
      {
        userId: submission.studentId,
        courseId: task.courseId
      },
      { $inc: { completedTasks: -1 } }
    );
  }

  res.json({ message: "Task graded" });
};

export const getStudentTasks = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    // 🔹 Fetch tasks safely
    const tasks = await Task.find({ courseId }).lean();

    let completedTasks = 0;

    const formattedTasks = tasks.map(task => {
      const submissions = Array.isArray(task.submissions)
        ? task.submissions
        : [];

      const submission = submissions.find(
        s => s.studentId?.toString() === studentId
      );

      if (submission?.status === "pass") {
        completedTasks++;
      }

      return {
        ...task,
        submission: submission || null
      };
    });

    // 🔁 Sync Progress with tasks
    const progressDoc = await Progress.findOneAndUpdate(
      { userId: studentId, courseId },
      {
        completedTasks,
        totalTasks: tasks.length
      },
      { upsert: true, new: true }
    );

    // 📊 Calculate Overall Progress (Tasks + Lessons)
    const totalLessons = Number(progressDoc.totalLessons || 0);
    const completedLessons = Number(progressDoc.completedLessons || 0);
    const total = tasks.length + totalLessons;
    const completed = completedTasks + completedLessons;

    const percent = total === 0 ? 100 : Math.round((completed / total) * 100);

    // 🔥 AUTO-CERTIFICATE GENERATION
    if (percent === 100) {
      const exists = await Certificate.findOne({ userId: studentId, courseId });
      if (!exists) {
        await Certificate.create({
          userId: studentId,
          courseId,
          issuedAt: new Date()
        });
      }
    }

    return res.json({
      tasks: formattedTasks,
      completedTasks,
      totalTasks: tasks.length,
      percent,
      progress: percent
    });
  } catch (err) {
    console.error("❌ getStudentTasks error:", err);
    return res
      .status(500)
      .json({ message: "Failed to load student tasks" });
  }
};

export const getTeacherTasks = async (req, res) => {
  try {
    const { courseId } = req.params;

    const tasks = await Task.find({ courseId })
      .populate("submissions.studentId", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Teacher task fetch error:", error);
    res.status(500).json({
      message: "Failed to fetch teacher tasks"
    });
  }
};
