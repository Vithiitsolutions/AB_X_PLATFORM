import mercury from "@mercury-js/core";
import { sendNotification } from "../../services/notification";
mercury.hook.after("CREATE_ACTIVITY_RECORD", async function (this: any) {
    try {
        const ctxUser = this.options.ctx?.user;
        const activity = this.options.args.input;
        if (!ctxUser) {
            console.error("No user context available.");
            return;
        }
        const user: any = await mercury.db.User.get(
            { _id: ctxUser.id },
            { id: ctxUser.id, profile: ctxUser.profile }
        );
        if (!user) {
            console.warn("User not found.");
            return;
        }
        if (!user.token) {
            console.warn(`User found but missing token: ${user._id}`);
        }
        const userId = user._id;
        const constituency = user.constituency;
        const district = user.district;
        const state = user.state;
        const createdBy = user.name || "User";
        // Notify the creator
        await sendNotification(
            user.token,
            "Abhinav Bharath",
            "Activity Created Successfully",
            { userId }
        );
        const notifiedUserIds = new Set<string>([userId.toString()]);
        if (activity.type === "PRIVATE") {
            for (const leaderId of activity.invitedLeaders || []) {
                const leader = await mercury.db.User.get(
                    { _id: leaderId },
                    { id: ctxUser.id, profile: ctxUser.profile }
                );
                if (
                    leader &&
                    leader.token &&
                    !notifiedUserIds.has(leader._id.toString())
                ) {
                    notifiedUserIds.add(leader._id.toString());
                    await sendNotification(
                        leader.token,
                        "Abhinav Bharath",
                        `You have been invited to a private activity by ${createdBy}.`,
                        { userId: leader._id }
                    );
                }
            }
        } else {
            // Public activity — notify users by location
            const filters: any[] = [];
            if (constituency) filters.push({ constituency });
            if (district) filters.push({ district });
            if (state) filters.push({ state });

            const users = await mercury.db.User.list(
                { $or: filters },
                { id: ctxUser.id, profile: ctxUser.profile }
            );
            for (const user of users) {
                if (user.token && !notifiedUserIds.has(user._id.toString())) {
                    notifiedUserIds.add(user._id.toString());
                    await sendNotification(
                        user.token,
                        "Abhinav Bharath",
                        `${createdBy} has launched a new activity near you!`,
                        { userId: user._id }
                    );
                }
            }
        }
    } catch (error) {
        console.error("Error in CREATE_ACTIVITY_RECORD hook:", error);
    }
});
