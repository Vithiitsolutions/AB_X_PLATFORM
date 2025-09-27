import { serverFetch } from "./action";

export const getModelFieldRefModelKey = async (
  modelName: string,
  cookies?: string
) => {
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
    { cache: "no-store", ssr: cookies ? true : false, cookies }
  );
  console.log(data, "model data ref", cookies);

  return modelName === "File" ? "name" : data?.getModel?.recordKey?.name || "";
};

export const GET_DYNAMIC_MODEL_LIST_VIEW_FIELDS = async (
  modelName: string,
  modelFields: any[],
  cookies?: string
) => {
  if (modelName === "File") {
    return `query ListFiles($sort: sortFileInput, $offset: Int!, $limit: Int!, $where: whereFileInput, $filters: JSON) {
  listFiles(sort: $sort, offset: $offset, limit: $limit, where: $where, filters: $filters) {
    docs {
      id
      mediaId
      name
      size
      url
      mimeType
      description
      extension
    }
    limit
    offset
    totalDocs
  }
}`;
  } else {
    let str = `query ${modelName}ViewFor${parseCookies(cookies as string).role}($search: String, $limit: Int, $page: Int, $sort: JSON, $filters: JSON) {
      ${modelName.charAt(0).toLowerCase() + modelName.slice(1)}ViewFor${parseCookies(cookies as string).role}(search: $search, limit: $limit, page: $page, sort: $sort, filters: $filters) {
          totalDocs
          docs {
          id
              `;

    const fieldPromises = modelFields.map(async (item: any) => {
      if (
        item.field.type === "virtual" ||
        item.field?.type === "relationship"
      ) {
        if (item?.valueField) {
          if (item?.valueField.includes(".") && item?.title) {
            return `
            ${item.title} {
                    id
                    ${item.valueField.split(".").pop() || ""} 
            }
            `;
          } else
            return `
          ${item.field.ref}_${item.valueField} {
                  id
                  ${item.valueField}
              }`;
        } else {
          const refModelKey = await getModelFieldRefModelKey(
            item.field.ref,
            cookies
          );
          return `
              ${item.field?.name} {
                  id
                  ${refModelKey}
              }`;
        }
      }
      return `
              ${item.field?.name}`;
    });

    const fieldStrings = await Promise.all(fieldPromises);
    str += fieldStrings.join("");

    str += `
              }
          }
      }`;

    return str;
  }
};

export const GET_DYNAMIC_MODEL_LIST = async (
  modelName: string,
  modelFields: any[],
  cookies?: string
) => {
  if (modelName === "File") {
    return `query ListFiles($sort: sortFileInput, $offset: Int!, $limit: Int!, $where: whereFileInput) {
  listFiles(sort: $sort, offset: $offset, limit: $limit, where: $where) {
    docs {
      id
      mediaId
      name
      size
      url
      mimeType
      description
      extension
    }
    limit
    offset
    totalDocs
  }
}`;
  } else {
    let str = `query List${modelName}($where: where${modelName}Input, $sort: sort${modelName}Input, $limit: Int!, $offset: Int!) {
      list${modelName}s(where: $where, sort: $sort, limit: $limit, offset: $offset) {
          totalDocs
          docs {
              id`;

    const fieldPromises = modelFields.map(async (item: any) => {
      if (item.type === "virtual" || item.type === "relationship") {
        const refModelKey = await getModelFieldRefModelKey(item.ref, cookies);
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
  }
};

//   export const getModelFieldRefModelKey = async (modelName: string) => {
//   const data = await serverFetch(GET_MODEL, { where: { name: { is: modelName } } }, { cache: "no-store" });
//   return data?.getModel?.key || "";
// }

export const GET_DYNAMIC_RECORD_DATA = async (
  modelName: string,
  modelFields: any[],
  cookies?: string
) => {
  console.log(modelFields, "model fields");
  let str = `query Get${modelName}($where: where${modelName}Input!) {
    get${modelName}(where: $where) {
            id`;
  const fieldPromises = modelFields.map(async (item: any) => {
    if (item.type === "virtual" || item.type === "relationship") {
      const refModelKey = await getModelFieldRefModelKey(item.ref, cookies);
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
        const isValidNumber = !isNaN(Number(searchText));
        return isValidNumber
          ? {
              [field.name]: {
                is: Number(searchText),
              },
            }
          : null;
      case "boolean":
        return {
          [field.name]: Boolean(searchText == "true"),
        };
      case "date":
        const isValidDate = !isNaN(Date.parse(searchText));
        return isValidDate
          ? {
              [field.name]: {
                is: Date.parse(searchText),
              },
            }
          : null;
      case "enum":
        if (searchText && Array.isArray(field.enumValues)) {
          const matchedEnum = field.enumValues.find((ev) =>
            ev.toLowerCase().includes(searchText.toLowerCase())
          );
          if (matchedEnum) {
            return {
              [field.name]: matchedEnum,
            };
          }
        }
        return null;
      case "relationship":
      case "virutal":
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(searchText);
        return isValidObjectId
          ? {
              [field.name]: {
                id: {
                  is: searchText,
                },
              },
            }
          : null;
    }
  });

  const variables = {
    where: {
      OR: searchText ? orFields.filter((obj) => obj) : [],
    },
  };
  return variables;
};

export const parseCookies = (cookies: string) => {
  const cookieArray = cookies?.split(";").map((cookie) => cookie.trim());
  const cookieObject: any = {};

  cookieArray?.forEach((cookie) => {
    const [key, value] = cookie.split("=");
    cookieObject[key] = value;
  });
  return cookieObject;
};
