import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const sendEmail = async (
  fromEmail: string,
  toEmail: string,
  subject: string,
  message: string,
  emailHtml: string
) => {
  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: subject || "No Subject",
    text: message || "No Message",
    html: emailHtml,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error("Error sending email:", error.message);
  }
};
export const generateEmailHtml = (
  userName: string,
  userEmail: string,
  subject: string,
  description: string
) => {
  return `  
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
      <div style="background-color:#FF7518; padding: 15px; border-radius: 8px 8px 0 0; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">New Issue Reported</h2>
      </div>
      <div style="padding: 20px; color: #333; line-height: 1.6;">
        <p>Hello Support Team,</p>
        <p><strong>${
          userName || "Unknown User"
        }</strong> has reported a new issue.</p>
        <p><strong>Email:</strong> ${userEmail || "N/A"}</p>
        <p><strong>Issue Details:</strong></p>
        <p><strong>Title:</strong> ${subject}</p>
        <p>${description}</p>
        <p>Please review this issue and take the necessary action.</p>
        <p>Best Regards,</p>
      </div>
      <div style="text-align: center; padding: 15px; font-size: 12px; color: #888;">
        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </div>`;
};
export const generateSetPasswordEmailHtml = (
  userName: string,
  setPasswordLink: string
) => {
  return `
  <div style="max-width:600px;margin:20px auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;background-color:#ffffff;font-family:Arial,sans-serif;line-height:1.6;">
    <div style="background-color:#007BFF;padding:15px;border-radius:8px 8px 0 0;color:#ffffff;text-align:center;">
      <h2 style="margin:0;font-size:22px;">Welcome to Ableader!</h2>
    </div>
    <div style="padding:20px;color:#333;">
      <p>Hi <strong>${userName || "User"}</strong>,</p>
      <p>Your account has been successfully created on <b>Ableader Admin Portal</b>.</p>
      <p>To activate your account, please set your password using the link below:</p>
      <p style="text-align:center;margin:30px 0;">
        <a href="${setPasswordLink}" target="_blank" 
          style="display:inline-block;padding:12px 24px;background-color:#007BFF;color:#fff;
          text-decoration:none;border-radius:5px;font-weight:bold;">
          Set My Password
        </a>
      </p>
      <p>This link will expire in <b>1 hour</b> for security reasons.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best Regards,<br/><strong>The Ableader Team</strong></p>
    </div>
    <div style="text-align:center;padding:15px;font-size:12px;color:#888;">
      <p>&copy; ${new Date().getFullYear()} Ableader. All rights reserved.</p>
    </div>
  </div>
  `;
};
export const passwordResetTemplate = (userName: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #4CAF50;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .button:hover { background-color: #45a049; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    .warning { color: #ff6b6b; font-weight: bold; margin: 15px 0; }
    .link-box {
      word-break: break-all;
      background-color: #fff;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 13px;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${userName || "User"}</strong>,</p>
      <p>We received a request to reset your password.</p>
      <p>Click the button below to create a new password:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>Or click on the link below:</p>
      <div class="link-box">${resetLink}</div>
      <p class="warning">⚠️ This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <p>Best regards,<br><strong>Vithi IT Solutions Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>© ${new Date().getFullYear()} Vithi IT Solutions. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
