// models/TaskSubmission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  answerText: String,
  fileUrl: String,

  submittedAt: Date,
  isLate: Boolean,

  status: {
    type: String,
    enum: ["pending", "passed", "failed"],
    default: "pending"
  }
});

export default mongoose.model("TaskSubmission", submissionSchema);
