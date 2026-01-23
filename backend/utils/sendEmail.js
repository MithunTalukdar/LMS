import SibApiV3Sdk from "sib-api-v3-sdk";

// Initialize Brevo API client (Singleton – production safe)
const client = SibApiV3Sdk.ApiClient.instance;
const apiKeyAuth = client.authentications["api-key"];

if (!process.env.BREVO_API_KEY) {
  throw new Error("❌ BREVO_API_KEY is missing in environment variables");
}

apiKeyAuth.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * sendEmail
 * @param {Object} options
 * @param {string} options.email - recipient email
 * @param {string} options.subject - email subject
 * @param {string} options.message - plain text or HTML
 */
const sendEmail = async ({ email, subject, message }) => {
  if (!email || !subject || !message) {
    throw new Error("❌ sendEmail: Missing required fields");
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error("❌ EMAIL_FROM is missing in environment variables");
  }

  try {
    await tranEmailApi.sendTransacEmail({
      sender: {
        name: process.env.FROM_NAME || "LMS Support",
        email: process.env.EMAIL_FROM,
      },
      to: [{ email }],
      subject,
      htmlContent: message,
    });

    console.log("✅ Email sent successfully via Brevo");
  } catch (error) {
    console.error("❌ Brevo Email Error:", error?.response?.text || error.message);
    throw new Error("Email service failed");
  }
};

export default sendEmail;
