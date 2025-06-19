import mercury from "@mercury-js/core";
import { metaEvents } from "../Events.ts";
import type { Platform } from "../platform.ts";
import { GraphQLError } from "graphql";
import _ from "lodash";

type HookModel = {
  record: {
    name: string;
    label: string;
    description: string;
    managed: boolean;
  };
};

async function checkDependencies(modelName: string) {
  const modelFields = await mercury.db.ModelField.list(
    { ref: modelName },
    { id: "1", profile: "SystemAdmin" },
    { select: "modelName" }
  );
  if (_.isEmpty(modelFields)) return;
  throw new Error(
    `${modelFields
      .map((modelField) => modelField.modelName)
      .join(",")} has a reference to this model, can't be deleted directly!!!`
  );
}

mercury.hook.after("CREATE_MODEL_RECORD", async function (this: any) {
  if (this.options.skipHook) return;
  const modelName = this.options?.args?.input?.name;
  const modelId = this.record._id;

  const systemAdmin = await mercury.db.Profile.mongoModel.findOne({
    name: "SystemAdmin",
  });
  if (!systemAdmin) return;

  // 1. Create Permission
  await mercury.db.Permission.mongoModel.create({
    profile: systemAdmin._id,
    profileName: "SystemAdmin",
    model: modelId,
    modelName: modelName,
    create: true,
    read: true,
    update: true,
    delete: true,
  });

  // 2. Extend access
  mercury.access.extendProfile("SystemAdmin", [
    {
      modelName: modelName,
      access: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
  ]);
});

mercury.hook.before("DELETE_MODEL_RECORD", async function (this: any) {
  // send an erro message that it is refered in another model, and update it first before deleting it or something like that
  // check if model is passed as reference in certain models in before hook a->b , b->a
  try {
    await checkDependencies(this.record.name);
  } catch (error) {
    console.log("BeforeHooK: Error deleting in model", error.message);
    throw new GraphQLError(error.message);
  }
});

mercury.hook.after("DELETE_MODEL_RECORD", async function (this: any) {
  // check if model is passed as reference in certain models in before hook
  // Permissions also should be deleted right?
  try {
    await Promise.all([
      deleteModelFields(this.deletedRecord._id, this.options.ctx.platform),
      deleteModelOptions(this.deletedRecord._id, this.options.ctx.platform),
      deletePermissions(this.deletedRecord.name, this.options.ctx.platform)
    ]);

    mercury.deleteModel(this.deletedRecord.name);
    metaEvents.emit("CREATE_MODEL_RECORD", {
      msg: `${this.deletedRecord.name} model is deleted`,
    });
  } catch (error) {
    console.log("Error deleting in model fields, options and permissions", error.message);
  }
});

async function deleteModelFields(
  modelId: any,
  platform: Platform
): Promise<void> {
  try {
    // after model delete no fields will be there
    const modelFields: [] =
      (await mercury.db.ModelField.list(
        { model: modelId },
        { id: "1", profile: "SystemAdmin" },
        { select: "id" }
      )) || [];
    const modelFieldIds: string[] = modelFields.map(
      (modelField: { id: string; _id: any }) => modelField.id
    );
    await Promise.all(
      modelFieldIds.map(async (modelFieldId: string) => {
        await mercury.db.ModelField.delete(
          modelFieldId,
          { id: "1", profile: "SystemAdmin" },
          { ctx: { platform: platform } }
        );
      })
    );
  } catch (error) {
    console.log(
      "Error in deleting model fields for this model!!",
      error.message
    );
    throw new Error(`Failed to delete model fields: ${error.message}`);
  }
}

async function deleteModelOptions(
  modelId: any,
  platform: Platform
): Promise<void> {
  try {
    const modelOptions: [] =
      (await mercury.db.ModelOption.list(
        { model: modelId },
        { id: "1", profile: "SystemAdmin" },
        { select: "id" }
      )) || [];
    const modelOptionIds: string[] = modelOptions.map(
      (modelOption: { id: string; _id: any }) => modelOption.id
    );
    await Promise.all(
      modelOptionIds.map(async (modelOptionId) => {
        await mercury.db.ModelOption.delete(
          modelOptionId,
          { id: "1", profile: "SystemAdmin" },
          { ctx: { platform: platform } }
        );
      })
    );
  } catch (error) {
    console.log(
      "Error in deleting model options for this model!!",
      error.message
    );
    throw new Error(`Failed to delete model options: ${error.message}`);
  }
}

async function deletePermissions(modelName: string, platform: Platform) {
  try {
    const permissions: [] =
      (await mercury.db.Permission.list(
        { modelName: modelName },
        { id: "1", profile: "SystemAdmin" },
        { select: "id" }
      )) || [];
    const permissionIds: string[] = permissions.map(
      (permission: { id: string; _id: any }) => permission.id
    );
    await Promise.all(
      permissionIds.map(async (permissionId) => {
        await mercury.db.Permission.delete(
          permissionId,
          { id: "1", profile: "SystemAdmin" },
          { ctx: { platform: platform } }
        );
      })
    );
  } catch (error) {
    console.log(
      "Error in deleting Permission set for this model!!",
      error.message
    );
    throw new Error(`Failed to delete permissions: ${error.message}`);
  }
}
