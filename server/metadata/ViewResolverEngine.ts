import mercury from "@mercury-js/core";
import _ from "lodash";

// Search functionality - need to check - 
export class ViewResolverEngine {
  constructor(private viewId: string) { }

  async getViewDetails() {
    const view = await mercury.db.View.get({ _id: this.viewId }, { id: "1", profile: "SystemAdmin" }, { populate: [{ path: "fields", populate: [{ path: "field", select: "_id name modelName type ref" }] }] });
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
    const recordKeyMap: Record<string, any> = {};
    const fieldSearchMap: { key: string; type: "local" | "lookup"; alias: string }[] = [];

    // 2. Handle lookups and projections
    for (const vf of viewFields) {
      const modelField = vf.field;
      let fieldName = modelField.name;
      let recordKey = "";      // e.g. "name", "label"
      const fromModel = modelField.type == 'relationship' ? modelField.ref : modelField.modelName;  // e.g. "Product", "Status"

      const alias = fromModel; // Use model name as alias for clarity

      if (fromModel && fromModel !== baseModel) {
        // 2a. Lookup from related model
        const mod: any = await mercury.db.Model.get({ name: fromModel }, { id: "1", profile: "SystemAdmin" }, { populate: [{ path: "recordKey" }] });
        recordKey = mod.recordKey.name;
        pipeline.push({
          $lookup: {
            from: fromModel.toLowerCase() + 's',
            localField: fieldName, // check here model name to small case
            foreignField: "_id",
            as: alias,
            pipeline: [
              {
                $project: {
                  [recordKey]: 1,
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

        recordKeyMap[fieldName] = recordKey;

        // 2b. Project as namespaced key
        const key = `${alias}.${recordKey}`; // e.g., product.name
        project[key] = `$${alias}.${recordKey}`;
        fieldSearchMap.push({ type: "lookup", key, alias: fieldName });
      } else {
        // 2c. Base model field
        const key = `${baseModel}.${fieldName}`;
        project[key] = `$${fieldName}`;
        fieldSearchMap.push({ type: "local", key, alias: fieldName });
      }
    }

    // 3. Search (OR condition)
    if (search) {
      const orConditions = viewFields.map((vf) => {
        const modelField = vf.field;
        const isFromBaseModel = modelField.type != "relationship";

        if (isFromBaseModel) {
          return { [modelField.name]: { $regex: search, $options: "i" } };
        } else {
          const recordKey = recordKeyMap[modelField.name];
          const alias = modelField.ref;
          return { [`${alias}.${recordKey}`]: { $regex: search, $options: "i" } };
        }
      });
      pipeline.push({
        $match: { $or: orConditions }
      });
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

  // Utility to flatten "product.name" => "product"
  flattenViewData(data: Record<string, any>[], fieldSearchMap: { key: string; alias: string }[]) {
    return data.map((row) => {
      const result: Record<string, any> = {};
      for (const f of fieldSearchMap) {
        result[f.alias] = _.get(row, f.key);  // safe nested access
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
}