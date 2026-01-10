import express from "express";
import Progress from "../models/Progress.js";
import Course from "../models/Course.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * 📊 Teacher/Admin Analytics (course-wise)
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

router.get(
  "/analytics",
  protect(["teacher", "admin"]),
  async (req, res) => {
    try {
      const data = await Progress.aggregate([
        {
          $group: {
            _id: "$courseId",
            averageProgress: {
              $avg: {
                $multiply: [
                  { $divide: ["$completedLessons", "$totalLessons"] },
                  100
                ]
              }
            }
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
