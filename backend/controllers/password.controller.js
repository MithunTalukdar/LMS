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

  // Rate limiting: 60 seconds cooldown between reset requests
  const now = Date.now();
  const cooldown = 60 * 1000; // 60 seconds
  if (user.lastPasswordResetRequestAt && (now - new Date(user.lastPasswordResetRequestAt).getTime() < cooldown)) {
    const secondsLeft = Math.ceil((cooldown - (now - new Date(user.lastPasswordResetRequestAt).getTime())) / 1000);
    return res.status(429).json({ message: `Please wait ${secondsLeft} seconds before requesting another reset link.` });
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  user.lastPasswordResetRequestAt = now;

  try {
    await user.save({ validateBeforeSave: false });
  } catch (err) {
    console.error("❌ Database Save Error:", err);
    return res.status(500).json({ message: "Database error" });
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Hello ${user.name || 'User'},</p>
      <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
      <p>Please click the button below to reset your password. This link is valid for <strong>10 minutes</strong>:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset My Password</a>
      </div>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 0.8em; color: #777; text-align: center;">CodeLMS Team</p>
    </div>
  `;

  try {
    console.log("📧 Sending password reset email...");
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
      templateId: process.env.BREVO_RESET_PASSWORD_TEMPLATE_ID,
      params: { resetUrl, name: user.name }
    });

    res.status(200).json({ success: true, message: "Email sent" });
  } catch (err) {
    console.error("❌ Brevo Email Service Error:", err.message);
    
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

  const confirmationMessage = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #10b981;">Password Changed Successfully</h2>
      <p>Hello ${user.name},</p>
      <p>This is a confirmation that the password for your CodeLMS account has been successfully changed.</p>
      <p>If you did not perform this action, please contact our support team immediately.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 0.8em; color: #777; text-align: center;">CodeLMS Team</p>
    </div>
  `;

  // Send confirmation email
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Changed Successfully",
      message: confirmationMessage,
      templateId: process.env.BREVO_PASSWORD_CHANGED_TEMPLATE_ID,
      params: { name: user.name }
    });
  } catch (emailError) {
    console.error("❌ Password Changed Email Error:", emailError.message);
  }

  res.status(200).json({ success: true, message: "Password updated successfully" });
};
