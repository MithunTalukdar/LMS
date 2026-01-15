import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import PDFDocument from "pdfkit";

// 📜 Get all certificates for the logged-in user
export const getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.user.id })
      .populate("courseId", "title description thumbnail");
    res.json(certs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
};

// 🔍 Get specific certificate by ID
export const getCertificateById = async (req, res) => {
  try {
    let cert = await Certificate.findById(req.params.id)
      .populate("userId", "name email")
      .populate("courseId", "title");
      
    // 🕵️‍♀️ Fallback: If not found by Cert ID, try finding by Course ID for this user
    if (!cert) {
      cert = await Certificate.findOne({ courseId: req.params.id, userId: req.user.id })
        .populate("userId", "name email")
        .populate("courseId", "title");
    }

    if (!cert) return res.status(404).json({ message: "Certificate not found" });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🎓 Get certificate by Course ID (for the logged-in user)
export const getCertificateByCourse = async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      userId: req.user.id,
      courseId: req.params.courseId
    }).populate("courseId", "title");

    if (!cert) return res.status(404).json({ message: "Certificate not found for this course" });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📥 Download certificate as PDF
export const downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    const user = await User.findById(cert.userId);
    const course = await Course.findById(cert.courseId);

    const doc = new PDFDocument({ size: "A4", layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate-${cert._id}.pdf`
    );

    doc.pipe(res);

    // Design
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f0f9ff");
    doc.strokeColor("#2563eb").lineWidth(20).rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

    doc.fillColor("#1e3a8a").fontSize(40).text("CERTIFICATE OF COMPLETION", 0, 150, { align: "center" });
    doc.moveDown();
    doc.fillColor("#000000").fontSize(20).text("This is to certify that", { align: "center" });
    doc.moveDown();
    doc.fillColor("#2563eb").fontSize(30).text(user.name, { align: "center" });
    doc.moveDown();
    doc.fillColor("#000000").fontSize(20).text("has successfully completed the course", { align: "center" });
    doc.moveDown();
    doc.fillColor("#2563eb").fontSize(25).text(course.title, { align: "center" });
    doc.moveDown(2);
    doc.fillColor("#6b7280").fontSize(15).text(`Issued on: ${new Date(cert.issuedAt).toLocaleDateString()}`, { align: "center" });

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: "Failed to generate PDF" });
  }
};
