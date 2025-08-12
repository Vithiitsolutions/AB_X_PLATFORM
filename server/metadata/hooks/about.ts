import mercury from "@mercury-js/core";
import { sendEmail, generateEmailHtml } from '../../services/emailService';
mercury.hook.before("CREATE_ABOUT_RECORD", async function (this: any) {
  if (this.user?.id) {
    this.data.user = this.user.id; 
  } else {
    console.warn("User is missing in session, skipping user assignment.");
  }
});
mercury.hook.after("CREATE_ABOUT_RECORD", async function (this: any) {
  try {
    const fromEmail = this.options?.args?.input?.from;
    const toEmail = "shashanksonwane305@gmail.com";
    const subject = this.record?.subject || "No Subject Provided";
    const description = this.record?.description || "No Description Provided";
    if (!fromEmail || !toEmail) {
      console.warn("Email or recipient missing. Skipping email sending.");
      return;
    }
    const emailHtml = generateEmailHtml(this.user?.name, fromEmail, subject, description);
    await sendEmail(fromEmail, toEmail, subject, description, emailHtml);
  } catch (error) {
    console.error("Error processing:", error);
  }
});