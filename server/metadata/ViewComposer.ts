import _ from "lodash";
import mercury from "@mercury-js/core";
import { ViewResolverEngine } from "./ViewResolverEngine"; // Your earlier class


type ViewQueryArgs = {
  filters?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  page?: number;
  limit?: number;
  search?: string;
};


export class ViewComposer {
  static async composeViews() {
    const views = await mercury.db.View.mongoModel.find({});

    const resolvers: Record<string, any> = {
      Query: {},
    };

    let typeDefs = ""; // single string output
    const queryFields: string[] = [];

    for (const view of views) {
      const viewId = view._id.toString();
      const viewName = _.camelCase(view.name); // e.g., "productView"
      const typeName = `${_.upperFirst(viewName)}ViewType`;

      const engine = new ViewResolverEngine(viewId);
      const viewWithFields: any = await mercury.db.View.get(
        { _id: viewId },
        { id: "1", profile: "SystemAdmin" },
        {
          populate: [
            {
              path: "fields",
              populate: [{ path: "field", select: "name modelName type enumValues" }],
            },
            {
              path: "profiles",
              select: "name"
            },
          ],
        }
      );

      const { typeMap, enums } = generateViewTypeSchema(viewWithFields.fields, view.modelName);
      const gqlType = toGraphQLTypeDef(typeMap, typeName);
      typeDefs += `\n${gqlType}`; // append as string

      // enum types
      for (const e of enums) {
        const enumDef = `enum ${e.name} {\n  ${e.values.join("\n  ")}\n}`;
        typeDefs += `\n${enumDef}`;
      }

      const profiles = Array.isArray(viewWithFields.profiles)
        ? viewWithFields.profiles
        : [viewWithFields.profile]; // fallback in case of singular

      for (const profile of profiles) {
        const profileName = profile?.name ? _.upperFirst(_.camelCase(profile.name)) : "Unknown";
        const resolverName = _.camelCase(`${view.modelName}ViewFor${profileName}`); // productViewForAdmin

        resolvers.Query[resolverName] = async (_: any, args: ViewQueryArgs = {}) => {
          return await engine.resolveViewData(args);
        };

        queryFields.push(
          `${resolverName}(filters: JSON, sort: JSON, page: Int, limit: Int, search: String): [${typeName}]`
        );
      }
    }
    typeDefs += `\ntype Query {\n  ${queryFields.join("\n  ")}\n}`;
    mercury.addGraphqlSchema(typeDefs, resolvers);
  }

}

function generateViewTypeSchema(viewFields: any[], baseModel: string): {
  typeMap: Record<string, string>,
  enums: { name: string, values: string[] }[]
} {
  const typeMap: Record<string, string> = {};
  const enums: { name: string, values: string[] }[] = [];

  for (const vf of viewFields) {
    const field = vf.field;
    if (!field) continue;

    const isFromBaseModel = field.modelName === baseModel;
    const key = isFromBaseModel ? field.name : field.modelName;

    let gqlType = "String";
    switch (field.type) {
      case "number":
        gqlType = "Int"; break;
      case "boolean":
        gqlType = "Boolean"; break;
      case "date":
        gqlType = "DateTime"; break;
      case "enum":
        const enumName = capitalizeEnumName(field.name);
        gqlType = enumName;
        if (field.enumValues) {
          enums.push({ name: enumName, values: field.enumValues });
        }
        break;
      default:
        gqlType = "String";
    }

    typeMap[key] = gqlType;
  }

  return { typeMap, enums };
}

function toGraphQLTypeDef(typeMap: Record<string, string>, typeName: string): string {
  const lines = [`type ${typeName} {`];
  for (const key in typeMap) {
    lines.push(`  ${key}: ${typeMap[key]}`);
  }
  lines.push("}");
  return lines.join("\n");
}

function capitalizeEnumName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1) + "EnumType";
}
