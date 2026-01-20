import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Normalize email to match auth controller logic
  const lowerEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: lowerEmail });

  if (!user) {
    // Try case-insensitive regex for legacy data
    user = await User.findOne({ email: { $regex: new RegExp(`^${lowerEmail}$`, 'i') } });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Get reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  try {
    await user.save();
  } catch (err) {
    console.error("❌ Database Save Error:", err);
    return res.status(500).json({ message: "Database error" });
  }

  // Create reset url
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n${resetUrl}`;

  try {
    const emailPromise = sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email sending timed out")), 20000)
    );

    await Promise.race([emailPromise, timeoutPromise]);

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.error("❌ Forgot Password Email FAILED:", err.message);
    if (err.response) console.error("📝 SMTP Response:", err.response);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    try {
      await user.save({ validateBeforeSave: false });
    } catch (saveErr) {
      console.error("⚠️ Failed to clear reset token:", saveErr.message);
    }

    return res.status(500).json({ message: "Email could not be sent" });
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
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({ success: true, data: "Password updated successfully" });
};