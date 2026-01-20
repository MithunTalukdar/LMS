import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  let transporter;

  // Option 1: Use a Service (SendGrid, Mailgun, Gmail) if SMTP_SERVICE is set
  if (process.env.SMTP_SERVICE) {
    transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Option 2: Use Generic SMTP (Host/Port)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT == "465",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Prevent using 'apikey' as the email address (common with SendGrid)
  const fromEmail = process.env.FROM_EMAIL || (process.env.SMTP_EMAIL && process.env.SMTP_EMAIL.includes("@") ? process.env.SMTP_EMAIL : "noreply@example.com");

  const message = {
    from: `${process.env.FROM_NAME || "LMS Support"} <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};

export default sendEmail;