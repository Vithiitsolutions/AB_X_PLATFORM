import mercury from "@mercury-js/core";
import { metaEvents } from "../Events.ts";
import type { Platform } from "../platform.ts";
import { GraphQLError } from "graphql";

// Check for history tracking - its not getting enabled after creating option for historytracking
mercury.hook.after("CREATE_MODELOPTION_RECORD", async function (this: any) { // TODO: revist the logic to fetch the record
  const platform: Platform = this.options.ctx.platform;
  const input = this.options.args.input;
  await platform.composeModel(input.modelName);
  metaEvents.emit("CREATE_MODEL_RECORD", { msg: `${input.keyName} option is created for ${input.modelName} model!` });
});

mercury.hook.after("UPDATE_MODELOPTION_RECORD", async function (this: any) {
  const platform: Platform = this.options.ctx.platform;
  await platform.composeModel(this.record.modelName!);
  metaEvents.emit("CREATE_MODEL_RECORD", { msg: `${this.record?.keyName} option got updated for ${this.record.modelName} model!` });
});

mercury.hook.after("DELETE_MODELOPTION_RECORD", async function (this: any) {
  const platform: Platform = this.options.ctx.platform;
  await platform.composeModel(this.deletedRecord.modelName!);
  metaEvents.emit("CREATE_MODEL_RECORD", { msg: `${this.deletedRecord.keyName} option got deleted for ${this.deletedRecord.modelName} model!` });
});