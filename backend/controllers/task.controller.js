import Task from "../models/Task.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";
import Course from "../models/Course.js";

const canManageCourse = async (courseId, user) => {
  if (!courseId) return false;
  if (user?.role === "admin" || user?.role === "teacher") return true;

  const course = await Course.findOne({
    _id: courseId,
    $or: [{ instructor: user?.id }, { teacher: user?.id }],
  }).select("_id");

  return Boolean(course);
};

const getTeacherManagedCourseIds = async (user) => {
  if (user?.role === "admin" || user?.role === "teacher") return null;

  const courses = await Course.find({
    $or: [{ instructor: user?.id }, { teacher: user?.id }],
  }).select("_id");

  return courses.map((course) => course._id);
};

const normalizeGradeStatus = (value) => {
  const status = String(value || "").trim().toLowerCase();

  if (["pass", "passed", "verify", "verified", "approve", "approved"].includes(status)) {
    return "pass";
  }

  if (["fail", "failed", "reject", "rejected", "revision", "needs_changes", "needs-change"].includes(status)) {
    return "fail";
  }

  return "";
};

const normalizeSubmissionStatus = (value) => {
  const status = String(value || "").trim().toLowerCase();
  if (["pass", "passed", "verified", "approved"].includes(status)) return "pass";
  if (["fail", "failed", "rejected", "revision"].includes(status)) return "fail";
  return "pending";
};

