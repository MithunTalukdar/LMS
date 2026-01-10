import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  courseId: mongoose.Schema.Types.ObjectId,
  issuedAt: Date
});

export default mongoose.model("Certificate", certificateSchema);
