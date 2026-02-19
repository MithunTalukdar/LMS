import Course from "../models/Course.js";
import Progress from "../models/Progress.js";

const normalizeLevel = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "beginner") return "Beginner";
  if (raw === "intermediate") return "Intermediate";
  if (raw === "advanced") return "Advanced";
  return "Beginner";
};

const normalizeStringList = (value) => {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[\n,]/)
      : [];

  const cleaned = source.map((item) => String(item || "").trim()).filter(Boolean);
  return [...new Set(cleaned)];
};

const getTeacherFilter = (user) => {
  if (user?.role === "admin") return {};
  return { $or: [{ instructor: user.id }, { teacher: user.id }] };
};

const findEditableCourse = async (courseId, user) => {
  if (user?.role === "admin") {
    return Course.findById(courseId);
  }

  return Course.findOne({
    _id: courseId,
    $or: [{ instructor: user.id }, { teacher: user.id }],
  });
};

/* All courses */
export const getAllCourses = async (_req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1, _id: -1 });
    res.json(courses);
  } catch {
    res.status(500).json({ message: "Failed to load courses" });
  }
};

/* Teacher/Admin own courses */
export const getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find(getTeacherFilter(req.user)).sort({ createdAt: -1, _id: -1 });
    res.json(courses);
  } catch {
    res.status(500).json({ message: "Failed to load teacher courses" });
  }
};

/* Create course */
export const createCourse = async (req, res) => {
  try {
    const { title, description, level, duration, topics, tasks } = req.body || {};

    const cleanTitle = String(title || "").trim();
    const cleanDescription = String(description || "").trim();

    if (!cleanTitle || !cleanDescription) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newCourse = await Course.create({
      title: cleanTitle,
      description: cleanDescription,
      level: normalizeLevel(level),
      duration: String(duration || "").trim() || "Self-paced",
      topics: normalizeStringList(topics),
      tasks: normalizeStringList(tasks),
      instructor: req.user.id,
      teacher: req.user.id,
      students: [],
    });

    res.status(201).json(newCourse);
  } catch {
    res.status(500).json({ message: "Failed to create course" });
  }
};

/* Add one topic to a teacher course */
export const addCourseTopic = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const topic = String(req.body?.topic || "").trim();

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const course = await findEditableCourse(courseId, req.user);
    if (!course) {
      return res.status(404).json({ message: "Course not found or access denied" });
    }

    if (!Array.isArray(course.topics)) {
      course.topics = [];
    }

    if (!course.topics.includes(topic)) {
      course.topics.push(topic);
      await course.save();
    }

    res.json(course);
  } catch {
    res.status(500).json({ message: "Failed to add topic" });
  }
};

/* Enroll course */
export const enrollCourse = async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    const exists = await Progress.findOne({ userId, courseId });
    if (exists) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    const progress = await Progress.create({
      userId,
      courseId,
      completedLessons: 0,
      totalLessons: 10,
    });

    res.status(201).json(progress);
  } catch {
    res.status(500).json({ message: "Failed to enroll course" });
  }
};

/* Student enrolled courses */
export const getEnrolledCourses = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.params.userId }).populate("courseId");
    const courses = progress.map((item) => item.courseId).filter(Boolean);
    res.json(courses);
  } catch {
    res.status(500).json({ message: "Failed to load enrolled courses" });
  }
};