const syncStudentTaskProgress = async (courseId, studentId) => {
  const tasks = await Task.find({ courseId }).select("submissions");
  let completedTasks = 0;

  tasks.forEach((task) => {
    const submission = Array.isArray(task.submissions)
      ? task.submissions.find((entry) => entry.studentId?.toString() === String(studentId))
      : null;

    if (submission?.status === "pass") {
      completedTasks += 1;
    }
  });

  await Progress.findOneAndUpdate(
    { userId: studentId, courseId },
    {
      $set: {
        completedTasks,
        totalTasks: tasks.length,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const createTask = async (req, res) => {
  try {
    const { courseId, title, description, deadline } = req.body;

    if (!courseId || !String(title || "").trim()) {
      return res.status(400).json({ message: "Course and task title are required" });
    }

    const hasAccess = await canManageCourse(courseId, req.user);
    if (!hasAccess) {
      return res.status(403).json({ message: "You can only manage tasks for your own courses" });
    }

    const task = await Task.create({
      courseId,
      title,
      description,
      deadline,
      createdBy: req.user.id,
    });

    await Progress.updateMany({ courseId }, { $inc: { totalTasks: 1 } });

    return res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: "Failed to create task" });
  }
};

export const submitTask = async (req, res) => {
  try {
    const { taskId, answer } = req.body;

    if (!taskId || !answer) {
      return res.status(400).json({ message: "TaskId and answer required" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const existingSubmission = task.submissions.find((entry) => entry.studentId.toString() === req.user.id);

    if (existingSubmission) {
      if (existingSubmission.status === "pass") {
        return res.status(400).json({ message: "Task already passed" });
      }

      existingSubmission.answer = answer;
      existingSubmission.status = "pending";
      existingSubmission.submittedAt = new Date();
    } else {
      task.submissions.push({
        studentId: req.user.id,
        answer,
        status: "pending",
        submittedAt: new Date(),
      });
    }

    await task.save();

    return res.json({ message: "Task submitted successfully" });
  } catch (error) {
    console.error("Submit task error:", error);
    return res.status(500).json({ message: "Failed to submit task" });
  }
};

export const gradeTask = async (req, res) => {
  try {
    const { taskId, submissionId, status, comment } = req.body;
    const normalizedStatus = normalizeGradeStatus(status);

    if (!taskId || !submissionId || !normalizedStatus) {
      return res.status(400).json({ message: "taskId, submissionId, and a valid status are required" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const hasAccess = await canManageCourse(task.courseId, req.user);
    if (!hasAccess) {
      return res.status(403).json({ message: "You can only verify submissions in your own courses" });
    }

    const submission = task.submissions.id(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    submission.status = normalizedStatus;
    submission.comment = comment;
    submission.isViewed = false;

    await task.save();
    await syncStudentTaskProgress(task.courseId, submission.studentId);

    return res.json({
      message: normalizedStatus === "pass" ? "Task verified successfully" : "Task marked for revision",
      status: normalizedStatus,
      submission,
    });
  } catch (error) {
    console.error("Grade task error:", error);
    return res.status(500).json({ message: "Failed to grade task" });
  }
};

export const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate("submissions.studentId", "name email");
    if (!task) return res.status(404).json({ message: "Task not found" });

    const hasAccess = await canManageCourse(task.courseId, req.user);
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied for this task" });
    }

    return res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    return res.status(500).json({ message: "Failed to fetch task" });
  }
};

export const getStudentTasks = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;
    const tasks = await Task.find({ courseId }).lean();
    let completedTasks = 0;

    const formattedTasks = tasks.map((task) => {
      const submissions = Array.isArray(task.submissions) ? task.submissions : [];
      const submission = submissions.find((entry) => entry.studentId?.toString() === studentId);

      if (submission?.status === "pass") {
        completedTasks += 1;
      }

      return {
        ...task,
        submission: submission || null,
      };
    });

    await Progress.findOneAndUpdate(
      { userId: studentId, courseId },
      {
        completedTasks,
        totalTasks: tasks.length,
      },
      { upsert: true, new: true }
    );

    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round((completedTasks / total) * 100);

    if (percent === 100) {
      const exists = await Certificate.findOne({ userId: studentId, courseId });
      if (!exists) {
        await Certificate.create({
          userId: studentId,
          courseId,
          issuedAt: new Date(),
        });
      }
    }

    return res.json({
      tasks: formattedTasks,
      completedTasks,
      totalTasks: tasks.length,
      percent,
      progress: percent,
    });
  } catch (error) {
    console.error("getStudentTasks error:", error);
    return res.status(500).json({ message: "Failed to load student tasks" });
  }
};

export const getTeacherTasks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const hasAccess = await canManageCourse(courseId, req.user);

    if (!hasAccess) {
      return res.status(403).json({
        message: "You can only view task submissions for your own courses",
      });
    }

    const tasks = await Task.find({ courseId })
      .populate("submissions.studentId", "name email")
      .sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (error) {
    console.error("Teacher task fetch error:", error);
    return res.status(500).json({ message: "Failed to fetch teacher tasks" });
  }
};

export const getTeacherSubmissionInbox = async (req, res) => {
  try {
    const statusFilter = String(req.query.status || "all").trim().toLowerCase();
    const managedCourseIds = await getTeacherManagedCourseIds(req.user);

    if (Array.isArray(managedCourseIds) && managedCourseIds.length === 0) {
      return res.json([]);
    }

    const query = {
      "submissions.0": { $exists: true },
      ...(Array.isArray(managedCourseIds) ? { courseId: { $in: managedCourseIds } } : {}),
    };

    const tasks = await Task.find(query)
      .populate("courseId", "title")
      .populate("submissions.studentId", "name email")
      .lean();

    const items = [];

    tasks.forEach((task) => {
      const submissions = Array.isArray(task.submissions) ? task.submissions : [];

      submissions.forEach((submission) => {
        const normalizedStatus = normalizeSubmissionStatus(submission.status);
        if (statusFilter !== "all" && statusFilter !== normalizedStatus) return;

        items.push({
          taskId: task._id,
          taskTitle: task.title || "Untitled Task",
          taskDescription: task.description || "",
          taskDeadline: task.deadline || null,
          courseId: task.courseId?._id || task.courseId || null,
          courseTitle: task.courseId?.title || "Untitled Course",
          submissionId: submission._id,
          status: normalizedStatus,
          answer: submission.answer || submission.answerText || "",
          comment: submission.comment || "",
          submittedAt: submission.submittedAt || null,
          studentId: submission.studentId?._id || submission.studentId || null,
          studentName: submission.studentId?.name || "Unknown Student",
          studentEmail: submission.studentId?.email || "",
        });
      });
    });

    items.sort((a, b) => {
      const rank = (status) => {
        if (status === "pending") return 0;
        if (status === "fail") return 1;
        if (status === "pass") return 2;
        return 3;
      };

      const byStatus = rank(a.status) - rank(b.status);
      if (byStatus !== 0) return byStatus;

      const timeA = new Date(a.submittedAt || 0).getTime();
      const timeB = new Date(b.submittedAt || 0).getTime();
      return timeB - timeA;
    });

    return res.json(items);
  } catch (error) {
    console.error("Teacher inbox fetch error:", error);
    return res.status(500).json({ message: "Failed to fetch submission inbox" });
  }
};

export const getStudentNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;

    const tasks = await Task.find({
      submissions: {
        $elemMatch: {
          studentId,
          status: { $in: ["pass", "fail"] },
          isViewed: false,
        },
      },
    });

    return res.json({ count: tasks.length });
  } catch (error) {
    console.error("Notification error:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markTaskAsRead = async (req, res) => {
  try {
    const { taskId } = req.params;
    const studentId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const submission = task.submissions.find((entry) => entry.studentId.toString() === studentId);
    if (submission) {
      submission.isViewed = true;
      await task.save();
    }

    return res.json({ message: "Marked as read" });
  } catch (error) {
    console.error("Mark task as read error:", error);
    return res.status(500).json({ message: "Failed to update task" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, deadline } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const hasAccess = await canManageCourse(task.courseId, req.user);
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied for this course task" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { title, description, deadline },
      { new: true }
    );

    return res.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ message: "Failed to update task" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const hasAccess = await canManageCourse(task.courseId, req.user);
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied for this course task" });
    }

    await Task.findByIdAndDelete(taskId);
    await Progress.updateMany({ courseId: task.courseId }, { $inc: { totalTasks: -1 } });

    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ message: "Failed to delete task" });
  }
};
