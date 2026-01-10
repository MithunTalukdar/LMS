import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect(["admin"]), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.put("/:id/role", protect(["admin"]), async (req, res) => {
  const { role } = req.body;
  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ message: "Role updated" });
});

export default router;
