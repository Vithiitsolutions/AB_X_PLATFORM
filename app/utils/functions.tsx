import { serverFetch } from "./action";

export const getModelFieldRefModelKey = async (modelName: string) => {
  const data = await serverFetch(
    `query GetModel($where: whereModelInput!) {
    getModel(where: $where) {
      id
      name
      label
      
      managed
      recordKey {
            id
            name
            label
          }

      createdOn
      updatedOn
    }
  }`,
    { where: { name: { is: modelName } } },
    { cache: "no-store" }
  );
  return data?.getModel?.recordKey?.name || "";
};

export const GET_DYNAMIC_MODEL_LIST = async (
  modelName: string,
  modelFields: any[]
) => {
  let str = `query List${modelName}($sort: sort${modelName}Input, $limit: Int!, $offset: Int!) {
      list${modelName}s(sort: $sort, limit: $limit, offset: $offset) {
          totalDocs
          docs {
              id`;

  const fieldPromises = modelFields.map(async (item: any) => {
    if (item.type === "virtual" || item.type === "relationship") {
      const refModelKey = await getModelFieldRefModelKey(item.ref);
      return `
              ${item.name} {
                  id
                  ${refModelKey}
              }`;
    }
    return `
              ${item.name}`;
  });

  const fieldStrings = await Promise.all(fieldPromises);
  str += fieldStrings.join("");

  str += `
              }
          }
      }`;

  return str;
};

//   export const getModelFieldRefModelKey = async (modelName: string) => {
//   const data = await serverFetch(GET_MODEL, { where: { name: { is: modelName } } }, { cache: "no-store" });
//   return data?.getModel?.key || "";
// }

export const GET_DYNAMIC_RECORD_DATA = async (
  modelName: string,
  modelFields: any[]
) => {
  console.log(modelFields, "model fields");
  let str = `query Get${modelName}($where: where${modelName}Input!) {
    get${modelName}(where: $where) {
            id`;
  const fieldPromises = modelFields.map(async (item: any) => {
    if (item.type === "virtual" || item.type === "relationship") {
      const refModelKey = await getModelFieldRefModelKey(item.ref);
      return `
                      ${item.name} {
                          id
                          ${refModelKey}
                      }`;
    }
    return `
                      ${item.name}`;
  });

  const fieldStrings = await Promise.all(fieldPromises);
  str += fieldStrings.join("");
  str += `
            }
    }`;
  return str;
};

export const getSearchCompostion = (fields: any[], searchText: string) => {
  const orFields = fields.map((field: any) => {
    switch (field?.type) {
      case "string":
        return {
          [field.name]: {
            contains: searchText,
          },
        };
      case "number":
      case "float":
        return {
          [field.name]: {
            is: Number(searchText),
          },
        };
      case "boolean":
        return {
          [field.name]: Boolean(searchText == "true"),
        };
      case "date":
        return {
          [field.name]: {
            is: searchText,
          },
        };
      case "enum":
        return {
          [field.name]: {
            is: searchText,
          },
        };
      case "relationship":
      case "virutal":
        return {
          [field.name]: {
            is: searchText,
          },
        };
    }
  });

  const variables = {
    where: {
      OR: orFields,
    },
  };
  return variables;
};
