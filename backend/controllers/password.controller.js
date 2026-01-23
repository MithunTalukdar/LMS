import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required" });
  }

  const lowerEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: lowerEmail });

  if (!user) {
    user = await User.findOne({
      email: { $regex: new RegExp(`^${lowerEmail}$`, "i") },
    });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  try {
    await user.save({ validateBeforeSave: false });
  } catch (err) {
    console.error("❌ Database Save Error:", err);
    return res.status(500).json({ message: "Database error" });
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n${resetUrl}`;

  try {
    console.log("📧 Sending password reset email...");
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });

    res.status(200).json({ success: true, message: "Email sent" });
  } catch (err) {
    console.error("❌ Forgot Password Email FAILED:", err.code === 'ETIMEDOUT' ? "Connection Timeout" : err.message);
    if (err.response) console.error("📝 SMTP Response:", err.response);
    
    // Rollback token if email fails to prevent "ghost" reset requests
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      message: "Email service unavailable. Please try again later.",
    });
  }
};

export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  if (!req.body.password) {
    return res.status(400).json({ message: "Password is required" });
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Password updated successfully" });
};
