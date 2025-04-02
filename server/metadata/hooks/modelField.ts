import mercury from "@mercury-js/core";
import { metaEvents } from "../Events.ts";
import type { Platform } from "../platform.ts";


mercury.hook.after("CREATE_MODELFIELD_RECORD", async function (this: any) {
  const platform: Platform = this.options.ctx.platform;
  const input = this.options.args.input;
  await platform.composeModel(input.modelName);
  metaEvents.emit("CREATE_MODEL_RECORD");
});

mercury.hook.after("UPDATE_MODELFIELD_RECORD", async function (this: any) {
  const platform: Platform = this.options.ctx.platform;
  await platform.composeModel(this.record.modelName!);
  metaEvents.emit("CREATE_MODEL_RECORD");
});

mercury.hook.after("DELETE_MODELFIELD_RECORD", async function (this: any) {
  const platform: Platform = this.options.ctx.platform;
  await platform.composeModel(this.deletedRecord.modelName!);
  metaEvents.emit("CREATE_MODEL_RECORD");
});
