import mercury from "@mercury-js/core";
import { sendNotification } from "../../services/notification";

mercury.hook.after("CREATE_MANIFESTO_RECORD", async function (this: any) {
    try {
        const ctxUser = this.options.ctx?.user;
        if (!ctxUser) {
            console.error("No user context available.");
            return;
        }
        const createdBy = ctxUser.name || "User";
        const manifesto = this.options.args.input;
        console.log(manifesto, "manifesto");
        const { state, district, constituency } = manifesto;
        if (!state && !district && !constituency) {
            console.warn("No location data provided on the manifesto.");
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
        const notifiedUserIds = new Set<string>();
        for (const user of users) {
            const userId = user.id;
            if (user.token && !notifiedUserIds.has(userId)) {
                notifiedUserIds.add(userId);
                await sendNotification(
                    user.token,
                    "Abhinav Bharath",
                    `Your voice matters! See what ${createdBy} has proposed in their latest manifesto.`,
                    { userId }
                );
            }
        }
    } catch (error) {
        console.error("Error in CREATE_MANIFESTO_RECORD hook:", error);
    }
});
