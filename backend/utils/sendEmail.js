import nodemailer from "nodemailer";

// Initialize transporter outside the function to reuse connections (Production Best Practice)
let transporter;

const createTransporter = () => {
  const isService = !!process.env.SMTP_SERVICE;
  const port = parseInt(process.env.SMTP_PORT || "465"); // Default to 465 for production
  const isSecure = port === 465;

  const config = {
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    pool: true, // Use connection pooling for production efficiency
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 20000, // Increased to 20s for production reliability
    greetingTimeout: 20000,
    socketTimeout: 30000,
    dnsTimeout: 10000,
    family: 4, // Force IPv4 for Render compatibility
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  };

  if (isService) {
    config.service = process.env.SMTP_SERVICE;
  } else {
    config.host = process.env.SMTP_HOST;
    config.port = port;
    config.secure = isSecure;
  }

  return nodemailer.createTransport(config);
};

/**
 * Verifies the SMTP connection without sending an email.
 * Useful for debugging production connection issues like ETIMEDOUT.
 */
export const verifyConnection = async () => {
  if (!transporter) transporter = createTransporter();
  try {
    await transporter.verify();
    console.log("✅ SMTP Connection verified successfully");
  } catch (error) {
    console.error("❌ SMTP Verification failed:", error.message);
    throw error;
  }
};

const sendEmail = async (options) => {
  // Check if credentials exist
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.error("❌ SMTP Error: SMTP_EMAIL or SMTP_PASSWORD is missing in environment variables.");
    throw new Error("SMTP credentials missing");
  }

  if (!transporter) {
    transporter = createTransporter();
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
