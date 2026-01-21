import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 🚫 Skip email if SMTP not configured
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_EMAIL ||
    !process.env.SMTP_PASSWORD
  ) {
    console.warn("⚠️ SMTP not configured. Skipping email.");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || `"LMS Support" <no-reply@lms.com>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    });

    console.log("✅ Email sent:", options.email);
  } catch (error) {
    console.error("❌ Email failed:", error.message);

    // ❗ NEVER crash production app for email
    if (process.env.NODE_ENV !== "production") {
      throw error;
    }
  }
};

export default sendEmail;
