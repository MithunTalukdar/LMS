import User from "../models/User.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "student"
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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

    res.json({ token, user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};
