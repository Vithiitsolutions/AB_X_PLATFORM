import mercury from "@mercury-js/core";
import mongoose from "mongoose";

interface Filter {
  fieldName: string; // e.g., "user.name"
  operator: string;  // "equals" | "in" | "regex" | "between" | "ne" | etc.
  fieldValues: any;  // actual values based on operator
}

interface QueryOptions {
  filters?: Filter[];
  sort?: { field: string; order: "asc" | "desc" };
  page?: number;
  limit?: number;
}

export class ViewService {
  userCtx: any;

  constructor(userCtx: any) {
    this.userCtx = userCtx;
  }

  async getFilters(viewId: string, context: any = {}) {
    try {
      const viewFilters = await mercury.db.ViewFilter.list(
        { view: viewId },
        { id: "1", profile: "SystemAdmin" },
        { populate: [{ path: "function" }] }
      );

      const result: any[] = [];

      for (const filter of viewFilters) {
        const func = filter.function;
        if (!func?.code) continue;

        const fnSource = Buffer.from(func.code, "base64").toString();
        const compiledFn = eval(`(${fnSource})`);
        const filterValues = await compiledFn.call(this, this.userCtx);
        result.push({
          title: filter.title,
          values: filterValues,
        });
      }

      return result;
    } catch (error) {
      console.error("Error getting filters:", error.message);
      return [];
    }
  }

  async getViewData(viewId: string, context: QueryOptions = {}) {
    try {

      const view: any = await mercury.db.View.get({ _id: viewId }, { id: "1", profile: "SystemAdmin" });
      if (!view || !view.modelName) {
        throw new Error("View or modelName not found");
      }

      const modelName = view.modelName;
      const model = mercury.db[modelName];
      if (!model) throw new Error(`Model ${modelName} not registered`);
      const pipeline = buildDynamicAggregationPipeline({
        filters: context.filters || [],
        sort: context.sort,
        page: context.page,
        limit: context.limit,
      }, model);

      const results = await model.mongoModel.aggregate(pipeline);
      return results;
    } catch (err) {
      console.error("Error in getViewData:", err.message);
      return [];
    }
  }
}

function buildDynamicAggregationPipeline(options: QueryOptions = {}, model: any) {
  const { filters = [], sort = [], page = 1, limit = 20 } = normalizeOptions(options);

  const lookups = new Map<string, any[]>();
  const matchConditions: Record<string, any>[] = [];
  const pipeline: any[] = [];

  // 1. Add default lookups from model schema (for relationship fields)
  const schemaPaths = model.mongoModel.schema.paths;
  for (const fieldName in schemaPaths) {
    const field = schemaPaths[fieldName];
    if (
      field.instance === "ObjectID" &&
      field.options &&
      field.options.ref
    ) {
      if (!lookups.has(fieldName)) {
        lookups.set(fieldName, [
          {
            $lookup: {
              from: `${field.options.ref.toLowerCase()}s`,
              localField: fieldName,
              foreignField: "_id",
              as: fieldName,
            },
          },
          { $unwind: { path: `$${fieldName}`, preserveNullAndEmptyArrays: true } },
        ]);
      }
    }
  }

  // 2. Handle filters + conditional lookups
  for (const filter of filters) {
    const pathParts = filter.fieldName.split(".");
    const condition = buildMatchCondition(filter.operator, filter.fieldValues);

    if (pathParts.length === 1) {
      matchConditions.push({ [filter.fieldName]: condition });
    } else {
      const [relation, ...nested] = pathParts;
      const nestedField = nested.join(".");

      // Add lookup only if not already there
      if (!lookups.has(relation)) {
        lookups.set(relation, [
          {
            $lookup: {
              from: `${relation.toLowerCase()}s`,
              localField: relation,
              foreignField: "_id",
              as: relation,
            },
          },
          { $unwind: { path: `$${relation}`, preserveNullAndEmptyArrays: true } },
        ]);
      }

      matchConditions.push({ [`${relation}.${nestedField}`]: condition });
    }
  }

  // 3. Add all unique lookups first
  for (const steps of lookups.values()) {
    pipeline.push(...steps);
  }

  // 4. Apply match after all lookups
  if (matchConditions.length > 0) {
    pipeline.push({ $match: { $and: matchConditions } });
  }

  // 5. Multi-field sorting
  if (Array.isArray(sort) && sort.length > 0) {
    const sortStage: Record<string, 1 | -1> = {};
    for (const s of sort) {
      sortStage[s.field] = s.order === "asc" ? 1 : -1;
    }
    pipeline.push({ $sort: sortStage });
  }

  // 6. Pagination
  const skip = (page - 1) * limit;
  pipeline.push({ $skip: skip }, { $limit: limit });

  return pipeline;
}

function buildMatchCondition(operator: string, value: any) {
  switch (operator) {
    case "equals":
      return typeof value === "string" && mongoose.isValidObjectId(value)
        ? new mongoose.Types.ObjectId(value)
        : value;
    case "in":
      return { $in: Array.isArray(value) ? value : [value] };
    case "regex":
      return { $regex: value, $options: "i" };
    case "gt":
      return { $gt: value };
    case "lt":
      return { $lt: value };
    case "ne":
      return { $ne: value };
    case "between":
      return { $gte: value[0], $lte: value[1] };
    default:
      return value;
  }
}

// Normalize sort to array
function normalizeOptions(options: QueryOptions): Required<QueryOptions> & { sort: { field: string; order: "asc" | "desc" }[] } {
  const normalized: any = { ...options };
  if (!Array.isArray(normalized.sort)) {
    normalized.sort = normalized.sort ? [normalized.sort] : [];
  }
  return {
    filters: normalized.filters || [],
    sort: normalized.sort,
    page: normalized.page || 1,
    limit: normalized.limit || 20,
  };
}