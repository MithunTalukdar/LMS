import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  answers: [Number],
  score: Number,
  attemptedAt: Date
});

export default mongoose.model("QuizAttempt", quizAttemptSchema);
