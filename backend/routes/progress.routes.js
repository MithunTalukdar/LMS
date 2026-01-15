import express from "express";
import Progress from "../models/Progress.js";
import Course from "../models/Course.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * 📊 Student progress (used by StudentDashboard)
 */
router.get(
  "/user/:userId",
  protect(["student"]),
  async (req, res) => {
    const progress = await Progress.find({ userId: req.params.userId })
      .populate("courseId", "title");

    res.json(progress);
  }
);

/**
 * 📊 Teacher/Admin course-wise analytics
 */
router.get(
  "/course/:courseId",
  protect(["teacher", "admin"]),
  async (req, res) => {
    const progress = await Progress.find({ courseId: req.params.courseId })
      .populate("userId", "name email");

    res.json(progress);
  }
);

/**
 * 📈 Overall analytics
 */
router.get(
  "/analytics",
  protect(["teacher", "admin"]),
  async (req, res) => {
    try {
      const data = await Progress.aggregate([
        {
          $project: {
            courseId: 1,
            percent: {
              $cond: [
                { $eq: ["$totalTasks", 0] },
                0,
                {
                  $multiply: [
                    { $divide: ["$completedTasks", "$totalTasks"] },
                    100
                  ]
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: "$courseId",
            averageProgress: { $avg: "$percent" }
          }
        }
      ]);

      const formatted = await Promise.all(
        data.map(async d => {
          const course = await Course.findById(d._id);
          return {
            course: course?.title || "Unknown",
            averageProgress: Math.round(d.averageProgress)
          };
        })
      );

      res.json(formatted);
    } catch (err) {
      res.status(500).json({ message: "Analytics failed" });
    }
  }
);

export default router;
