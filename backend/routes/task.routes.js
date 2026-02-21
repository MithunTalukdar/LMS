// routes/task.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import Task from "../models/Task.js";
import {
  createTask,
  submitTask,
  gradeTask,
  getStudentTasks,
  getTeacherTasks,
  getTeacherSubmissionInbox,
  getTask,
  getStudentNotifications,
  markTaskAsRead,
  updateTask,
  deleteTask
} from "../controllers/task.controller.js";

const router = express.Router();

/* 👨‍🏫 Teacher creates task */
router.post("/", protect(["teacher"]), createTask);

/* 👨‍🎓 Student submits task */
router.post("/submit", protect(["student"]), submitTask);

/* 👨‍🏫 Teacher grades task */
router.post("/grade", protect(["teacher"]), gradeTask);

/* 👨‍🎓 Student sees tasks */
router.get("/student/:courseId", protect(["student"]), getStudentTasks);

/* 👨‍🏫 Teacher sees single task + submissions */
router.get("/teacher/single/:taskId", protect(["teacher", "admin"]), getTask);

/* 👨‍🏫 Teacher submission inbox across managed courses */
router.get("/teacher/submissions", protect(["teacher", "admin"]), getTeacherSubmissionInbox);

/* 👨‍🏫 Teacher sees tasks + student submissions */
router.get(
  "/teacher/:courseId",
  protect(["teacher", "admin"]),
  getTeacherTasks
);

/* 🔔 Notifications */
router.get("/notifications", protect(["student"]), getStudentNotifications);
router.put("/:taskId/read", protect(["student"]), markTaskAsRead);

/* ✏️ Edit & Delete Task */
router.put("/:taskId", protect(["teacher"]), updateTask);
router.delete("/:taskId", protect(["teacher"]), deleteTask);

export default router;
