import mercury from "@mercury-js/core";
import { sendNotification } from "../../services/notification";
mercury.hook.before("CREATE_APPLICATION_RECORD", async function (this: any) {
    const ctxUser = this.options.ctx.user;
    if (!ctxUser) {
        throw new Error("User not authenticated.");
    }
    if (ctxUser.role === "PUBLIC") {
        this.options.args.input.user = ctxUser.id;
        return;
    }
    this.options.args.input.user = ctxUser.id;
});
mercury.hook.after("CREATE_APPLICATION_RECORD", async function (this: any) {
    const ctxUser = this.options.ctx.user;
    const input = this.options.args.input
    console.log("Application created by user:", ctxUser.id, "with input:", input);

    const user = await mercury.db.User.get({ _id: input.user }, { id: ctxUser.id, profile: ctxUser.profile });
    console.log("User details:", user);

    const leader = await mercury.db.User.get({ _id: input.leader }, { id: ctxUser.id, profile: ctxUser.profile })
    console.log("Leader details:", leader);
    const leaderId = leader._id
    console.log("Leader ID:", leaderId);
    const leaderToken = leader.token
    console.log("Leader token:", leaderToken);
    await sendNotification(
        leaderToken,
        "Abhinav Bharath",
        `🔔 You have received a new application request from ${user.name}. Please review and take the necessary action.`,
        { leaderId }
    );
})
mercury.hook.before("UPDATE_APPLICATION_RECORD", async function (this: any) {
    const application = this.record;
    const ctxUser = this.options.ctx.user;
    const { status, comments } = this.options.args.input;
    const now = new Date();
    if (!ctxUser) throw new Error("User not authenticated.");
    if (application.leader.toString() !== ctxUser.id.toString()) {
        throw new Error("You are not authorized to update this application.");
    }
    const currentStatus = application.status || "PENDING";
    if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(status)) {
        throw new Error(`Status update from ${currentStatus} to ${status} is not allowed.`);
    }
    const directJump = isDirectJump(currentStatus, status);
    if (status === "RESOLVED" && directJump && !comments) {
        throw new Error("Comments are required when directly resolving an application.");
    }
    const timestampUpdates: Record<string, Date> = {};
    if (status === "REJECTED") {
        timestampUpdates.rejectedAt = now;
    } else {
        const currentIndex = STATUS_CHAIN.indexOf(currentStatus);
        const newIndex = STATUS_CHAIN.indexOf(status);

        for (let i = Math.max(0, currentIndex); i <= newIndex; i++) {
            const chainStatus = STATUS_CHAIN[i];
            const timestampField = STATUS_TIMESTAMPS[chainStatus];
            if (!application[timestampField]) {
                timestampUpdates[timestampField] = now;
            }
        }
    }
    Object.assign(this.options.args.input, timestampUpdates);
    const [leader, user] = await Promise.all([
        mercury.db.User.get({ _id: application.leader }, { id: ctxUser.id, profile: ctxUser.profile }),
        mercury.db.User.get({ _id: application.user }, { id: ctxUser.id, profile: ctxUser.profile })
    ]);
    await sendNotification(
        user.token,
        "Abhinav Bharath",
        getNotificationMessage(currentStatus, status, leader.name),
        {
            userId: user._id,
            applicationId: application._id,
            statusChange: { from: currentStatus, to: status, isDirectJump: directJump }
        }
    );
    if (directJump) {
        console.log(`Direct status jump: ${application._id} from ${currentStatus} to ${status} by ${leader.name}`);
    }
});
const STATUS_CHAIN: any = ["PENDING", "ACCEPTED", "IN_PROGRESS", "RESOLVED"];
const STATUS_TIMESTAMPS: any = {
    PENDING: "pendingAt",
    ACCEPTED: "acceptedAt",
    IN_PROGRESS: "inProgressAt",
    RESOLVED: "resolvedAt",
    REJECTED: "rejectedAt"
};
const ALLOWED_TRANSITIONS: any = {
    PENDING: ["ACCEPTED", "IN_PROGRESS", "RESOLVED", "REJECTED"],
    ACCEPTED: ["IN_PROGRESS", "RESOLVED", "REJECTED"],
    IN_PROGRESS: ["RESOLVED", "REJECTED"],
    RESOLVED: [],
    REJECTED: []
};
const isDirectJump = (from: string, to: string): boolean => {
    if (to === "REJECTED") return false;
    const fromIndex = STATUS_CHAIN.indexOf(from);
    const toIndex = STATUS_CHAIN.indexOf(to);
    return toIndex - fromIndex > 1;
};
const getNotificationMessage = (from: string, to: string, leaderName: string): string => {
    const messages: Record<string, string> = {
        "PENDING_TO_ACCEPTED": `✅ Your application has been accepted by ${leaderName}`,
        "PENDING_TO_IN_PROGRESS": `🚀 Your application was fast-tracked and is now in progress by ${leaderName}`,
        "PENDING_TO_RESOLVED": `🎉 Great news! Your application was fast-tracked and resolved by ${leaderName}`,
        "PENDING_TO_REJECTED": `❌ Your application was reviewed and rejected by ${leaderName}`,
        "ACCEPTED_TO_IN_PROGRESS": `⚡ Your application is now in progress by ${leaderName}`,
        "ACCEPTED_TO_RESOLVED": `✅ Your application was quickly processed and resolved by ${leaderName}`,
        "ACCEPTED_TO_REJECTED": `❌ Your accepted application was rejected by ${leaderName}`,
        "IN_PROGRESS_TO_RESOLVED": `🎯 Your application has been completed and resolved by ${leaderName}`,
        "IN_PROGRESS_TO_REJECTED": `⚠️ Your application in progress was rejected by ${leaderName}`
    };
    return messages[`${from}_TO_${to}`] || `🔔 Your application status was updated to ${to.toLowerCase()} by ${leaderName}`;
};
