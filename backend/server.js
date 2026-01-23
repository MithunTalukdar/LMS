import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";

import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import seedCourses from "./utils/seedCourses.js";
import certificateRoutes from "./routes/certificate.routes.js";
import { verifyConnection } from "./utils/sendEmail.js";
import userRoutes from "./routes/user.routes.js";

import adminRoutes from "./routes/admin.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import taskRoutes from "./routes/task.routes.js";




dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quiz", quizRoutes);

app.use("/api/certificates", certificateRoutes);
app.use("/api/tasks", taskRoutes);

// Health Check for Render
app.get("/", (req, res) => res.send("Server is running..."));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    console.log("------------------------------------------------");
    console.log("🚀 Server Startup Checks (Render Mode):");
    console.log(`✅ CLIENT_URL: ${process.env.CLIENT_URL || "NOT SET (Using default)"}`);
    console.log(`✅ SMTP_SERVICE: ${process.env.SMTP_SERVICE || "NOT SET"}`);
    console.log(`✅ SMTP_HOST: ${process.env.SMTP_HOST || "MISSING ❌"}`);
    console.log(`✅ SMTP_PORT: ${process.env.SMTP_PORT || "MISSING ❌"}`);
    console.log(`✅ SMTP_EMAIL: ${process.env.SMTP_EMAIL || "MISSING ❌"}`);
    console.log(`✅ SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? "SET (Hidden)" : "MISSING ❌"}`);
    console.log("------------------------------------------------");

    // Verify SMTP connection on startup to catch production issues early
    try {
      await verifyConnection();
    } catch (emailError) {
      console.error("⚠️ Email service verification failed. Check your SMTP credentials and network settings.");
    }

    await seedCourses();   // 🔥 AUTO ADD COURSES
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })

  .catch(err => console.log(err));
