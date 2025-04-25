import mercury, { TModel } from "@mercury-js/core";
import { metaEvents } from "../Events.ts";
import type { Platform } from "../platform.ts";
import { GraphQLError } from "graphql";
import _ from "lodash";

// Sync model name updates?
function validateField(record: any) {
  const validations = {
    relationship: {
      check: () => _.isEmpty(record.ref),
      message: "Ref field must be provided for relationship fields."
    },
    enum: {
      check: () => _.isEmpty(record.enumValues),
      message: "Enum values field can't be empty!!"
    },
    virtual: {
      check: () => _.isEmpty(record.ref) || _.isEmpty(record.localField) || _.isEmpty(record.foreignField),
      message: "Ref , Localfield, Foreignfield must be provided for virtual fields."
    }
  };
  const validation = validations[record.type];
  if (validation && validation.check()) {
    throw new Error(validation.message);
  }

  if (["relationship", "virtual"].includes(record.type)) {
    const refModel = record.ref;
    const modelExists = mercury.list.some((model: TModel) => model.name === refModel);
    if (!modelExists) {
      throw new Error(`Ref model "${refModel}" does not exist.`);
    }
  }
}

mercury.hook.before("CREATE_MODELFIELD_RECORD", async function (this: any) {
  try {
    const platform: Platform = this.options.ctx.platform;
    const input = this.options.args.input;
    validateField(input);
    await platform.composeModel(input.modelName);
  } catch (error) {
    throw new GraphQLError(error.message);
  }
});

mercury.hook.after("CREATE_MODELFIELD_RECORD", async function (this: any) { // TODO: revist the logic to fetch the record
  const platform: Platform = this.options.ctx.platform;
  const input = this.options.args.input;
  await platform.composeModel(input.modelName);
  metaEvents.emit("CREATE_MODEL_RECORD", { msg: `${input.name} field is created for the ${input.modelName} model` });
});

mercury.hook.after("UPDATE_MODELFIELD_RECORD", async function (this: any) {
  const platform: Platform = this.options.ctx.platform;
  await platform.composeModel(this.record.modelName!);
  metaEvents.emit("CREATE_MODEL_RECORD", { msg: `${this.record?.name} field got updated for ${this.record.modelName} model` });
});

mercury.hook.after("DELETE_MODELFIELD_RECORD", async function (this: any) {
  const platform: Platform = this.options.ctx.platform;
  await deleteFieldOptions(this.deletedRecord._id, this.options.ctx.platform);
  await platform.composeModel(this.deletedRecord.modelName!);
  metaEvents.emit("CREATE_MODEL_RECORD", { msg: `${this.deletedRecord.name} field is deleted for ${this.deletedRecord.modelName} model` });
});

async function deleteFieldOptions(modelFieldId: any, platform: Platform) {
  try {
    // Update systemadmin to profile from the context
    const fieldOptions = await mercury.db.FieldOption.list({ modelField: modelFieldId }, { id: "1", profile: "SystemAdmin" }, { select: "id" });
    const fieldOptionIds: string[] = fieldOptions.map((fieldOption: { id: string, _id: any }) => fieldOption.id);
    await Promise.all(fieldOptionIds.map(async (fieldOptionId) => {
      await mercury.db.FieldOption.delete(fieldOptionId, { id: "1", profile: "SystemAdmin" }, { ctx: { platform: platform } });
    }));
  } catch (error) {
    console.log(`Error in deleting field options for this field - ${modelFieldId}!! `, error.message);
    throw new Error(`Failed to delete field options: ${error.message}`);
  }
}