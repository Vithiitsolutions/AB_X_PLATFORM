import mercury, { Profile } from "@mercury-js/core";
import type { Platform } from "../platform.ts";
import { profilePipeline } from "../utility.ts";

async function syncProfile(platform: Platform, record: any) {
  const [profile] = await mercury.db.Profile.mongoModel.aggregate([
    {
      $match: {
        _id: record._id
      },
    },
    ...profilePipeline
  ]);
  let permissions = platform.composePermissions({
    id: profile._id,
    name: profile.name,
    label: profile.label,
    permissions: profile.permissions || [],
    inheritedProfiles: profile.inheritedProfiles || []
  });
  mercury.access.createProfile(profile.name, permissions);
}

mercury.hook.after("CREATE_PROFILE_RECORD", async function (this: any) {
  try {
    await syncProfile(this.options.ctx.platform, this.record);
  } catch (error: any) {
    console.log("Error in creating profile permissions!!", error.message);
  }
});

mercury.hook.after("UPDATE_PROFILE_RECORD", async function (this: any) {
  try {
    const platform: Platform = this.options.ctx.platform;
    platform.profilesMapper.delete(this.prevRecord.name);
    mercury.access.profiles = mercury.access.profiles.filter((profile: Profile) => profile.name != this.prevRecord.name);
    await syncProfile(this.options.ctx.platform, this.record);
  } catch (error: any) {
    console.log("Error in updating profile permissions!!");
  }
});

mercury.hook.after("DELETE_PROFILE_RECORD", async function (this: any) {
  try {
    // Cascade Delete for Permissions and Field Permissions
    const platform: Platform = this.options.ctx.platform;
    let profileName = this.deletedRecord.name;
    platform.profilesMapper.delete(profileName);
    mercury.access.profiles = mercury.access.profiles.filter((profile: Profile) => profile.name != profileName);
  } catch (error) {
    console.log("Error in deleting profile", error.message);
  }
});
