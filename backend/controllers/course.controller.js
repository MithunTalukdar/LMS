import Course from "../models/Course.js";
import Progress from "../models/Progress.js";

/* ✅ All courses */
export const getAllCourses = async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
};

/* ✅ Courses teacher created */
export const getTeacherCourses = async (req, res) => {
  const courses = await Course.find({ instructor: req.user.id });
  res.json(courses);
};


export const enrollCourse = async (req, res) => {
  const { courseId, userId } = req.body;

  // prevent duplicate enroll
  const exists = await Progress.findOne({ userId, courseId });
  if (exists) {
    return res.status(400).json({ message: "Already enrolled" });
  }

  const progress = await Progress.create({
    userId,
    courseId,
    completedLessons: 0,
    totalLessons: 10 // default, you can change later
  });

  res.status(201).json(progress);
};


/* ✅ Courses student enrolled */
export const getEnrolledCourses = async (req, res) => {
  const progress = await Progress.find({ userId: req.params.userId })
    .populate("courseId");

  const courses = progress.map(p => p.courseId);
  res.json(courses);
};
