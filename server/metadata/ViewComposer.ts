import _ from "lodash";
import mercury from "@mercury-js/core";
import { ViewResolverEngine } from "./ViewResolverEngine";


type ViewQueryArgs = {
  filters?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  page?: number;
  limit?: number;
  search?: string;
};

export const fieldTypeMap: { [key: string]: string } = {
  string: "String",
  number: "Int",
  boolean: "Boolean",
  date: "DateTime",
  float: "Float",
};

export class ViewComposer {
  static async composeViews() {
    const views = await mercury.db.View.mongoModel.find({});
    const resolvers: Record<string, any> = { Query: {} };
    let typeDefs = "";
    const queryFields: string[] = [];

    for (const view of views) {
      const viewId = view._id.toString();
      const viewName = _.camelCase(view.name);
      const typeName = `${_.upperFirst(viewName)}ViewType`;

      const engine = new ViewResolverEngine(viewId);
      const viewWithFields: any = await mercury.db.View.get(
        { _id: viewId },
        { id: "1", profile: "SystemAdmin" },
        {
          populate: [
            { path: "fields", populate: [{ path: "field", select: "name modelName type enumValues ref many" }] },
            { path: "profiles", select: "name" },
          ],
        }
      );

      const { typeMap, enums, subTypes } = await generateViewTypeSchema(
        viewWithFields.fields,
        view.modelName
      );
      const gqlType = toGraphQLTypeDef(typeMap, typeName);
      typeDefs += `\n${gqlType}`;

      // Add pagination wrapper type
      const paginatedTypeName = `${typeName}Paginated`;
      const paginatedType = `type ${paginatedTypeName} {\n  totalDocs: Int\n  docs: [${typeName}]\n}`;
      typeDefs += `\n${paginatedType}`;

      // Add new subtypes to schema
      for (const [_, def] of subTypes) {
        typeDefs += `\n${def}`;
      }

      // Add enums
      for (const e of enums) {
        const enumDef = `enum ${e.name} {\n  ${e.values.join("\n  ")}\n}`;
        typeDefs += `\n${enumDef}`;
      }

      const profiles = Array.isArray(viewWithFields.profiles)
        ? viewWithFields.profiles
        : [viewWithFields.profile];

      for (const profile of profiles) {
        const profileName = profile?.name
          ? _.upperFirst(_.camelCase(profile.name))
          : "Unknown";
        const resolverName = _.camelCase(
          `${view.modelName}ViewFor${profileName}`
        );

        resolvers.Query[resolverName] = async (
          _: any,
          args: ViewQueryArgs = {}
        ) => {
          const data = await engine.resolveViewData(args);
          const totalDocs = await engine.getTotalCount(args);
          return {
            totalDocs,
            docs: data,
          };
        };

        queryFields.push(
          `${resolverName}(filters: JSON, sort: JSON, page: Int, limit: Int, search: String): ${paginatedTypeName}`
        );
      }
    }
    if (views.length > 0) {
      typeDefs += `\ntype Query {\n  ${queryFields.join("\n  ")}\n}`;
      mercury.addGraphqlSchema(typeDefs, resolvers);
    }
  }
}

async function generateViewTypeSchema(
  viewFields: any[],
  baseModel: string
): Promise<{
  typeMap: Record<string, string>;
  enums: { name: string; values: string[] }[];
  subTypes: Map<string, string>;
}> {
  viewFields = viewFields.filter((f) => f.visible);
  const typeMap: Record<string, string> = {};
  const enums: { name: string; values: string[] }[] = [];
  const subTypes: Map<string, string> = new Map();

  typeMap["id"] = "ID";

  for (const vf of viewFields) {
    const field = vf.field;
    if (!field) continue;

    const fromModel = ["relationship", "virtual"].includes(field.type)
      ? field.ref
      : field.modelName;

    const isFromBaseModel = fromModel === baseModel;
    let key = vf.valueField ?? field.name;
    if (!isFromBaseModel && vf.valueField) {
      key = fromModel + "_" + vf.valueField;
    }
    let gqlType = "String";

    if (!isFromBaseModel && fromModel) {
      /**
       * Relationship field
       * Each (fieldName + valueField) combo → unique subtype
       */
      const mod: any = await mercury.db.Model.get({ name: fromModel }, { id: "1", profile: "SystemAdmin" }, { populate: [{ path: "recordKey" }] });
      let recordKey = mod.recordKey.name;
      gqlType = registerSubType(field.name, vf.valueField ?? recordKey, subTypes);
    } else {
      /**
       * Scalar or enum field
       */
      switch (field.type) {
        case "number":
          gqlType = "Int";
          break;
        case "boolean":
          gqlType = "Boolean";
          break;
        case "date":
          gqlType = "DateTime";
          break;
        case "float":
          gqlType = "Float";
          break;
        case "enum":
          const enumName = capitalizeEnumName(field.name);
          gqlType = enumName;
          if (field.enumValues && field.enumValues.length > 0) {
            enums.push({ name: enumName, values: field.enumValues });
          }
          break;
        default:
          gqlType = "String";
      }
    }

    typeMap[key.toLowerCase()] = field.many ? `[${gqlType}]` : gqlType;
  }

  return { typeMap, enums, subTypes };
}

/**
 * Registers a subtype for a relationship field.
 * Example:
 *   field.name = "user", valueField = "name" → type UserNameRef { id, name }
 *   field.name = "user", valueField = "gender" → type UserGenderRef { id, gender }
 */
function registerSubType(
  baseField: string,
  valueField: string,
  subTypes: Map<string, string>
): string {
  const refTypeName = `${capitalize(baseField)}${capitalize(
    valueField
  )}Ref`;

  // SubType Dynamic\
  if (!subTypes.has(refTypeName)) {
    const fields = [`  id: ID`, `  ${valueField}: String`];
    const typeDef = `type ${refTypeName} {\n${fields.join("\n")}\n}`;
    subTypes.set(refTypeName, typeDef);
  }

  return refTypeName;
}

function toGraphQLTypeDef(
  typeMap: Record<string, string>,
  typeName: string
): string {
  const lines = [`type ${typeName} {`];
  for (const key in typeMap) {
    lines.push(`  ${key}: ${typeMap[key]}`);
  }
  lines.push("}");
  return lines.join("\n");
}

function capitalizeEnumName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1) + "Enum";
}

function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
