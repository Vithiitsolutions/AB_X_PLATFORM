import React from "react";
import DynamicForm from "../components/dynamicForm";
import DynamicTableContainer from "../container/dynamicTableContainer";
import { serverFetch } from "../utils/action";
import { GET_VIEW, LIST_VIEW } from "../utils/query";
import {
  GET_DYNAMIC_MODEL_LIST,
  getModelFieldRefModelKey,
} from "../utils/functions";
import { A, Box } from "@mercury-js/mess";
import { ChevronsUpDown } from "lucide-react";
import { CustomeInput } from "../components/inputs";
import { model } from "../../server/metadata/models";
import _ from "lodash";

export async function loader({ params }: { params: { model: string } }) {
  
  const response = await serverFetch(
    GET_VIEW,
    {
      where: {
        modelName: {
          is: params?.model,
        },
      },
    },
    {
      cache: "no-store",
    }
  );
  if (response.error) {
    return response.error; //TODO: handle error
  }
  console.log(response, "response");
  
  const response1 = await serverFetch(
    LIST_VIEW,
    {
      sort: {
        order: "asc",
      },
      where: {
        view: {
          is: response?.getView?.id,
        },
        visible: true,
      },
    },
    {
      cache: "no-store",
    }
  );
  

  const refKeyMap: Record<string, string> = {};

  for (const field of response1?.listViewFields?.docs ||
    []) {
    if (field.field.type === "relationship" || field.field.type === "virtual") {
      refKeyMap[field.field.name] = await getModelFieldRefModelKey(
        field.field.ref
      );
    }
  }

  const columns = response1?.listViewFields?.docs?.map(
    (field: any) => {
      switch (field?.field?.type) {
        case "string":
        case "number":
        case "float":
          console.log(field, "field");
          return {
            accessorKey: field?.field?.name,
            header: ({ column }: any) => (
              <Box
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "desc")
                }
                className="flex items-center cursor-pointer"
              >
                {_.startCase(field?.field?.label)}
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </Box>
            ),
            Cell: ({ row }: any) => (
              <div className="text-wrap break-words max-w-40 line-clamp-6">
                {field?.field?.many
                  ? row.getValue(field?.field?.name).join(", ")
                  : row.getValue(field?.field?.name)}
              </div>
            ),
          };

        case "relationship":
        case "virtual":
          return {
            accessorKey: `${field?.field?.name}.id`,
            header: ({ column }) => {
              return (
                <Box
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                  className="font-bold w-full flex justify-start items-center gap-1"
                >
                  {_.startCase(field?.field?.label)}
                  {/* ({field.ref}) */}
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Box>
              );
            },
            cell: ({ row }) => {
              if (field?.field?.many) {
                return (
                  <div className="flex justify-center items-center flex-wrap gap-2">
                    {row.original[field?.field?.name]?.map((item: any) => (
                      <A
                        href={`${
                          item?.id
                            ? `/dashboard/o/${field?.field?.ref}/r/${item?.id}`
                            : "#"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                        title={JSON.stringify(item, null, 2)}
                      >
                        {(refKeyMap[field?.field?.name] &&
                          item?.[`${refKeyMap[field?.field?.name]}`]) ||
                          item?.id ||
                          "-"}
                      </A>
                      // <Box>{`/dashboard/o/${field.ref}/r/${item?.id}`}</Box>
                    ))}
                  </div>
                );
              } else {
                return (
                  <A
                    href={`${
                      row.original[field.field?.name]?.id
                        ? `/dashboard/o/${field.field?.ref}/r/${
                            row.original[field.field?.name]?.id
                          }`
                        : "#"
                    }`}
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(refKeyMap[field.field?.name] &&
                      row.original[field.field?.name]?.[
                        `${refKeyMap[field.field?.name]}`
                      ]) ||
                      row.original[field.field?.name]?.id ||
                      "-"}
                  </A>
                  // <Box>
                  //   {`/dashboard/o/${field.ref}/r/${row.original[field.name]?.id}`}
                  // </Box>
                );
              }
            },
          };
        case "boolean":
          return {
            accessorKey: field.field?.name,
            header: _.startCase(field.field?.label),
            cell: ({ row }) => {
              if (field.field?.many) {
                return (
                  <div className="flex justify-center items-center gap-3 flex-wrap">
                    {row.getValue(field.field?.name)?.map((item: any) => (
                      <div className="">
                        <CustomeInput
                          checked={item}
                          disabled={true}
                          aria-label="Select all"
                        />
                      </div>
                    ))}
                  </div>
                );
              } else {
                return (
                  <div className="">
                    <CustomeInput
                      checked={row.getValue(field.field?.name)}
                      disabled={true}
                      aria-label="Select all"
                    />
                  </div>
                );
              }
            },
          };
        case "date":
          return {
            accessorKey: field.field?.name,
            header: ({ column }) => {
              return (
                <Box
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                >
                  {_.startCase(field.field?.label)}
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Box>
              );
            },
            cell: ({ row }) => (
              <div className="">
                {field.field?.many
                  ? row
                      .getValue(field.field?.name)
                      ?.map((item: string) => new Date(item).toLocaleString())
                      ?.join(", ")
                  : new Date(row.getValue(field.field?.name)).toLocaleString()}
              </div>
            ),
          };
        default:
          return {
            accessorKey: field.field?.name,
            header: ({ column }) => {
              return (
                <Box
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                >
                  {_.startCase(field.field?.label)}
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Box>
              );
            },
            cell: ({ row }) => (
              <div className="">
                {field.field?.many
                  ? row.getValue(field.field?.name)?.join(", ")
                  : row.getValue(field.field?.name)}
              </div>
            ),
          };
      }
    }
  );

  const str = await GET_DYNAMIC_MODEL_LIST(
    params?.model as string,
    response1?.listViewFields?.docs.map(
      (doc: any) => doc.field
    )
  );
  const modelData = await serverFetch(
    str,
    {
      sort: {
        createdOn: "desc",
      },
      limit: 10,
      offset: 0,
    },
    {
      cache: "no-store",
    }
  );
  return {
    view: response?.getView,
    dynamicQueryString: str,
    columns: columns,
    modelData: modelData?.[`list${params?.model}s`]?.docs,
    totalDocs: modelData?.[`list${params?.model}s`]?.totalDocs,
    modelName: params?.model,
  };
}

const dashboard = ({
  loaderData,
}: {
  loaderData: {
    columns: any;
    view: any;
    dynamicQueryString: string;
    modelData: any;
    totalDocs: number;
    modelName: string;
  };
}) => {  
  return (
    <div>
      {loaderData?.totalDocs && (
        <DynamicTableContainer
          columns={loaderData?.columns}
          dynamicQueryString={loaderData?.dynamicQueryString}
          modelData={loaderData?.modelData}
          modelName={loaderData?.modelName}
          totalDocs={loaderData?.totalDocs}
        />
      )}
    </div>
  );
};

export default dashboard;
