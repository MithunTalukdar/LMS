import express from "express";
import Progress from "../models/Progress.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* 👨‍🏫 Teacher dashboard */
router.get("/progress", protect(["teacher", "admin"]), async (req, res) => {
  const data = await Progress.find()
    .populate("userId", "name email")
    .populate("courseId", "title");

  res.json(data);
});

export default router;
