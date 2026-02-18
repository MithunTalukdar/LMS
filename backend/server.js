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
import seedQuizzes from "./utils/seedQuizzes.js";
import seedTasks from "./utils/seedTasks.js";
import certificateRoutes from "./routes/certificate.routes.js";
import userRoutes from "./routes/user.routes.js";

import adminRoutes from "./routes/admin.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import taskRoutes from "./routes/task.routes.js";




dotenv.config();
const app = express();
app.set("trust proxy", 1);

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
    console.log("------------------------------------------------");
    console.log("🚀 Server Startup Checks (Production Mode):");
    console.log(`✅ CLIENT_URL: ${process.env.CLIENT_URL || "NOT SET"}`);
    console.log(`✅ BREVO_API_KEY: ${process.env.BREVO_API_KEY ? "SET (Hidden)" : "MISSING ❌"}`);
    console.log(`✅ EMAIL_FROM: ${process.env.EMAIL_FROM || "MISSING ❌"}`);
    console.log(`✅ BREVO_OTP_TEMPLATE_ID: ${process.env.BREVO_OTP_TEMPLATE_ID || "Not Set (Using HTML Fallback) ⚠️"}`);
    console.log(`✅ BREVO_WELCOME_TEMPLATE_ID: ${process.env.BREVO_WELCOME_TEMPLATE_ID || "Not Set (Using HTML Fallback) ⚠️"}`);
    console.log("------------------------------------------------");

    console.log("------------------------------------------------");

    await seedCourses();
    await seedTasks();
    await seedQuizzes();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })

  .catch(err => console.log(err));
