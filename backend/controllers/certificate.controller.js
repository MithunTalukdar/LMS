import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import PDFDocument from "pdfkit";

// get certificates of a user
export const getCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.params.userId });
    res.json(certs);
  } catch {
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
};

// download certificate as PDF
export const downloadCertificate = async (req, res) => {
  const cert = await Certificate.findById(req.params.certId);
  const user = await User.findById(cert.userId);
  const course = await Course.findById(cert.courseId);

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=certificate.pdf"
  );

  doc.pipe(res);

  doc.fontSize(26).text("Certificate of Completion", { align: "center" });
  doc.moveDown(2);
  doc.fontSize(16).text("This certifies that", { align: "center" });
  doc.moveDown();
  doc.fontSize(20).text(user.name, { align: "center" });
  doc.moveDown();
  doc.fontSize(16).text("has successfully completed", { align: "center" });
  doc.moveDown();
  doc.fontSize(18).text(course.title, { align: "center" });

  doc.end();
};
