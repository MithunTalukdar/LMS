import express from "express";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* 🧪 Get quiz questions */
router.get("/:courseId", protect(), async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
});

/* 📊 Teacher/Admin analytics */
router.get("/analytics", protect(["teacher", "admin"]), async (req, res) => {
  try {
    const stats = await QuizResult.aggregate([
      {
        $group: {
          _id: "$courseId",
          attempts: { $sum: 1 },
          avgScore: { $avg: "$score" }
        }
      }
    ]);

    res.json(
      stats.map(s => ({
        courseId: s._id,
        attempts: s.attempts,
        avgScore: Math.round(s.avgScore)
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

export default router;
