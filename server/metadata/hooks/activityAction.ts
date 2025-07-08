import mercury from "@mercury-js/core";
mercury.hook.before("CREATE_ACTIVITYACTION_RECORD", async function (this: any) {
    const ctxUser = this.options.ctx.user;
    const { action, reportedReason, type } = this.data;
    if (action === "Report") {
        if (!reportedReason) {
            throw new Error("Reported reason is required when reporting a post.");
        }
        const reason = await mercury.db.Reason.create({
            label: reportedReason,
            value: reportedReason,
            reasonType: type,
            active: true
        }, { id: ctxUser.id, profile: ctxUser.profile });
        this.data.reportedReason = reason.id;
    }
});