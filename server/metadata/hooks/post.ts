import mercury from "@mercury-js/core";
import { sendNotification } from "../../services/notification";
mercury.hook.after("CREATE_POST_RECORD", async function (this: any) {
    try {
        const ctxUser = this.options.ctx.user;
        const post = this.options.args.input;
        const user: any = await mercury.db.User.get(
            { _id: ctxUser.id },
            { id: ctxUser.id, profile: ctxUser.profile }
        );
        if (!user) throw new Error("User not found");
        const createdBy = user.name || "User";
        const userId = user._id;
        const expoToken = user.token;
        const { constituency, district, state } = user;
        // Notify creator
        if (expoToken) {
            await sendNotification(
                expoToken,
                "Abhinav Bharath",
                "Post Created Successfully",
                { userId }
            );
        }
        const notifiedUserIds = new Set<string>([userId.toString()]);
        if (post.access === "PRIVATE" && post.assignedTo) {
            const assignedLeader = await mercury.db.User.get(
                { _id: post.assignedTo },
                { id: ctxUser.id, profile: ctxUser.profile }
            );
            if (assignedLeader?.token && !notifiedUserIds.has(assignedLeader._id.toString())) {
                notifiedUserIds.add(assignedLeader._id.toString());
                await sendNotification(
                    assignedLeader.token,
                    "Abhinav Bharath",
                    "You have a new private post assigned to you.",
                    { userId: assignedLeader._id }
                );
            }
        } else {
            const filters: any[] = [];
            if (constituency) filters.push({ constituency });
            if (district) filters.push({ district });
            if (state) filters.push({ state });
            if (filters.length > 0) {
                const users = await mercury.db.User.list(
                    { $or: filters },
                    { id: ctxUser.id, profile: ctxUser.profile }
                );
                for (const u of users) {
                    if (u.token && !notifiedUserIds.has(u._id.toString())) {
                        notifiedUserIds.add(u._id.toString());
                        await sendNotification(
                            u.token,
                            "Abhinav Bharath",
                            `${createdBy} just shared a new post. Check it out now!`,
                            { userId: u._id }
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error in CREATE_POST_RECORD hook:", error);
    }
});

// After a Post is updated
mercury.hook.after("UPDATE_POST_RECORD", async function (this: any) {
    try {
        const ctxUser = this.options.ctx.user;

        if (this.record.status === "Accepted") {
            const userId = this.prevRecord.user;
            const acceptedUserId = this.data.acceptedBy;

            const user = await mercury.db.User.get(
                { _id: userId },
                { id: ctxUser.id, profile: ctxUser.profile }
            );

            const acceptedUser = await mercury.db.User.get(
                { _id: acceptedUserId },
                { id: ctxUser.id, profile: ctxUser.profile }
            );

            if (user?.token) {
                const acceptedByName = acceptedUser?.name || "User";
                await sendNotification(
                    user.token,
                    "Abhinav Bharath",
                    `Your request has been accepted by ${acceptedByName}!`,
                    { userId }
                );
            }
        }
    } catch (error) {
        console.error("Error in UPDATE_POST_RECORD hook:", error);
    }
});