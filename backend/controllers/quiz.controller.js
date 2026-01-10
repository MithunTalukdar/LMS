import Quiz from "../models/Quiz.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";
import QuizAttempt from "../models/QuizAttempt.js";
import QuizResult from "../models/QuizResult.js";

/**
 * Get quiz questions for a course
 */
export const getQuizByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const questions = await Quiz.find({ courseId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

/**
 * Submit quiz answers and auto-update progress + certificate
 */
export const submitQuiz = async (req, res) => {
  try {
    const { userId, courseId, answers } = req.body;

    const alreadyAttempted = await QuizAttempt.findOne({ userId, courseId });
    if (alreadyAttempted) {
      return res.status(400).json({ message: "Quiz already attempted" });
    }

    const questions = await Quiz.find({ courseId });

    let score = 0;
    questions.forEach((q, i) => {
      if (q.correctAnswer === answers[i]) score++;
    });

    await QuizAttempt.create({
      userId,
      courseId,
      score,
      attemptedAt: new Date()
    });

    // ✅ CREATE progress if not exists
    let progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      progress = await Progress.create({
        userId,
        courseId,
        completedLessons: 1,
        totalLessons: questions.length
      });
    } else {
      progress.completedLessons += 1;
      await progress.save();
    }

    res.json({
      score,
      total: questions.length,
      progress: progress.completedLessons
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Quiz submission failed" });
  }
};