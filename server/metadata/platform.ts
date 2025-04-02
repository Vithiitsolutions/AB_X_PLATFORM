import mercury, { TField, TFields, TOptions } from "@mercury-js/core";
import _ from "lodash";

export class Platform {
  typeMapping: Record<string, (val: any) => any> = {
    number: (val) => Number(val),
    boolean: (val) => val === "true",
    string: (val) => String(val),
  };
  constructor() {
    // Pending - Model, Model Options, Field Options
    // Finished - Model Fields
    console.log("Platform is created");
  }

  async initialize() {
    console.time("Platform Initialization Time");
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
    } catch (error) {
      console.error("Error during platform initialization:", error);
    } finally {
      console.timeEnd("Platform Initialization Time");
    }
  }

  // Next step - Profile and Profile Groups
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
      for (const key of Object.keys(field["_doc"] ?? field)) { // field["_doc"]
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
