import mercury, { Profile, Rule } from "@mercury-js/core";
import { metaEvents } from "../Events.ts";
import type { Platform } from "../platform.ts";
import { GraphQLError } from "graphql";
import { HistoryTrackingService } from "../historyTrackingService.ts";

// Check for history tracking - its not getting enabled after creating option for historytracking
mercury.hook.after("CREATE_MODELOPTION_RECORD", async function (this: any) { // TODO: revist the logic to fetch the record
  const platform: Platform = this.options.ctx.platform;
  const input = this.options.args.input;
  await checkForHistoryTracking(platform, input, platform.historyTrackingService);
  await platform.composeModel(input.modelName);
  metaEvents.emit("CREATE_MODEL_RECORD", { msg: `${input.keyName} option is created for ${input.modelName} model!` });
});

mercury.hook.after("UPDATE_MODELOPTION_RECORD", async function (this: any) {
  const platform: Platform = this.options.ctx.platform;
  const optionRecord = await mercury.db.ModelOption.mongoModel.findOne(this.record._id);
  await checkForHistoryTracking(platform, optionRecord, platform.historyTrackingService);
  await platform.composeModel(optionRecord.modelName!);
  metaEvents.emit("CREATE_MODEL_RECORD", { msg: `${optionRecord.keyName} option got updated for ${optionRecord.modelName} model!` });
});

mercury.hook.after("DELETE_MODELOPTION_RECORD", async function (this: any) {
  // If it is historyTracking - historyTracking resolvers should be disabled
  const platform: Platform = this.options.ctx.platform;
  await checkForHistoryTracking(platform, this.deletedRecord, platform.historyTrackingService, "delete");
  await platform.composeModel(this.deletedRecord.modelName!);
  metaEvents.emit("CREATE_MODEL_RECORD", { msg: `${this.deletedRecord.keyName} option got deleted for ${this.deletedRecord.modelName} model!` });
});

async function deleteHistoryModel(modelName: string, platform: Platform) {
  // delete model and modelfields
  // delete permissions involving this model in its hooks - chain reaction
  try {
    const model: any = await mercury.db.Model.get({ name: modelName }, { id: "1", profile: "SystemAdmin" });
    await mercury.db.Model.delete(model._id, { id: "1", profile: "SystemAdmin" }, { ctx: { platform: platform } });
  } catch (error: any) {
    console.log("Error in deleting history model: ", error.message);
  }
}

async function checkForHistoryTracking(platform: Platform, input: any, historyTrackingService: HistoryTrackingService, action: "delete" | "create" | "update" = "create") {
  if (input.keyName !== "historyTracking") return;
  if (action == "delete" || input.value == "false") { // For delete
    // Deletes model, fields, options, and permissions as well
    deleteHistoryModel(`${input.modelName}History`, platform);
  } else { // For create
    const historyModel: any = await historyTrackingService.getModel(input.modelName);
    await Promise.all([
      historyTrackingService.createModelFields(input.modelName, historyModel._id),
      // Creates permission for history model
      historyTrackingService.updateSystemAdminAccess(`${input.modelName}History`, historyModel._id)
    ])
  }
}

// update - removing history models from mercury - but it is present in db
// restart - resolvers will be up since it is present in db and it is not intended