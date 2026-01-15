import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { 
  getMyCertificates, 
  getCertificateById, 
  getCertificateByCourse,
  downloadCertificate 
} from "../controllers/certificate.controller.js";

const router = express.Router();

/* 📜 Get all certificates for logged-in user */
router.get("/", protect(), getMyCertificates);

/* 🎓 Get certificate by Course ID */
router.get("/course/:courseId", protect(), getCertificateByCourse);

/* 🔍 Get specific certificate by ID */
router.get("/:id", protect(), getCertificateById);

/* 📥 Download certificate */
router.get("/download/:id", downloadCertificate);

export default router;
