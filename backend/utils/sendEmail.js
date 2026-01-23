import request from "superagent";

/**
 * Sends an email using the Brevo API.
 * @param {Object} options - { email, subject, message, templateId, params }
 */
const sendEmail = async (options) => {
  try {
    const payload = {
      to: [{ email: options.email }],
      sender: {
        name: process.env.FROM_NAME,
        email: process.env.EMAIL_FROM,
      },
    };

    // Ensure templateId is a valid number and not a string like "undefined"
    const tid = Number(options.templateId);
    if (options.templateId && !isNaN(tid) && tid > 0) {
      payload.templateId = tid;
      payload.params = options.params || {};
    } else {
      payload.subject = options.subject;
      payload.htmlContent = options.message;
    }

    const response = await request
      .post("https://api.brevo.com/v3/smtp/email")
      .set("api-key", process.env.BREVO_API_KEY)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(payload);

    console.log("✅ Brevo API Response:", response.body);
    return response.body;
  } catch (error) {
    const errorMessage = error.response?.body?.message || error.message;
    throw new Error(`Brevo API Error: ${errorMessage}`);
  }
};

export default sendEmail;