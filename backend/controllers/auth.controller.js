import User from "../models/User.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("🔹 Register Request:", req.body);

    if (!name || !email || !password) {
       return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Remove all whitespace/newlines to prevent copy-paste errors
    const lowerEmail = email ? email.toLowerCase().trim() : "";

    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: lowerEmail,
      password: hashed,
      role: role || "student",
      lastOtpVerification: Date.now() // Auto-verify first login to skip OTP email
    });

    console.log("✅ User registered:", user.email);

    // Send Welcome Email via Brevo
    try {
      await sendEmail({
        email: lowerEmail,
        templateId: process.env.BREVO_WELCOME_TEMPLATE_ID,
        params: { name, loginUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login` }
      });
    } catch (emailError) {
      console.error("❌ Welcome Email Error:", emailError.message);
      // Note: We don't fail the registration if the welcome email fails to send
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    console.log("🔹 Login Request:", req.body);

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Remove all whitespace/newlines to prevent copy-paste errors
    const lowerEmail = email ? email.toLowerCase().trim() : "";

    // 1. Try exact match (normalized)
    let user = await User.findOne({ email: lowerEmail });

    // 2. If not found, try case-insensitive regex (handles old/legacy data)
    if (!user) {
        user = await User.findOne({ email: { $regex: new RegExp(`^${lowerEmail}$`, 'i') } });
    }

    if (!user) {
      console.log("❌ Login failed: User not found for email:", lowerEmail);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Login failed: Password mismatch for user:", user.email);
      // Debug helper: Check if password looks unhashed
      if (!user.password.startsWith("$2")) {
          console.log("⚠️ WARNING: Stored password is not hashed. Please re-register this user.");
      }
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if OTP verification is needed (skip if verified within last 7 days)
    const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
    if (user.lastOtpVerification && (Date.now() - new Date(user.lastOtpVerification).getTime() < sevenDaysInMillis)) {
       const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: rememberMe ? "30d" : "1d" }
      );

      console.log("✅ Login successful (OTP skipped):", user.email);
      
      user.password = undefined; 
      return res.status(200).json({ 
          success: true, 
          token, 
          user 
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to user
    user.loginOtp = otp;
    user.loginOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send OTP via Email
    try {
      await sendEmail({
        email: lowerEmail,
        templateId: process.env.BREVO_OTP_TEMPLATE_ID,
        params: { otp }
      });

      console.log(`📧 OTP sent to ${lowerEmail}`);
      return res.status(200).json({
        success: true,
        requireOtp: true,
        message: "Verification code sent to your email",
        email: user.email
      });
    } catch (emailError) {
      console.error("❌ Email Service Error:", emailError.message);
      return res.status(500).json({ 
        message: "Failed to send verification email. Please try again later.", 
        error: emailError.message 
      });
    }
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp, rememberMe } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const lowerEmail = email ? email.toLowerCase().trim() : "";
    const user = await User.findOne({ 
      email: lowerEmail,
      loginOtp: otp,
      loginOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.loginOtp = undefined;
    user.loginOtpExpire = undefined;
    user.lastOtpVerification = Date.now();
    await user.save({ validateBeforeSave: false });

    // 🔥 AUTO ENROLL FIRST COURSE (DEMO MODE)
    // 🔥 AUTO ENROLL (DEMO MODE ONLY)
    if (process.env.AUTO_ENROLL === "true") {
      const firstCourse = await Course.findOne();

      if (firstCourse && !firstCourse.students.includes(user._id)) {
        firstCourse.students.push(user._id);
        await firstCourse.save();

        const existingProgress = await Progress.findOne({
          userId: user._id,
          courseId: firstCourse._id
        });

        if (!existingProgress) {
          await Progress.create({
            userId: user._id,
            courseId: firstCourse._id,
            completedLessons: 0,
            totalLessons: 5
          });
        }
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1d" }
    );

    console.log("✅ Login successful:", user.email);
    
    // Send success flag and exclude password from response
    user.password = undefined; 
    res.status(200).json({ 
        success: true, 
        token, 
        user 
    });
  } catch (err) {
    console.error("❌ Verify OTP Error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to user
    user.loginOtp = otp;
    user.loginOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send OTP via Email
    try {
      await sendEmail({
        email: user.email,
        templateId: process.env.BREVO_OTP_TEMPLATE_ID,
        params: { otp }
      });

      res.status(200).json({ message: "Verification code sent" });
    } catch (emailError) {
      console.error("❌ Resend OTP Email Error:", emailError.message || emailError);
      return res.status(500).json({ message: "Email service unavailable" });
    }
  } catch (err) {
    console.error("❌ Resend OTP Error:", err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

// Add this to your existing imports if needed, or ensure User is imported
// import User from "../models/User.js";

export const getMe = async (req, res) => {
  try {
    // req.user is set by the 'protect' middleware. Token payload uses 'id'.
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("getMe Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
