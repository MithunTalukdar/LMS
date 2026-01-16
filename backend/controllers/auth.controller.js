import User from "../models/User.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("🔹 Register Request:", req.body);

    if (!name || !email || !password) {
       return res.status(400).json({ message: "All fields are required" });
    }

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
      role: role || "student"
    });

    console.log("✅ User registered:", user.email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔹 Login Request:", req.body);

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

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
      { expiresIn: "1d" }
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
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Login failed" });
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
