import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.middleware.js";
import { getAllCourses } from "../controllers/course.controller.js";

const router = express.Router();

/* 👑 Get all users */
router.get("/users", protect(["admin"]), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

/* 🔁 Promote / Demote */
router.put("/role/:id", protect(["admin"]), async (req, res) => {
  const { role } = req.body;

  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ message: "Role updated" });
});

export default router;
