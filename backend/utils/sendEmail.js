import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, message }) => {
  try {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      throw new Error("SMTP credentials missing");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD, // App Password
      },
      connectionTimeout: 10000, // ⏱ prevent ETIMEDOUT
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Forgot Password Email Sent Successfully");
  } catch (error) {
    console.error("❌ Forgot Password Email FAILED:", error);
    throw error; // important for controller catch
  }
};

export default sendEmail;
