import mercury from "@mercury-js/core";

export class ViewResolverEngine {
  constructor(private viewId: string) { }

  async getViewDetails() {
    const view = await mercury.db.View.get({ _id: this.viewId }, { id: "1", profile: "SystemAdmin" }, { populate: [{ path: "fields", populate: [{ path: "field", select: "_id name modelName type" }] }] });
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
    const project: Record<string, any> = {};
    const fieldSearchMap: { key: string; type: "local" | "lookup"; alias: string }[] = [];

    // 2. Handle lookups and projections
    for (const vf of viewFields) {
      const modelField = vf.field;
      const fieldName = modelField.name;       // e.g. "name", "label"
      const fromModel = modelField.modelName;  // e.g. "Product", "Status"

      const alias = fromModel; // Use model name as alias for clarity

      if (fromModel && fromModel !== baseModel) {
        // 2a. Lookup from related model
        pipeline.push({
          $lookup: {
            from: fromModel,
            localField: fieldName, // check here model name to small case
            foreignField: "_id",
            as: alias,
            pipeline: [
              {
                $project: {
                  [fieldName]: 1,
                  _id: 0,
                },
              },
            ],
          },
        });

        pipeline.push({
          $unwind: {
            path: `$${alias}`,
            preserveNullAndEmptyArrays: true,
          },
        });

        // 2b. Project as namespaced key
        const key = `${alias}.${fieldName}`; // e.g., product.name
        project[key] = `$${alias}.${fieldName}`;
        fieldSearchMap.push({ type: "lookup", key, alias });
      } else {
        // 2c. Base model field
        const key = `${baseModel}.${fieldName}`;
        project[key] = `$${fieldName}`;
        fieldSearchMap.push({ type: "local", key, alias: fieldName });
      }
    }

    // 3. Search (OR condition)
    if (search) {
      const orConditions = fieldSearchMap.map((f) => ({
        // For local model simple filed name should be enough
        [f.key]: { $regex: search, $options: "i" },
      }));
      pipeline.push({ $match: { $or: orConditions } });
    }

    // 4. Filters
    if (Object.keys(filters).length > 0) {
      pipeline.push({ $match: filters });
    }

    // 5. Sort
    if (Object.keys(sort).length > 0) {
      pipeline.push({ $sort: sort });
    } else {
      pipeline.push({ $sort: { _id: -1 } });
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

  // Utility to flatten "product.name" => "product"
  flattenViewData(data: Record<string, any>[], fieldSearchMap: { key: string; alias: string }[]) {
    return data.map((row) => {
      const result: Record<string, any> = {};
      for (const f of fieldSearchMap) {
        if (f.key in row) {
          result[f.alias] = row[f.key];
        }
      }
      return result;
    });
  }

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

  generateViewTypeSchema(viewFields: any[], baseModel: string) {
    const typeMap: Record<string, string> = {};

    for (const vf of viewFields) {
      const field = vf.field;
      if (!field) continue;

      const isFromBaseModel = field.modelName === baseModel;
      const key = isFromBaseModel ? field.name : field.modelName;

      let gqlType = "String";
      switch (field.type) {
        case "number":
          gqlType = "Float"; break;
        case "boolean":
          gqlType = "Boolean"; break;
        case "date":
          gqlType = "Date"; break;
        case "enum":
          gqlType = this.capitalizeEnumName(field.name); break;
        case "string":
        default:
          gqlType = "String"; break;
      }

      typeMap[key] = gqlType;
    }

    return typeMap;
  }

  capitalizeEnumName(name: string) {
    // Review
    return name.charAt(0).toUpperCase() + name.slice(1) + "Enum";
  }

}
