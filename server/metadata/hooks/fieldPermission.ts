import mercury from "@mercury-js/core";
import type { Platform } from "../platform.ts";
import { overrideWithExplicitPermissions } from "../utility.ts";

async function syncProfile(platform: Platform, record: any) {
  const fieldPermission = await mercury.db.FieldPermission.mongoModel.findOne(record._id);
  let profile = fieldPermission.profileName;
  let permissionSet = [
    {
      modelName: fieldPermission.modelName,
      fieldLevelAccess: true,
      fields: platform.composeFieldPermissions([fieldPermission])
    }
  ];
  let permissions = overrideWithExplicitPermissions(platform.profilesMapper.get(profile), permissionSet as any);
  platform.profilesMapper.set(profile, permissions);
  mercury.access.updateProfile(profile, permissions);
}

mercury.hook.after("CREATE_FIELDPERMISSION_RECORD", async function (this: any) {
  try {
    await syncProfile(this.options.ctx.platform, this.record);
  } catch (error: any) {
    console.log("Error in syncing profile", error.message);
  }
});

mercury.hook.after("UPDATE_FIELDPERMISSION_RECORD", async function (this: any) {
  try {
    await syncProfile(this.options.ctx.platform, this.record);
  } catch (error: any) {
    console.log("Error in syncing profile", error.message);
  }
});

mercury.hook.after("DELETE_FIELDPERMISSION_RECORD", async function (this: any) {
  const platform: Platform = this.options.ctx.platform;
  let profile = this.deletedRecord.profileName;
  let permissions = platform.profilesMapper.get(profile);
  permissions = permissions.map((permission: any) => {
    if (permission.modelName === this.deletedRecord.modelName && permission.fields) {
      const updatedFields = { ...permission.fields };
      delete updatedFields[this.deletedRecord.fieldName];

      const hasFields = Object.keys(updatedFields).length > 0;

      return {
        ...permission,
        fieldLevelAccess: hasFields ? permission.fieldLevelAccess : false,
        fields: hasFields ? updatedFields : {}
      };
    }
    return permission;
  });
  platform.profilesMapper.set(profile, permissions);
  mercury.access.updateProfile(profile, permissions);
});
