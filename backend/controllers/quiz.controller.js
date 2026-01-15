import Quiz from "../models/Quiz.js";
import Progress from "../models/Progress.js";
import QuizAttempt from "../models/QuizAttempt.js";


export const getQuizByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // 1️⃣ Check progress
    const progress = await Progress.findOne({ userId, courseId });

    // Calculate percent
    let percent = 0;
    if (progress) {
      const total = (progress.totalTasks || 0) + (progress.totalLessons || 0);
      const completed = (progress.completedTasks || 0) + (progress.completedLessons || 0);
      percent = total === 0 ? 100 : Math.round((completed / total) * 100);
    }

    if (
      !progress ||
      (progress.totalTasks > 0 && progress.completedTasks !== progress.totalTasks)
    ) {
      return res.json({
        locked: true,
        message: "Complete all tasks to unlock quiz",
        percent,
        progress: percent
      });
    }

    // 2️⃣ Load quiz questions
    const questions = await Quiz.find({ courseId });

    // 3️⃣ Check if already attempted
    const attempt = await QuizAttempt.findOne({ userId, courseId });

    if (attempt) {
      // If new questions were added (questions > answers), allow user to continue
      if (questions.length > attempt.answers.length) {
        return res.json({
          attempted: false,
          questions,
          previousAnswers: attempt.answers, // Send previous answers to frontend
          score: attempt.score,
          percent,
          progress: percent
        });
      }

      return res.json({ attempted: true, score: attempt.score, percent, progress: percent });
    }

    res.json({
      attempted: false,
      questions,
      percent,
      progress: percent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load quiz" });
  }
};


/**
 * Submit quiz answers and update progress*/

export const submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, answers } = req.body;

    const questions = await Quiz.find({ courseId });
    let attempt = await QuizAttempt.findOne({ userId, courseId });

    // If attempt exists and no new questions, block
    if (attempt && attempt.answers.length === questions.length) {
       return res.status(400).json({ message: "Quiz already submitted" });
    }

    let score = 0;
    questions.forEach((q, i) => {
      if (q.correctAnswer === answers[i]) score++;
    });

    // ✅ Save quiz attempt
    if (attempt) {
      attempt.answers = answers;
      attempt.score = score;
      attempt.attemptedAt = new Date();
      await attempt.save();
    } else {
      await QuizAttempt.create({
        userId,
        courseId,
        answers,
        score,
        attemptedAt: new Date()
      });
    }

    // ✅ Find or create progress
    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      progress = await Progress.create({
        userId,
        courseId,
        completedTasks: 0,
        totalTasks: 0,
        quizScore: score
      });
    } else {
      progress.quizScore = score;
      await progress.save();
    }

    res.json({
      score,
      total: questions.length,
      quizScore: score
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Quiz submission failed" });
  }
};
