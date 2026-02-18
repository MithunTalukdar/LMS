import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  topic: {
    type: String,
    trim: true,
    default: "General"
  },
  question: String,
  options: [String],
  correctAnswer: Number
});

export default mongoose.model("Quiz", quizSchema);
