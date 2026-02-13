import express from "express";
import passport from "passport";
import crypto from "crypto";
import { register, login, getMe, verifyLoginOtp, resendOtp, verifyRegisterOtp, resendRegistrationOtp } from "../controllers/auth.controller.js";
import { forgotPassword, resetPassword } from "../controllers/password.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import jwt from "jsonwebtoken";
import "../config/passport.js"; // ✅ Import passport config to register the strategy

const router = express.Router();
const pendingLogins = new Map(); // Store temporary login codes

const getClientUrl = () => {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL;
  if (process.env.NODE_ENV === "production") return null;
  return "http://localhost:5173";
};

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect(), getMe);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/verify-otp", verifyLoginOtp);
router.post("/resend-registration-otp", resendRegistrationOtp);
router.post("/verify-registration", verifyRegisterOtp);
router.post("/resend-otp", protect(), resendOtp);

// Initiate Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

// Handle Google Callback
router.get(
  "/google/callback",
  (req, res, next) => {
    const clientUrl = getClientUrl();
    if (!clientUrl) {
      return res.status(500).send("CLIENT_URL is not configured on the server.");
    }
    
    // Use a custom callback to debug why authentication fails
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error("❌ Google OAuth Error:", err);
        return res.redirect(`${clientUrl}/login?error=server_error`);
      }
      if (!user) {
        console.error("⚠️ Google OAuth Failed (No User):", info);
        return res.redirect(`${clientUrl}/login?error=auth_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
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
    const clientUrl = getClientUrl();
    if (!clientUrl) {
      return res.status(500).send("CLIENT_URL is not configured on the server.");
    }
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
  res.json({ 
    CLIENT_URL: process.env.CLIENT_URL || "Variable is not defined",
    BREVO_OTP_TEMPLATE_ID: process.env.BREVO_OTP_TEMPLATE_ID || "MISSING",
    BREVO_WELCOME_TEMPLATE_ID: process.env.BREVO_WELCOME_TEMPLATE_ID || "MISSING"
  });
});

export default router;
