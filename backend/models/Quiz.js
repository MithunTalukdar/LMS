import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  question: String,
  options: [String],
  correctAnswer: Number
});

export default mongoose.model("Quiz", quizSchema);
