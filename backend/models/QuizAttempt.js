import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  courseId: mongoose.Schema.Types.ObjectId,
  score: Number,
  attemptedAt: Date
});

export default mongoose.model("QuizAttempt", quizAttemptSchema);
