import { randomInt } from "crypto";
import nodemailer from "nodemailer";

// Create a transporter using Gmail (you can change this to any email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use an app password for Gmail
    },
  });
};

export const sendVerificationEmail = async (
  email: string,
  code: string,
  username: string
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your EmotionWork account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Welcome to EmotionWork!</h1>
          <p>Hi ${username},</p>
          <p>Thank you for signing up! To complete your registration, please use the verification code below:</p>
          <div style="background-color: #f4f4f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h2 style="color: #000; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h2>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn&apos;t create an account with EmotionWork, you can safely ignore this email.</p>
          <p>Best regards,<br>The EmotionWork Team</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};

export const generateVerificationCode = (): string => {
  // Generate cryptographically secure random number 0..999999 then left-pad to 6 digits
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
};
