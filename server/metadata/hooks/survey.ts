import mercury from "@mercury-js/core";
import { sendNotification } from "../../services/notification";
mercury.hook.after("CREATE_SURVEY_RECORD", async function (this: any) {
    try {
        console.log(this.options.args.input, "this.options.input");
        const ctxUser = this.options.ctx?.user;
        const input = this.options.args.input;
        const createdBy = ctxUser?.name || "User";
        if (!ctxUser) {
            console.error("No user context available.");
            return;
        }
        const { state, district, constituency } = input;
        if (!state && !district && !constituency) {
            console.warn("No location fields available on user.");
            return;
        }
        const filters: any[] = [];
        if (constituency) filters.push({ constituency: constituency.toString() });
        if (district) filters.push({ district: district.toString() });
        if (state) filters.push({ state: state.toString() });
        const users = await mercury.db.User.list(
            { $or: filters },
            { id: ctxUser.id, profile: ctxUser.profile }
        );
        console.log(users, "users");
        const notifiedUserIds = new Set<string>();
        for (const user of users) {
            const userId = user.id;
            if (user.token && !notifiedUserIds.has(userId)) {
                notifiedUserIds.add(userId);
                await sendNotification(
                    user.token,
                    "Abhinav Bharath",
                    `${createdBy} has launched a new survey for your area`,
                    { userId }
                );
            }
        }
    } catch (error) {
        console.error("Error in CREATE_SURVEY_RECORD hook:", error);
    }
});
