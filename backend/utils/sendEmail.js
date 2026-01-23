import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  let transporter;

  // Check if credentials exist
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.error("❌ SMTP Error: SMTP_EMAIL or SMTP_PASSWORD is missing in environment variables.");
  }

  // Option 1: Use a Service (SendGrid, Mailgun, Gmail) if SMTP_SERVICE is set
  if (process.env.SMTP_SERVICE) {
    transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      // Production fixes for Render timeouts
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 15000,
      dnsTimeout: 10000,
      family: 4, // Force IPv4 to avoid resolution issues common on Render
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
      // Production fixes for Render timeouts
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 15000,
      dnsTimeout: 10000,
      family: 4, // Force IPv4 to avoid resolution issues common on Render
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

  const MAX_RETRIES = 3;
  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      await transporter.sendMail(message);
      console.log(`✅ Email sent successfully on attempt ${i}`);
      return; // Exit function on success
    } catch (error) {
      const isLastAttempt = i === MAX_RETRIES;
      console.warn(`⚠️ Email attempt ${i} failed: ${error.code || error.message}`);
      
      if (isLastAttempt) {
        console.error(`❌ All ${MAX_RETRIES} email attempts failed.`);
        throw error; // Re-throw the error so the controller can handle it
      }

      // Wait before retrying: 2s, 4s, etc. (Exponential Backoff)
      const delay = i * 2000;
      console.log(`🔄 Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default sendEmail;