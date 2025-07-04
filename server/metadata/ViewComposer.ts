import { camelCase, upperFirst } from "lodash";
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

    for (const view of views) {
      const viewId = view._id.toString();
      const viewName = camelCase(view.name); // e.g., "productView"
      const typeName = `${upperFirst(viewName)}ViewType`;

      const engine = new ViewResolverEngine(viewId);
      const viewWithFields: any = await mercury.db.View.get(
        { _id: viewId },
        { id: "1", profile: "SystemAdmin" },
        {
          populate: [
            {
              path: "fields",
              populate: [{ path: "field", select: "name modelName type" }],
            },
          ],
        }
      );

      const schemaFields = generateViewTypeSchema(viewWithFields.fields, view.modelName);
      const gqlType = toGraphQLTypeDef(schemaFields, typeName);
      typeDefs += `\n${gqlType}`; // append as string

      resolvers.Query[`${viewName}View`] = async (_: any, args: ViewQueryArgs = {}) => {
        return await engine.resolveViewData(args);
      };
    }
    mercury.addGraphqlSchema(typeDefs, resolvers);
  }

}

function generateViewTypeSchema(viewFields: any[], baseModel: string) {
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
        gqlType = capitalizeEnumName(field.name); break;
      default:
        gqlType = "String";
    }

    typeMap[key] = gqlType;
  }

  return typeMap;
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
  return name.charAt(0).toUpperCase() + name.slice(1) + "Enum";
}
