import nodemailer from "nodemailer";

// Configured via environment variables
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@smartpicksindia.com";

let transporter;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for others
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.log("\n=================== MOCK EMAIL SENT ===================");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text:    ${text}`);
    console.log("------------------ HTML Body ------------------");
    console.log(html);
    console.log("========================================================\n");
    return { mock: true, messageId: "mock-id-" + Math.random() };
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  return await transporter.sendMail(mailOptions);
}

export async function sendVerificationEmail(email, name, token) {
  const url = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #e85d54; text-align: center;">SmartPicks India</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering on SmartPicks India! Please click the button below to verify your email address and activate your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #d43f36; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #666; font-size: 14px;">This link will expire in 24 hours. If you did not sign up for this account, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2026 SmartPicks India. All rights reserved.</p>
    </div>
  `;
  const text = `Hello ${name},\n\nPlease verify your email by clicking on the link below:\n${url}\n\nThis link will expire in 24 hours.`;

  return await sendEmail({ to: email, subject: "Verify Your Email - SmartPicks India", html, text });
}

export async function sendPasswordResetEmail(email, name, token) {
  const url = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #e85d54; text-align: center;">SmartPicks India</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the button below to secure a new password for your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #d43f36; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2026 SmartPicks India. All rights reserved.</p>
    </div>
  `;
  const text = `Hello ${name},\n\nPlease reset your password by clicking on the link below:\n${url}\n\nThis link will expire in 1 hour.`;

  return await sendEmail({ to: email, subject: "Reset Your Password - SmartPicks India", html, text });
}
