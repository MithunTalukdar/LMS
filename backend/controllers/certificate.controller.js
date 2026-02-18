import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import PDFDocument from "pdfkit";

const formatIssuedDate = value => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
};

const safeText = (value, fallback) => {
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim();
  return cleaned || fallback;
};

const drawCornerAccents = (doc, pageWidth, pageHeight) => {
  const margin = 58;
  const size = 24;

  doc
    .lineWidth(2)
    .strokeColor("#b88a2b")
    .moveTo(margin, margin + size)
    .lineTo(margin, margin)
    .lineTo(margin + size, margin)
    .stroke();

  doc
    .moveTo(pageWidth - margin - size, margin)
    .lineTo(pageWidth - margin, margin)
    .lineTo(pageWidth - margin, margin + size)
    .stroke();

  doc
    .moveTo(margin, pageHeight - margin - size)
    .lineTo(margin, pageHeight - margin)
    .lineTo(margin + size, pageHeight - margin)
    .stroke();

  doc
    .moveTo(pageWidth - margin - size, pageHeight - margin)
    .lineTo(pageWidth - margin, pageHeight - margin)
    .lineTo(pageWidth - margin, pageHeight - margin - size)
    .stroke();
};

const drawSeal = (doc, centerX, centerY) => {
  doc.save();
  doc.circle(centerX, centerY, 42).fillAndStroke("#0f2a47", "#b88a2b");
  doc.circle(centerX, centerY, 34).fillAndStroke("#fffdf7", "#b88a2b");

  doc
    .fillColor("#0f2a47")
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("LMS VERIFIED", centerX - 24, centerY - 4, {
      width: 48,
      align: "center"
    });

  doc.fillColor("#b88a2b");
  for (let i = 0; i < 10; i += 1) {
    const angle = Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? 12 : 5;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY - 2 + Math.sin(angle) * radius;

    if (i === 0) {
      doc.moveTo(x, y);
    } else {
      doc.lineTo(x, y);
    }
  }
  doc.closePath().fill();
  doc.restore();
};

