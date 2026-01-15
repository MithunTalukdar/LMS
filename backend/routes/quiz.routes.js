import express from "express";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { protect } from "../middleware/auth.middleware.js";
import { getQuizByCourse, submitQuiz } from "../controllers/quiz.controller.js";

const router = express.Router();

/* 👨‍🏫 Teacher creates quiz question */
router.post(
  "/",
  protect(["teacher"]),
  async (req, res) => {
    try {
      const { courseId, question, options, correctAnswer } = req.body;

      if (!courseId || !question || !options || correctAnswer === undefined) {
        return res.status(400).json({ message: "All fields required" });
      }

      const quiz = await Quiz.create({
        courseId,
        question,
        options,
        correctAnswer
      });

      res.status(201).json(quiz);
    } catch (err) {
      res.status(500).json({ message: "Failed to create quiz" });
    }
  }
);


/* 🧪 Get raw quiz questions (Teacher View) */
router.get("/questions/:courseId", protect(["teacher", "admin"]), async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
});

router.get("/:courseId", protect(), getQuizByCourse)
router.post("/submit", protect(["student"]), submitQuiz)

router.get(
  "/teacher/:courseId",
  protect(["teacher", "admin"]),
  async (req, res) => {
    try{
    const attempts = await QuizAttempt.find({
      courseId: req.params.courseId
    }).populate("userId", "name email");

    res.json(attempts);
  } catch(error){
    res.status(500).json({ message: "Failed to fetch quiz attempts" });
   }
  }
);


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
