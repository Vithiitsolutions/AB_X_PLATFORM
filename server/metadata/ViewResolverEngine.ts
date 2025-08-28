import mercury from "@mercury-js/core";
import _ from "lodash";
import { ObjectId } from "mongodb";

// Search functionality - need to check - 
export class ViewResolverEngine {
  constructor(private viewId: string) { }

  async getViewDetails() {
    const view = await mercury.db.View.get({ _id: this.viewId }, { id: "1", profile: "SystemAdmin" }, { populate: [{ path: "fields", populate: [{ path: "field", select: "_id name modelName type ref many" }] }] });
    return view;
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
    const fieldSearchMap: { key: string; type: "local" | "lookup"; alias: string }[] = [];

    project["id"] = "$_id";

    fieldSearchMap.push({
      type: "local",
      key: "_id",
      alias: "id"
    });
    // 1. View field from same model -  valueField will be empty ( Post -> content )
    // 2. View Field from the same model - but valueField is empty then recordKey should be pickedup ( Post -> user -> name)
    // 3. ViewField from the same model - valueField empty and recordKey is empty then only we will show id - Handle at last
    // 3. View field from different model - valueField will not be empty ( valueField - email (mf from User) join on basis of user field from `Post`)

    // 2. Handle lookups and projections
    for (const vf of viewFields) {
      const modelField = vf.field;
      let fieldName = modelField.name;
      let valueField = vf.valueField;
      let recordKey = "";      // e.g. "name", "label"
      const fromModel = ['relationship', 'virtual'].includes(modelField.type) ? modelField.ref : modelField.modelName;  // e.g. "Product", "Status"

      // Use field name as alias to avoid conflicts when multiple fields reference the same model
      let alias = fromModel + "_" + (valueField ?? fieldName); // e.g. "user" -> "User", "assignedTo" -> "AssignedTo

      // Different Model
      if (fromModel && fromModel !== baseModel) {
        // 2a. Lookup from related model
        // Check if recordKey not present - we should display only id
        if (!valueField) {
          const mod: any = await mercury.db.Model.get({ name: fromModel }, { id: "1", profile: "SystemAdmin" }, { populate: [{ path: "recordKey" }] });
          alias = fieldName;
          recordKey = mod.recordKey.name;
          viewFieldRecordKeyMapper[vf.id] = recordKey;
        } else {
          // Check if recordKey not present - we should display only id
          recordKey = valueField;
        }

        // Handle pluralization edge cases
        const pluralizedCollection = this.pluralizeModelName(fromModel);

        pipeline.push({
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
          pipeline.push({
            $unwind: {
              path: `$${alias}`,
              preserveNullAndEmptyArrays: true,
            },
          });
          project[`${alias}`] = {
            id: `$${alias}._id`,
            [recordKey]: `$${alias}.${recordKey}`
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
      } else {
        // 2c. Base model field
        const key = `${baseModel}.${fieldName}`;
        project[key] = `$${fieldName}`;
        fieldSearchMap.push({ type: "local", key, alias: fieldName });
      }
    }
    // 3. Search (OR condition)
    if (search) {
      const orConditions: any[] = [];

      viewFields.forEach(async (vf) => {
        const modelField = vf.field;
        const valueField = vf.valueField;
        const fromModel = ['relationship', 'virtual'].includes(modelField.type) ? modelField.ref : modelField.modelName;  // e.g. "Product", "Status"
        const isFromBaseModel = fromModel == baseModel;
        const fieldName = modelField.name;
        const fieldType = modelField.type;

        if (isFromBaseModel) {
          // Handle different field types for base model fields
          const searchConditions = this.buildSearchConditions(fieldName, fieldType, search, modelField.enumValues);
          orConditions.push(...searchConditions);
        } else {
          let lookupFieldPath;
          if (valueField) {
            lookupFieldPath = fromModel + "_" + valueField + "." + valueField;
          } else {
            // get record Key and then check using fieldName
            const recordKey = viewFieldRecordKeyMapper[vf.id];
            lookupFieldPath = fieldName + "." + recordKey;
          }
          orConditions.push({ [lookupFieldPath]: { $regex: search, $options: "i" } });
        }
      });

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
          $match: { $or: orConditions }
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

    return {
      model: baseModel,
      pipeline,
      fieldSearchMap, // used for flattening
    };
  }

  //   View - Post
  // Fields - description, user, acceptedBy - multiple users

  // Utility to flatten "product.name" => "product"
  flattenViewData(data: Record<string, any>[], fieldSearchMap: { key: string; alias: string }[]) {
    return data.map((row) => {
      const result: Record<string, any> = {};
      for (const f of fieldSearchMap) {
        // Now handles both scalar and object (relationship) values correctly
        result[f.alias.toLowerCase()] = _.get(row, f.key);
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
    const { model, pipeline, fieldSearchMap } = await this.buildAggregationPipeline(options);
    const rawData = await mercury.db[model].mongoModel.aggregate(pipeline);
    const finalData = this.flattenViewData(rawData, fieldSearchMap);

    return finalData;
  }

  // Helper method to properly pluralize model names for collection names
  private pluralizeModelName(modelName: string): string {
    const lowerCaseModel = modelName.toLowerCase();

    // Handle words ending in 'y' preceded by a consonant (category -> categories)
    if (lowerCaseModel.endsWith('y') && lowerCaseModel.length > 1) {
      const secondLastChar = lowerCaseModel[lowerCaseModel.length - 2];
      // Check if the character before 'y' is a consonant (not a vowel)
      if (!'aeiou'.includes(secondLastChar)) {
        return lowerCaseModel.slice(0, -1) + 'ies';
      }
    }

    // Handle words ending in 's', 'ss', 'sh', 'ch', 'x', 'z' (class -> classes)
    if (lowerCaseModel.endsWith('s') ||
      lowerCaseModel.endsWith('ss') ||
      lowerCaseModel.endsWith('sh') ||
      lowerCaseModel.endsWith('ch') ||
      lowerCaseModel.endsWith('x') ||
      lowerCaseModel.endsWith('z')) {
      return lowerCaseModel + 'es';
    }

    // Default case: just add 's'
    return lowerCaseModel + 's';
  }

  // Build search conditions based on field type
  private buildSearchConditions(fieldName: string, fieldType: string, searchValue: string, enumValues?: string[]): any[] {
    const conditions: any[] = [];
    const trimmedSearch = searchValue.trim();

    if (!trimmedSearch) {
      return conditions;
    }

    switch (fieldType) {
      case 'string':
        // String fields: case-insensitive regex search
        conditions.push({ [fieldName]: { $regex: trimmedSearch, $options: "i" } });
        break;

      case 'number':
      case 'int':
        // Number fields: exact match and partial match for number conversion
        const numValue = parseFloat(trimmedSearch);
        if (!isNaN(numValue)) {
          conditions.push({ [fieldName]: numValue });
        }
        // Also try string representation in case numbers are stored as strings
        conditions.push({ [fieldName]: { $regex: `^${trimmedSearch}`, $options: "i" } });
        break;

      case 'float':
        // Float fields: exact match and partial match
        const floatValue = parseFloat(trimmedSearch);
        if (!isNaN(floatValue)) {
          conditions.push({ [fieldName]: floatValue });
        }
        // Also try string representation
        conditions.push({ [fieldName]: { $regex: `^${trimmedSearch}`, $options: "i" } });
        break;

      case 'boolean':
        // Boolean fields: match various boolean representations
        const lowerSearch = trimmedSearch.toLowerCase();
        if (['true', 'yes', '1', 'on', 'enabled'].includes(lowerSearch)) {
          conditions.push({ [fieldName]: true });
        } else if (['false', 'no', '0', 'off', 'disabled'].includes(lowerSearch)) {
          conditions.push({ [fieldName]: false });
        }
        // Partial matches for boolean strings
        if ('true'.includes(lowerSearch) || 'yes'.includes(lowerSearch)) {
          conditions.push({ [fieldName]: true });
        }
        if ('false'.includes(lowerSearch) || 'no'.includes(lowerSearch)) {
          conditions.push({ [fieldName]: false });
        }
        break;

      case 'date':
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
                $lte: endOfDay
              }
            });
          }
        } catch (err) {
          // If date parsing fails, try string search on date field
          conditions.push({ [fieldName]: { $regex: trimmedSearch, $options: "i" } });
        }
        break;

      case 'enum':
        // Enum fields: case-insensitive partial match
        if (enumValues && enumValues.length > 0) {
          enumValues.forEach(enumValue => {
            if (enumValue.toLowerCase().includes(trimmedSearch.toLowerCase())) {
              conditions.push({ [fieldName]: enumValue });
            }
          });
        }
        // Fallback to regex search if no enum matches found
        conditions.push({ [fieldName]: { $regex: trimmedSearch, $options: "i" } });
        break;
      default:
        // Default to string search for unknown types
        conditions.push({ [fieldName]: { $regex: trimmedSearch, $options: "i" } });
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
      limit: 1
    });

    // Remove pagination stages and projection from pipeline for count
    const countPipeline = pipeline.filter(stage =>
      !stage.$skip && !stage.$limit && !stage.$project
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