import mercury from "@mercury-js/core";
import { sendNotification } from "../../services/notification";
mercury.hook.after("UPDATE_ABOUT_RECORD", async function (this: any) {
  const recordId = this.record?.id;
  const ctxUser = this.user;
  const about: any = await mercury.db.About.get({ _id: recordId }, { id: ctxUser?.id, profile: ctxUser?.profile });
  if (!about?.isResolved) {
    console.log("About record is not resolved, skipping notification.");
    return;
  }
  const userId = about.user;
  const user: any = await mercury.db.User.get({ _id: userId }, { id: ctxUser?.id, profile: ctxUser?.profile });
  if (!user) {
    console.log("User not found, skipping notification.");
    return;
  }
  console.log(about, user, "about");
  const userToken = user.token;
  if (!userToken) {
    console.log("User token not found, skipping notification.");
    return;
  }
  console.log(userToken, "token");
  await sendNotification(
    userToken,
    "Abhinav Bharath",
    `Your Request has been resolved`,
    { userId: userId }
  );
});