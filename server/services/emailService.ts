import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: Deno.env.get("EMAIL_USER"),
    pass: Deno.env.get("EMAIL_PASS")
  }

  
});
export const sendEmail = async (fromEmail: string, toEmail: string, subject: string, message: string, emailHtml: string) => {
  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: subject || 'No Subject',
    text: message || 'No Message',
    html: emailHtml
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error('Error sending email:', error.message);
  }
};
export const generateEmailHtml = (userName: string, userEmail: string, subject: string, description: string) => {
  return `  
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
      <div style="background-color:#FF7518; padding: 15px; border-radius: 8px 8px 0 0; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">New Issue Reported</h2>
      </div>
      <div style="padding: 20px; color: #333; line-height: 1.6;">
        <p>Hello Support Team,</p>
        <p><strong>${userName || "Unknown User"}</strong> has reported a new issue.</p>
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