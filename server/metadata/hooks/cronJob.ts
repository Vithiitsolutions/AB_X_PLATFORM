import mercury from "@mercury-js/core";
import { metaServer } from "../../../server";

mercury.hook.after("CREATE_CRONJOB_RECORD", async function (this: any) {
  await metaServer.cronService.reload();
});

mercury.hook.after("UPDATE_CRONJOB_RECORD", async function (this: any) {
  if (!this.options.skipHook) await metaServer.cronService.reload();
});

mercury.hook.after("DELETE_CRONJOB_RECORD", async function (this: any) {
  await metaServer.cronService.reload();
});