const drawCertificate = (doc, data) => {
  const { studentName, courseTitle, issuedDate, certificateNo } = data;
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  doc.rect(0, 0, pageWidth, pageHeight).fill("#f8f6f1");

  for (let i = 0; i < 6; i += 1) {
    doc
      .lineWidth(0.3)
      .strokeColor("#efe7d2")
      .moveTo(0, 100 + i * 90)
      .lineTo(pageWidth, 100 + i * 90)
      .stroke();
  }

  doc
    .lineWidth(2)
    .strokeColor("#0f2a47")
    .rect(22, 22, pageWidth - 44, pageHeight - 44)
    .stroke();

  doc
    .lineWidth(0.8)
    .strokeColor("#b88a2b")
    .rect(34, 34, pageWidth - 68, pageHeight - 68)
    .stroke();

  doc
    .lineWidth(0.7)
    .strokeColor("#0f2a47")
    .dash(3, { space: 2 })
    .rect(44, 44, pageWidth - 88, pageHeight - 88)
    .stroke()
    .undash();

  drawCornerAccents(doc, pageWidth, pageHeight);

  doc.save();
  doc
    .fillColor("#0f2a47")
    .opacity(0.04)
    .font("Helvetica-Bold")
    .fontSize(125)
    .rotate(-24, { origin: [pageWidth / 2, pageHeight / 2] })
    .text("LMS", pageWidth / 2 - 150, pageHeight / 2 - 70, {
      width: 300,
      align: "center"
    });
  doc.restore();

  doc
    .roundedRect(pageWidth / 2 - 162, 58, 324, 28, 14)
    .fill("#0f2a47");

  doc
    .fillColor("#f8e9c4")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("CERTIFIED LEARNING ACHIEVEMENT", pageWidth / 2 - 162, 67, {
      width: 324,
      align: "center"
    });

  doc
    .fillColor("#0f2a47")
    .font("Times-Bold")
    .fontSize(46)
    .text("Certificate", 0, 124, { align: "center" });

  doc
    .fillColor("#b88a2b")
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("OF COMPLETION", 0, 172, {
      align: "center",
      characterSpacing: 2
    });

  doc
    .fillColor("#4b5563")
    .font("Helvetica")
    .fontSize(16)
    .text("This certificate is proudly presented to", 0, 222, {
      align: "center"
    });

  doc
    .fillColor("#0f2a47")
    .font("Times-BoldItalic")
    .fontSize(38)
    .text(studentName, 90, 258, {
      width: pageWidth - 180,
      align: "center"
    });

  doc.font("Times-BoldItalic").fontSize(38);
  const nameWidth = doc.widthOfString(studentName);
  const underlineWidth = Math.min(Math.max(nameWidth + 48, 280), pageWidth - 220);
  const underlineX = (pageWidth - underlineWidth) / 2;
  const underlineY = 311;

  doc
    .lineWidth(1.1)
    .strokeColor("#b88a2b")
    .moveTo(underlineX, underlineY)
    .lineTo(underlineX + underlineWidth, underlineY)
    .stroke();

  doc
    .fillColor("#374151")
    .font("Helvetica")
    .fontSize(15)
    .text("for outstanding performance and successful completion of", 0, 328, {
      align: "center"
    });

  doc
    .fillColor("#0f2a47")
    .font("Helvetica-Bold")
    .fontSize(26)
    .text(courseTitle, 90, 358, {
      width: pageWidth - 180,
      align: "center"
    });

  doc.roundedRect(94, 424, pageWidth - 188, 66, 12).fillAndStroke("#fffdf7", "#d4c08c");

  doc
    .fillColor("#6b7280")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("ISSUE DATE", 118, 439);

  doc
    .fillColor("#111827")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(issuedDate, 118, 456);

  doc
    .fillColor("#6b7280")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("CERTIFICATE NO", pageWidth - 300, 439, {
      width: 170,
      align: "right"
    });

  doc
    .fillColor("#111827")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(certificateNo, pageWidth - 300, 456, {
      width: 170,
      align: "right"
    });

  drawSeal(doc, 112, 538);

  doc
    .lineWidth(1)
    .strokeColor("#9ca3af")
    .moveTo(pageWidth / 2 - 85, 540)
    .lineTo(pageWidth / 2 + 85, 540)
    .stroke();

  doc
    .fillColor("#374151")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("LMS Academic Board", pageWidth / 2 - 120, 547, {
      width: 240,
      align: "center"
    });

  doc
    .fillColor("#6b7280")
    .font("Helvetica")
    .fontSize(10)
    .text("Authorized Signature", pageWidth / 2 - 120, 563, {
      width: 240,
      align: "center"
    });
};

export const getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.user.id })
      .populate("courseId", "title description thumbnail");
    res.json(certs);
  } catch {
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    let cert = await Certificate.findById(req.params.id)
      .populate("userId", "name email")
      .populate("courseId", "title");

    if (!cert) {
      cert = await Certificate.findOne({ courseId: req.params.id, userId: req.user.id })
        .populate("userId", "name email")
        .populate("courseId", "title");
    }

    if (!cert) return res.status(404).json({ message: "Certificate not found" });
    res.json(cert);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getCertificateByCourse = async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      userId: req.user.id,
      courseId: req.params.courseId
    }).populate("courseId", "title");

    if (!cert) return res.status(404).json({ message: "Certificate not found for this course" });
    res.json(cert);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    const user = await User.findById(cert.userId);
    const course = await Course.findById(cert.courseId);
    if (!user || !course) {
      return res.status(404).json({ message: "Certificate data is incomplete" });
    }

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    const studentName = safeText(user.name, "Student");
    const courseTitle = safeText(course.title, "Course");
    const issuedDate = formatIssuedDate(cert.issuedAt);
    const certificateNo = `LMS-${String(cert._id).slice(-10).toUpperCase()}`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate-${cert._id}.pdf`
    );

    doc.pipe(res);

    drawCertificate(doc, {
      studentName,
      courseTitle,
      issuedDate,
      certificateNo
    });

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  }
};
