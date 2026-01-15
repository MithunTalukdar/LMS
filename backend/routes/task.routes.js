// routes/task.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import Task from "../models/Task.js";
import {
  createTask,
  submitTask,
  gradeTask,
  getStudentTasks,
  getTeacherTasks
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

/* 👨‍🏫 Teacher sees tasks + student submissions */
router.get(
  "/teacher/:courseId",
  protect(["teacher", "admin"]),
  getTeacherTasks
);

export default router;
