import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  totalTasks: {
    type: Number,
    default: 0
  },
  quizScore: {
    type: Number,
    default: 0
  },
  certificateIssued: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("Progress", progressSchema);
