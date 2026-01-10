import express from "express";
import PDFDocument from "pdfkit";
import Certificate from "../models/Certificate.js";

const router = express.Router();

router.get("/download/:id", async (req, res) => {
  const cert = await Certificate.findById(req.params.id).populate("userId courseId");

  const doc = new PDFDocument({ size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=certificate.pdf");

  doc.pipe(res);

  doc.fontSize(26).text("Certificate of Completion", { align: "center" });
  doc.moveDown();

  doc.fontSize(18).text(
    `This certifies that ${cert.userId.name} has successfully completed`,
    { align: "center" }
  );

  doc.moveDown();
  doc.fontSize(20).text(cert.courseId.title, { align: "center" });

  doc.moveDown(2);
  doc.fontSize(14).text("Issued by LMS Platform", { align: "center" });

  doc.end();
});

export default router;
