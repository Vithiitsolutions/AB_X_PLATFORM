import mercury, { Rule, TField, TFields, TOptions } from "@mercury-js/core";
import _ from "lodash";
import { mergeProfilePermissions, overrideWithExplicitPermissions, profilePipeline } from "./utility";

export class Platform {
  profilesMapper = new Map();
  profileIdMapper: Record<string, any> = {};
  typeMapping: Record<string, (val: any) => any> = {
    number: (val) => Number(val),
    boolean: (val) => val === "true",
    string: (val) => String(val),
  };
  constructor() {
    console.log("Platform started!!!");
  }

  async initialize() {
    console.time("Platform Initialization Time");
    console.time("Models Initialization Time");
    try {
      const models = await mercury.db.Model.list(
        {},
        { id: "1", profile: "SystemAdmin" },
        {
          populate: [
            { path: "fields", populate: [{ path: "options" }] },
            { path: "options" },
          ],
        }
      );

      for (const model of models) {
        const schema: TFields = this.composeSchema(model.fields);
        const options: TOptions = this.composeOptions(model.options);
        mercury.createModel(model.name, schema, options);
      }
      console.log("Models initialized successfully!");
      console.timeEnd("Models Initialization Time");
      await this.initializeProfiles();
    } catch (error) {
      console.error("Error during platform initialization:", error);
    } finally {
      console.timeEnd("Platform Initialization Time");
    }
  }

  // Error message genric
  // Scenarios to test
  // 1. Single Profile - no inherited profiles - access for model and field level check - done
  // 2. Single Profile - inherited profiles - true - no overlapping models - done
  // 3. Single Profile - inherited profiels - true - overlapping true - on model level and on field level : 1. model level access diff, 2. fieldlevelaccess - false and true - working, 3. fieldlevelaccess - same field, diff access - done, 4. fieldlevelaccess - diff field check for merge - done
  // Future enhancement - Profile - inherited, but wanted to provide certain access control over fields?
  // 4. Profile Ids - for code based profiles ?

  public async initializeProfiles() {
    // Profiles from db and from mercury handle both during intialization step and also during api calls
    console.time("Profiles Initialization Time");
    try {
      const profiles = await mercury.db.Profile.mongoModel.aggregate(profilePipeline);
      if (_.isEmpty(profiles)) {
        console.log("No profiles found.");
        return;
      }

      profiles.forEach((profile: any) => {
        this.profileIdMapper[profile._id] = {
          id: profile._id,
          name: profile.name,
          label: profile.label,
          permissions: profile.permissions || [],
          inheritedProfiles: profile.inheritedProfiles || []
        };
      });

      for (const profileId in this.profileIdMapper) {
        this.profileIdMapper[profileId].permissions = this.composePermissions(this.profileIdMapper[profileId]);
        mercury.access.createProfile(this.profileIdMapper[profileId].name, this.profileIdMapper[profileId].permissions);
      }

      console.log("Profiles initialized successfully!");
    } catch (error) {
      console.error("Error during profile initialization:", error);
    } finally {
      console.timeEnd("Profiles Initialization Time");
    }
  }

  // Give type to profile

  public composePermissions(profile: any) {
    if (this.profilesMapper.has(profile.name)) {
      return this.profilesMapper.get(profile.name);
    }
    let permissions: any[] = [];
    for (const inheritedId of profile.inheritedProfiles) {
      const inheritedProfile = this.profileIdMapper[inheritedId.toString()];
      const inheritedPermissions = this.composePermissions(inheritedProfile);
      permissions = mergeProfilePermissions(permissions, inheritedPermissions);
    }
    const customPermissions = this.composeProfilePermissions(profile.permissions);
    permissions = overrideWithExplicitPermissions(permissions, customPermissions);
    this.profilesMapper.set(profile.name, permissions);
    return permissions;
  }


  public composeProfilePermissions(permissions: any) {
    const rules: Rule[] = [];
    permissions.map(async (permission: any) => {
      const rule: Rule = {
        modelName: permission.modelName,
        access: this.composeModelPermission(permission),
      };
      if (permission.fieldLevelAccess) {
        rule['fieldLevelAccess'] = permission.fieldLevelAccess;
        rule['fields'] =
          this.composeFieldPermissions(permission.fieldPermissions);
      }
      rules.push(rule);
    })
    return rules;
  }

  public composeModelPermission(permission: any) {
    const access: any = {};
    ['create', 'update', 'delete', 'read'].map((action: string) => {
      access[action] = permission[action];
    });
    return access;
  }

  public composeFieldPermissions(fieldPermissions: any) {
    const fields: any = {};
    fieldPermissions.map((fieldPermission: any) => {
      if (_.isEmpty(fields[fieldPermission.fieldName])) fields[fieldPermission.fieldName] = {};
      ['create', 'update', 'delete', 'read'].map((action: string) => {
        fields[fieldPermission.fieldName][action] = fieldPermission[action];
      });
    });
    return fields;
  }

  public async composeModel(modelName: string) {
    try {
      const model: any = await mercury.db.Model.get(
        { name: modelName },
        { id: "1", profile: "SystemAdmin" },
        {
          populate: [
            { path: "fields", populate: [{ path: "options" }] },
            { path: "options" },
          ],
        }
      )
      if (_.isEmpty(model)) return {};
      const schema: TFields = this.composeSchema(model.fields);
      const options: TOptions = this.composeOptions(model.options);
      mercury.deleteModel(model.name);
      mercury.createModel(model.name, schema, options);
    } catch (error: any) {
      console.log("Error in composing model!", error);
    }
  }


  public composeSchema(fields: [Record<string, any>]): TFields {
    const skipFields = new Set([
      "id",
      "_id",
      "type",
      "name",
      "model",
      "modelName",
      "label",
      "createdBy",
      "updatedBy",
      "managed",
      "fieldOptions",
      "createdOn",
      "updatedOn",
      "__v",
    ]);

    return fields.reduce((schema: Record<string, any>, field: any) => {
      const fieldName = field["name"];
      const fieldObj: TField = { type: field["type"] };
      // Handle for relationship and virutal types
      for (const key of Object.keys(field["_doc"] ?? field)) {
        if (skipFields.has(key)) continue;
        if (key !== "enumValues") {
          fieldObj[key] = field[key];
        } else if (field[key].length) {
          fieldObj["enum"] = field[key];
        }
      }

      if (field.options) {
        field.options.forEach((option: any) => {
          const { keyName, type, value } = option;
          fieldObj[keyName] = this.typeMapping[type]
            ? this.typeMapping[type](value)
            : Boolean(value);
        });
      }

      schema[fieldName] = fieldObj;
      return schema;
    }, {});
  }

  composeOptions(
    options: Array<{ keyName: string; type: string; value: any }>
  ): TOptions {
    return options.reduce(
      (schema: any, option: { keyName: string; type: string; value: any }) => {
        const { keyName, type, value } = option;
        schema[keyName] = this.typeMapping[type]
          ? this.typeMapping[type](value)
          : Boolean(value);
        return schema;
      },
      {}
    );
  }
}
