import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  loginOtp: String,
  loginOtpExpire: Date,
  lastOtpVerification: Date,
  lastOtpResentAt: Date,
  lastPasswordResetRequestAt: Date
});

export default mongoose.model("User", userSchema);
