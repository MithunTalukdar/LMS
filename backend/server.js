import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import seedCourses from "./utils/seedCourses.js";
import certificateRoutes from "./routes/certificate.routes.js";
import userRoutes from "./routes/user.routes.js";

import adminRoutes from "./routes/admin.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import taskRoutes from "./routes/task.routes.js";




dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quiz", quizRoutes);

app.use("/api/certificates", certificateRoutes);
app.use("/api/tasks", taskRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await seedCourses();   // 🔥 AUTO ADD COURSES
    app.listen(5000, () => console.log("Server running on 5000"));
  })

  .catch(err => console.log(err));
