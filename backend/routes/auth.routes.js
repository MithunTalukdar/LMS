import express from "express";
import passport from "passport";
import crypto from "crypto";
import { register, login, getMe, verifyLoginOtp } from "../controllers/auth.controller.js";
import { forgotPassword, resetPassword } from "../controllers/password.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import jwt from "jsonwebtoken";
import "../config/passport.js"; // ✅ Import passport config to register the strategy

const router = express.Router();
const pendingLogins = new Map(); // Store temporary login codes

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect(), getMe);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/verify-otp", verifyLoginOtp);

// Initiate Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

// Handle Google Callback
router.get(
  "/google/callback",
  (req, res, next) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    passport.authenticate("google", { session: false, failureRedirect: `${clientUrl}/login` })(req, res, next);
  },
  (req, res) => {
    // Generate token here if not already attached by strategy
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    // Generate a secure random code
    const code = crypto.randomBytes(16).toString("hex");

    // Store the token mapped to this code (expires in 60 seconds)
    pendingLogins.set(code, token);
    setTimeout(() => pendingLogins.delete(code), 60000);

    // Redirect to the frontend callback page with the token
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/google/callback?code=${code}`);
  }
);

// Exchange the code for the actual token
router.post("/google/success", (req, res) => {
  const { code } = req.body;
  const token = pendingLogins.get(code);

  if (!token) return res.status(400).json({ message: "Invalid or expired code" });

  pendingLogins.delete(code); // Invalidate code immediately after use
  res.json({ token });
});

// 🛠️ TEMPORARY DEBUG ROUTE: Visit /api/auth/check-env to see the value
router.get("/check-env", (req, res) => {
  res.json({ CLIENT_URL: process.env.CLIENT_URL || "Variable is not defined" });
});

export default router;
