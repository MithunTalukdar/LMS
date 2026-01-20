import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js"; // ✅ Ensure this path matches your User model
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const callbackURL = process.env.GOOGLE_CALLBACK_URL;

// 🔥 DEBUGGING: This will print the exact URL your server is using
console.log("---------------------------------------------------");
console.log("🔑 GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Set" : "Missing");
console.log("🔗 GOOGLE_CALLBACK_URL:", callbackURL);
console.log("---------------------------------------------------");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // Create new user if not found
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: Date.now().toString(), // Dummy password for OAuth users
            role: "student", // Default role
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);