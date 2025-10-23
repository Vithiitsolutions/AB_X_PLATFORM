import mercury from "@mercury-js/core";
import jwt from "jsonwebtoken";
import {
  generateSetPasswordEmailHtml,
  sendEmail,
} from "../../services/emailService";

mercury.hook.before("CREATE_USER_RECORD", async function (this: any) {
  const creatingAdmin =
    this.data.role === "Admin" || this.data.role === "MetadataAdmin";
  const requestingUserIsSystemAdmin = this.user.profile === "SystemAdmin";
  if (creatingAdmin && !requestingUserIsSystemAdmin) {
    console.error(
      "Permission denied: Only SystemAdmins can create Admin users."
    );
    throw new Error(
      "You do not have permission to create users with the 'Admin' role."
    );
  }
});

mercury.hook.after("CREATE_USER_RECORD", async function (this: any) {
  console.log(this, "After Hook");
  try {
    // 1️⃣ Get the created user record
    const createdUserId = this.record.id;

    // Fetch complete user info (email, name, role, etc.)
    const createdUser: any = await mercury.db.User.get(
      { _id: createdUserId },
      { id: "1", profile: "SystemAdmin" }
    );
    console.log(createdUser, "...........");

    if (!createdUser || !createdUser.email) {
      console.error("User not found or missing email field.");
      return;
    }

    // 2️⃣ Generate a secure, time-limited JWT token for password setup
    const token = jwt.sign(
      { email: createdUser.email, userId: createdUser._id },
      process.env.JWT_SECRET || "default-secret-key",
      { expiresIn: "1h" }
    );
    console.log(token, "token");

    // You can customize your frontend route here
    const setPasswordLink = `https://admin-dev.ableader.com/page/change-password?token=${token}`;
    const emailHtml = generateSetPasswordEmailHtml(
      createdUser.name,
      setPasswordLink
    );
    await sendEmail(
      process.env.EMAIL_USER!,
      createdUser.email,
      "Set Your Password - Ableader Access",
      "Please set your password using the link provided.",
      emailHtml
    );
  } catch (err) {
    console.error("Error sending set-password email:", err);
  }
});
