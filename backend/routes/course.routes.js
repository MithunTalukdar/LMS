import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  addCourseTopic,
  createCourse,
  enrollCourse,
  getAllCourses,
  getEnrolledCourses,
  getTeacherCourses,
} from "../controllers/course.controller.js";

const router = express.Router();

router.post("/", protect(["teacher", "admin"]), createCourse);
router.get("/", protect(), getAllCourses);
router.get("/teacher", protect(["teacher", "admin"]), getTeacherCourses);
router.get("/enrolled/:userId", protect(), getEnrolledCourses);
router.post("/enroll", protect(), enrollCourse);
router.post("/:courseId/topics", protect(["teacher", "admin"]), addCourseTopic);

export default router;
