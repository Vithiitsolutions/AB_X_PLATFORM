import mercury from "@mercury-js/core";
import type { Platform } from "../platform.ts";
import { overrideWithExplicitPermissions } from "../utility.ts";

async function syncProfile(platform: Platform, record: any) {
  const permission = await mercury.db.Permission.mongoModel.findOne(record._id);
  let profile = permission.profileName;
  let permissionSet = [
    {
      modelName: permission.modelName,
      access: platform.composeModelPermission(permission),
      fieldLevelAccess: permission.fieldLevelAccess
    }
  ];
  let permissions = overrideWithExplicitPermissions(platform.profilesMapper.get(profile), permissionSet);
  platform.profilesMapper.set(profile, permissions);
  mercury.access.updateProfile(profile, permissions);
}
mercury.hook.after("CREATE_PERMISSION_RECORD", async function (this: any) {
  try {
    await syncProfile(this.options.ctx.platform, this.record);
  } catch (error: any) {
    console.log("Error in syncing permission!!", error.message);
  }
});

mercury.hook.after("UPDATE_PERMISSION_RECORD", async function (this: any) {
  try {
    await syncProfile(this.options.ctx.platform, this.record);
  } catch (error: any) {
    console.log("Error in syncing permission!!", error.message);
  }
});

mercury.hook.after("DELETE_PERMISSION_RECORD", async function (this: any) {
  try {
    const platform: Platform = this.options.ctx.platform;
    let profile = this.deletedRecord.profileName;
    let permissions = platform.profilesMapper.get(profile);
    permissions = permissions.filter((permission: any) => permission.modelName != this.record.modelName);
    platform.profilesMapper.set(profile, permissions);
    mercury.access.updateProfile(profile, permissions);
  } catch (error) {
    console.log("Error in deleting permission!!", error.message);
  }
});
