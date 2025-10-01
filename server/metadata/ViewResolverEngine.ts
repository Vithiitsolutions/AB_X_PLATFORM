import mercury from "@mercury-js/core";
import _ from "lodash";
import { ObjectId } from "mongodb";

// Search functionality - need to check -
export class ViewResolverEngine {
  constructor(private viewId: string) { }

  async getViewDetails() {
    const view = await mercury.db.View.get(
      { _id: this.viewId },
      { id: "1", profile: "SystemAdmin" },
      {
        populate: [
          {
            path: "fields",
            populate: [
              { path: "field", select: "_id name modelName type ref many" },
            ],
          },
        ],
      }
    );
    return view;
  }

  private parseBracketValueField(v: string) {
    const parts = (v || "").split(".").filter(Boolean);
    const tokens = parts.map((p) => {
      const m = p.match(/^([^\[]+)(?:\[(.+)\])?$/);
      if (!m) return { field: p, model: undefined };
      return { field: m[1], model: m[2] }; // model may be undefined
    });
    return tokens;
  }

  async buildAggregationPipeline({
    filters = {},
    sort = {},
    page = 1,
    limit = 20,
    search = "",
  }) {
    // 1. Fetch view and viewFields with their modelFields
    const view: any = await this.getViewDetails();

    const baseModel = view.modelName;
    const viewFields = view.fields.filter((f) => f.visible);

    const pipeline: any[] = [];
    const viewFieldRecordKeyMapper: Record<string, string> = {};
    const project: Record<string, any> = {};
    const recordKeyMap: Record<string, any> = {};
    const fieldSearchMap: {
      key: string;
      type: "local" | "lookup";
      alias: string;
    }[] = [];

    project["id"] = "$_id";
    // project["createdOn"] = "$createdOn";

    fieldSearchMap.push({
      type: "local",
      key: "_id",
      alias: "id",
    });

    // fieldSearchMap.push({
    //   type: "local",
    //   key: "createdOn",
    //   alias: "createdOn",
    // });

    // ----------------------------
    // 2. Handle lookups and projections
    // ----------------------------
    let miniPipeline = [];
    for (const vf of viewFields) {
      const modelField = vf.field;
      let fieldName = modelField.name;
      let valueField = vf.valueField;
      let recordKey = ""; // e.g. "name", "label"
      const isVirtualField = modelField.type == "virtual";
      const fromModel = ["relationship", "virtual"].includes(modelField.type)
        ? modelField.ref
        : modelField.modelName; // e.g. "Product", "Status"

      // Use field name as alias to avoid conflicts when multiple fields reference the same model
      let alias = fromModel + "_" + (valueField ?? fieldName); // default alias (may be overridden)

      // Different Model (lookup required)
      if (fromModel && fromModel !== baseModel) {
        // --- NEW: support bracket-syntax nested lookups like politicalParty[Party].name
        const isBracketNested = typeof valueField === "string" && valueField.includes("[");

        if (isBracketNested) {
          // parse tokens
          const tokens = this.parseBracketValueField(valueField!); // array of {field, model?}
          // final token should be the leaf attribute (user will ensure this)
          const leafToken = tokens[tokens.length - 1];
          const leafName = leafToken.field; // e.g. 'name'

          // build inner pipeline that will be executed inside the main lookup (on fromModel docs)
          const innerPipeline: any[] = [];

          // we'll create sequential lookups inside this inner pipeline for every token that has a 'model'
          // prevAlias refers to the alias we created inside this inner pipeline (for the looked up sub-doc)
          let prevAlias: string | null = null;

          for (let i = 0; i < tokens.length; i++) {
            const tk = tokens[i];
            const hasModel = !!tk.model;
            if (hasModel) {
              // lookup this model from the current doc
              // localField: if prevAlias exists => `${prevAlias}.${tk.field}` else `${tk.field}`
              const localFieldInDoc = prevAlias ? `${prevAlias}.${tk.field}` : tk.field;
              const subAlias = `${tk.field}_${tk.model}`; // e.g. politicalParty_Party

              // push a lookup stage inside the inner pipeline
              innerPipeline.push({
                $lookup: {
                  from: this.pluralizeModelName(tk.model!),
                  localField: localFieldInDoc,
                  foreignField: "_id",
                  as: subAlias,
                },
              });

              // unwind the subAlias so we can reference its fields directly
              innerPipeline.push({
                $unwind: {
                  path: `$${subAlias}`,
                  preserveNullAndEmptyArrays: true,
                },
              });

              // update prevAlias to point to this new looked-up object
              prevAlias = subAlias;

              // continue loop - if next token is a plain field, we'll reference it off prevAlias
            } else {
              // token has no model: it's a direct field on the current doc or on the last looked-up doc
              // final projection: if prevAlias exists, pick from `$${prevAlias}.${tk.field}` else `$${tk.field}`
              const finalPath = prevAlias ? `$${prevAlias}.${tk.field}` : `$${tk.field}`;
              innerPipeline.push({
                $project: {
                  _id: 1,
                  [leafName]: finalPath,
                },
              });
              break; // leaf reached -> stop building deeper lookups
            }
          } // end tokens loop

          // set alias for main lookup (deterministic)
          const tokenPath = tokens.map((t) => t.field).join("_");
          alias = `${fromModel}_${tokenPath}`; // e.g. UserAttribute_politicalParty_name

          // perform the main lookup from base doc into fromModel collection, using innerPipeline
          const pluralizedCollection = this.pluralizeModelName(fromModel);
          pipeline.push({
            $lookup: {
              from: pluralizedCollection,
              localField: isVirtualField ? "_id" : fieldName,
              foreignField: isVirtualField ? baseModel.toLowerCase() : "_id",
              as: alias,
              pipeline: innerPipeline,
            },
          });

          // map recordKey & projection
          recordKeyMap[leafName] = leafName;

          if (!modelField.many) {
            pipeline.push({
              $unwind: {
                path: `$${alias}`,
                preserveNullAndEmptyArrays: true,
              },
            });
            // project final flat fields
            project[alias] = {
              id: `$${alias}._id`,
              [leafName]: `$${alias}.${leafName}`,
            };
          } else {
            project[alias] = {
              $map: {
                input: `$${alias}`,
                as: "item",
                in: {
                  id: `$$item._id`,
                  [leafName]: `$$item.${leafName}`,
                },
              },
            };
          }

          fieldSearchMap.push({ type: "lookup", key: alias, alias: vf.title ?? alias });
        } else {
          // --- SIMPLE (existing) behavior for non-bracket valueFields (keep unchanged)
          // Check if valueField not present - fallback to referenced model.recordKey
          if (!valueField) {
            const mod: any = await mercury.db.Model.get(
              { name: fromModel },
              { id: "1", profile: "SystemAdmin" },
              { populate: [{ path: "recordKey" }] }
            );
            alias = fieldName;
            recordKey = mod.recordKey.name;
            viewFieldRecordKeyMapper[vf.id] = recordKey;
          } else {
            recordKey = valueField;
          }

          // Handle pluralization edge cases
          const pluralizedCollection = this.pluralizeModelName(fromModel);

          miniPipeline.push({
            $lookup: {
              from: pluralizedCollection,
              localField: fieldName, // check here model name to small case
              foreignField: "_id",
              as: alias,
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    [recordKey]: 1,
                  },
                },
              ],
            },
          });

          // For user if we want to display email, fieldName = user, recordKey - email
          recordKeyMap[recordKey] = recordKey;

          if (!modelField.many) {
            miniPipeline.push({
              $unwind: {
                path: `$${alias}`,
                preserveNullAndEmptyArrays: true,
              },
            });
            project[`${alias}`] = {
              id: `$${alias}._id`,
              [recordKey]: `$${alias}.${recordKey}`,
            };
          } else {
            // many relationship projection (array → map)
            project[alias] = {
              $map: {
                input: `$${alias}`,
                as: "item",
                in: {
                  id: `$$item._id`,
                  [recordKey]: `$$item.${recordKey}`,
                },
              },
            };
          }

          fieldSearchMap.push({ type: "lookup", key: alias, alias: alias });
        } // end simple vs bracket nested
      } else {
        // 2c. Base model field
        const key = `${baseModel}.${fieldName}`;
        project[key] = `$${fieldName}`;
        fieldSearchMap.push({ type: "local", key, alias: fieldName });
      }
    } // end for viewFields

    if (miniPipeline.length) pipeline.push(...miniPipeline);

    // ----------------------------
    // 3. Search (OR condition)
    // ----------------------------
    if (search) {
      const orConditions: any[] = [];

      for (const vf of viewFields) {
        const modelField = vf.field;
        const valueField = vf.valueField;
        const fromModel = ["relationship", "virtual"].includes(modelField.type)
          ? modelField.ref
          : modelField.modelName; // e.g. "Product", "Status"
        const isFromBaseModel = fromModel == baseModel;
        const fieldName = modelField.name;
        const fieldType = modelField.type;

        if (isFromBaseModel) {
          // Handle different field types for base model fields
          const searchConditions = this.buildSearchConditions(
            fieldName,
            fieldType,
            search,
            modelField.enumValues
          );
          orConditions.push(...searchConditions);
        } else {
          // relationship fields
          let lookupFieldPath: string | undefined;

          // if bracket nested pattern, compute alias and leaf name
          if (typeof valueField === "string" && valueField.includes("[")) {
            const tokens = this.parseBracketValueField(valueField);
            const tokenPath = tokens.map((t) => t.field).join("_");
            const aliasName = `${fromModel}_${tokenPath}`;
            const leaf = tokens[tokens.length - 1].field;
            lookupFieldPath = `${aliasName}.${leaf}`;
          } else if (valueField) {
            lookupFieldPath = `${fromModel}_${valueField}.${valueField}`;
          } else {
            // get record Key and then check using fieldName
            const recordKey = viewFieldRecordKeyMapper[vf.id];
            lookupFieldPath = fieldName + "." + recordKey;
          }

          if (lookupFieldPath) {
            orConditions.push({ [lookupFieldPath]: { $regex: search, $options: "i" } });
          }
        }
      }

      // Try to match ObjectId
      try {
        const objectId = new ObjectId(search);
        orConditions.push({ _id: objectId });
      } catch (err) {
        // If not a valid ObjectId, add string regex search for _id
        orConditions.push({ _id: { $regex: search, $options: "i" } });
      }

      if (orConditions.length > 0) {
        pipeline.push({
          $match: { $or: orConditions },
        });
      }
    }

    // 4. Filters
    if (Object.keys(filters).length > 0) {
      pipeline.push({ $match: filters });
    }

    // 5. Sort
    if (Object.keys(sort).length > 0) {
      pipeline.push({ $sort: sort });
    } else {
      // By default created on - desc order?
      pipeline.push({ $sort: { updatedOn: -1, createdOn: -1 } });
    }

    // 6. Pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });

    // 7. Final projection
    pipeline.push({ $project: project });
    // console.log("Aggregation Pipeline:", JSON.stringify(pipeline, null, 2));

    return {
      model: baseModel,
      pipeline,
      fieldSearchMap, // used for flattening
    };
  }

  //   View - Post
  // Fields - description, user, acceptedBy - multiple users

  // Utility to flatten "product.name" => "product"
  flattenViewData(
    data: Record<string, any>[],
    fieldSearchMap: { key: string; alias: string }[]
  ) {
    return data.map((row) => {
      const result: Record<string, any> = {};
      for (const f of fieldSearchMap) {
        // Now handles both scalar and object (relationship) values correctly
        result[f.alias] = _.get(row, f.key);
      }
      return result;
    });
  }

  // key - modelname + valuefield, alis also?
  // Combine everything
  async resolveViewData(options: {
    filters?: Record<string, any>;
    sort?: Record<string, 1 | -1>;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { model, pipeline, fieldSearchMap } =
      await this.buildAggregationPipeline(options);
    const rawData = await mercury.db[model].mongoModel.aggregate(pipeline);
    const finalData = this.flattenViewData(rawData, fieldSearchMap);

    return finalData;
  }

  // Helper method to properly pluralize model names for collection names
  private pluralizeModelName(modelName: string): string {
    const lowerCaseModel = modelName.toLowerCase();

    // Handle words ending in 'y' preceded by a consonant (category -> categories)
    if (lowerCaseModel.endsWith("y") && lowerCaseModel.length > 1) {
      const secondLastChar = lowerCaseModel[lowerCaseModel.length - 2];
      // Check if the character before 'y' is a consonant (not a vowel)
      if (!"aeiou".includes(secondLastChar)) {
        return lowerCaseModel.slice(0, -1) + "ies";
      }
    }

    // Handle words ending in 's', 'ss', 'sh', 'ch', 'x', 'z' (class -> classes)
    if (
      lowerCaseModel.endsWith("s") ||
      lowerCaseModel.endsWith("ss") ||
      lowerCaseModel.endsWith("sh") ||
      lowerCaseModel.endsWith("ch") ||
      lowerCaseModel.endsWith("x") ||
      lowerCaseModel.endsWith("z")
    ) {
      return lowerCaseModel + "es";
    }

    // Default case: just add 's'
    return lowerCaseModel + "s";
  }

  // Build search conditions based on field type
  private buildSearchConditions(
    fieldName: string,
    fieldType: string,
    searchValue: string,
    enumValues?: string[]
  ): any[] {
    const conditions: any[] = [];
    const trimmedSearch = searchValue.trim();

    if (!trimmedSearch) {
      return conditions;
    }

    switch (fieldType) {
      case "string":
        // String fields: case-insensitive regex search
        conditions.push({
          [fieldName]: { $regex: trimmedSearch, $options: "i" },
        });
        break;

      case "number":
      case "int":
        // Number fields: exact match and partial match for number conversion
        const numValue = parseFloat(trimmedSearch);
        if (!isNaN(numValue)) {
          conditions.push({ [fieldName]: numValue });
        }
        // Also try string representation in case numbers are stored as strings
        conditions.push({
          [fieldName]: { $regex: `^${trimmedSearch}`, $options: "i" },
        });
        break;

      case "float":
        // Float fields: exact match and partial match
        const floatValue = parseFloat(trimmedSearch);
        if (!isNaN(floatValue)) {
          conditions.push({ [fieldName]: floatValue });
        }
        // Also try string representation
        conditions.push({
          [fieldName]: { $regex: `^${trimmedSearch}`, $options: "i" },
        });
        break;

      case "boolean":
        // Boolean fields: match various boolean representations
        const lowerSearch = trimmedSearch.toLowerCase();
        if (["true", "yes", "1", "on", "enabled"].includes(lowerSearch)) {
          conditions.push({ [fieldName]: true });
        } else if (
          ["false", "no", "0", "off", "disabled"].includes(lowerSearch)
        ) {
          conditions.push({ [fieldName]: false });
        }
        // Partial matches for boolean strings
        if ("true".includes(lowerSearch) || "yes".includes(lowerSearch)) {
          conditions.push({ [fieldName]: true });
        }
        if ("false".includes(lowerSearch) || "no".includes(lowerSearch)) {
          conditions.push({ [fieldName]: false });
        }
        break;

      case "date":
        // Date fields: try multiple date formats and ranges
        try {
          const dateValue = new Date(trimmedSearch);
          if (!isNaN(dateValue.getTime())) {
            const startOfDay = new Date(dateValue);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateValue);
            endOfDay.setHours(23, 59, 59, 999);

            conditions.push({
              [fieldName]: {
                $gte: startOfDay,
                $lte: endOfDay,
              },
            });
          }
        } catch (err) {
          // If date parsing fails, try string search on date field
          conditions.push({
            [fieldName]: { $regex: trimmedSearch, $options: "i" },
          });
        }
        break;

      case "enum":
        // Enum fields: case-insensitive partial match
        if (enumValues && enumValues.length > 0) {
          enumValues.forEach((enumValue) => {
            if (enumValue.toLowerCase().includes(trimmedSearch.toLowerCase())) {
              conditions.push({ [fieldName]: enumValue });
            }
          });
        }
        // Fallback to regex search if no enum matches found
        conditions.push({
          [fieldName]: { $regex: trimmedSearch, $options: "i" },
        });
        break;
      default:
        // Default to string search for unknown types
        conditions.push({
          [fieldName]: { $regex: trimmedSearch, $options: "i" },
        });
        break;
    }

    return conditions;
  }

  // Get total count for pagination
  async getTotalCount(options: {
    filters?: Record<string, any>;
    search?: string;
  }) {
    const { model, pipeline } = await this.buildAggregationPipeline({
      ...options,
      page: 1,
      limit: 1,
    });

    // Remove pagination stages and projection from pipeline for count
    const countPipeline = pipeline.filter(
      (stage) => !stage.$skip && !stage.$limit && !stage.$project
    );

    // Add count stage
    countPipeline.push({ $count: "total" });

    const result = await mercury.db[model].mongoModel.aggregate(countPipeline);

    return result.length > 0 ? result[0].total : 0;
  }
}

// Post - id, description, user ( record key - name )

//  Post VIew - Post description, user_name, user_email

// user: { id , name , email }
// survey: {}
