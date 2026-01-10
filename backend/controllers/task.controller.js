import Task from "../models/Task.js";
import Progress from "../models/Progress.js";

/* 👨‍🏫 Teacher creates task */
export const createTask = async (req, res) => {
  const { courseId, title, description, deadline } = req.body;

  if (!deadline) {
    return res.status(400).json({ message: "Deadline required" });
  }

  const task = await Task.create({
    courseId,
    title,
    description,
    deadline,
    createdBy: req.user.id,
    submissions: []
  });

  res.status(201).json(task);
};

/* 🎓 Student submits task */
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


/* 👨‍🏫 Teacher grades task */
/* 👨‍🏫 Teacher grades task */
export const gradeTask = async (req, res) => {
  try {
    const { taskId, submissionId, status } = req.body;

    if (!taskId || !submissionId || !status) {
      return res.status(400).json({ message: "Missing data" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const submission = task.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.status = status; // pass / fail
    await task.save();

    res.json({ message: "Task graded successfully" });
  } catch (err) {
    console.error("Grade task error:", err);
    res.status(500).json({ message: "Failed to grade task" });
  }
};

/* 📄 Student task list (FIXED) */
export const getStudentTasks = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    // ✅ Check student enrollment
    const enrolled = await Progress.findOne({
      userId: studentId,
      courseId
    });

    if (!enrolled) {
      return res.json([]); // not enrolled → no tasks
    }

    // ✅ Get all tasks of course
    const tasks = await Task.find({ courseId }).sort({ createdAt: 1 });

    const formatted = tasks.map(task => {
      const submission = task.submissions.find(
        s => s.studentId.toString() === studentId
      );

      return {
        ...task.toObject(),
        submission: submission || null
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load tasks" });
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
