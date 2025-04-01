import React, { useEffect, useState } from "react";
import { useLazyQuery } from "../../utils/hook";
import { serverFetch } from "../../utils/action";
import { Link, useParams } from "react-router";
import {
  GET_DYNAMIC_MODEL_LIST,
  getModelFieldRefModelKey,
} from "../../utils/functions";
import { A, Box, Text } from "@mercury-js/mess";
import { ChevronsUpDown, ExternalLink } from "lucide-react";
import { CustomeInput } from "../../components/inputs";
import DynamicTable from "../../components/table";
import _ from "lodash";
import { PaginationState, SortingState } from "@tanstack/react-table";

function DynamicTableContainer() {
  let { model } = useParams();
  const [columns, setColumns] = useState<any>([]);

  const [listModelData, listModelDataResponse] = useLazyQuery(serverFetch);
  const [dynamicQueryString, setDynamicQueryString] = useState("");
  const [getAllModelFields, { data, loading, error }] =
    useLazyQuery(serverFetch);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  useEffect(() => {
    getAllModelFields(
      `query ListModelFields($where: whereModelFieldInput, $limit: Int!) {
        listModelFields(where: $where, limit: $limit) {
          docs {
              id
              enumValues
              label
              managed
              required
              enumType
              ref
              many
              unique
              type
              model {
                id
                name
                label
                recordKey {
            id
            name
            label
          }
              }
            name
          }
            limit
        }
      }`,
      {
        where: {
          modelName: {
            is: model,
          },
        },
        limit: 100000,
      },
      {
        cache: "no-store",
      }
    );
  }, [model]);

  useEffect(() => {
    if (data) {
      console.log(data, "ajScjbxsj");
      (async () => {
        const refKeyMap: Record<string, string> = {};

        for (const field of data?.listModelFields?.docs || []) {
          if (field.type === "relationship" || field.type === "virtual") {
            console.log(field, "ref field");
            
            refKeyMap[field.name] = await getModelFieldRefModelKey(field.ref);
          }
        }

        const columns = data?.listModelFields?.docs?.map((field: any) => {
          switch (field?.type) {
            case "string":
            case "number":
            case "float":
              console.log(field, "field");
              return {
                accessorKey: field?.name,
                header: ({ column }: any) => (
                  <Box
                    onClick={() =>
                      column.toggleSorting(column.getIsSorted() === "desc")
                    }
                    className="flex items-center cursor-pointer"
                  >
                    {_.startCase(field?.label)}
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                  </Box>
                ),
                Cell: ({ row }: any) => (
                  <div className="text-wrap break-words max-w-40 line-clamp-6">
                    {field?.many
                      ? row.getValue(field?.name).join(", ")
                      : row.getValue(field?.name)}
                  </div>
                ),
              };

            case "relationship":
            case "virtual":
              return {
                accessorKey: `${field.name}.id`,
                header: ({ column }) => {
                  return (
                    <Box
                      onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                      }
                      className="font-bold w-full flex justify-start items-center gap-1"
                    >
                      {_.startCase(field?.label)}
                      {/* ({field.ref}) */}
                      <ChevronsUpDown className="ml-2 h-4 w-4" />
                    </Box>
                  );
                },
                cell: ({ row }) => {
                  if (field.many) {
                    return (
                      <div className="flex justify-center items-center flex-wrap gap-2">
                        {row.original[field.name]?.map((item: any) => (
                          <A
                            href={`${
                              item?.id
                                ? `/dashboard/o/${field.ref}/r/${item?.id}`
                                : "#"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline"
                            title={JSON.stringify(item, null, 2)}
                          >
                            {(refKeyMap[field.name] &&
                              item?.[`${refKeyMap[field.name]}`]) ||
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
                          row.original[field.name]?.id
                            ? `/dashboard/o/${field.ref}/r/${
                                row.original[field.name]?.id
                              }`
                            : "#"
                        }`}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(refKeyMap[field.name] &&
                          row.original[field.name]?.[
                            `${refKeyMap[field.name]}`
                          ]) ||
                          row.original[field.name]?.id ||
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
                accessorKey: field.name,
                header: _.startCase(field.label),
                cell: ({ row }) => {
                  if (field.many) {
                    return (
                      <div className="flex justify-center items-center gap-3 flex-wrap">
                        {row.getValue(field.name)?.map((item: any) => (
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
                          checked={row.getValue(field.name)}
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
                accessorKey: field.name,
                header: ({ column }) => {
                  return (
                    <Box
                      onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                      }
                    >
                      {_.startCase(field.label)}
                      <ChevronsUpDown className="ml-2 h-4 w-4" />
                    </Box>
                  );
                },
                cell: ({ row }) => (
                  <div className="">
                    {field.many
                      ? row
                          .getValue(field.name)
                          ?.map((item: string) =>
                            new Date(item).toLocaleString()
                          )
                          ?.join(", ")
                      : new Date(row.getValue(field.name)).toLocaleString()}
                  </div>
                ),
              };
            default:
              return {
                accessorKey: field.name,
                header: ({ column }) => {
                  return (
                    <Box
                      onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                      }
                    >
                      {_.startCase(field.label)}
                      <ChevronsUpDown className="ml-2 h-4 w-4" />
                    </Box>
                  );
                },
                cell: ({ row }) => (
                  <div className="">
                    {field.many
                      ? row.getValue(field.name)?.join(", ")
                      : row.getValue(field.name)}
                  </div>
                ),
              };
          }
        });

        // columns.push({
        //   accessorKey: "action",
        //   header: ({ column }) => {
        //     return <Box variant="ghost">Action</Box>;
        //   },
        //   cell: ({ row }) => (
        //     <div className="flex justify-start items-center gap-2">
        //     test
        //     </div>
        //   ),
        // });

        setColumns(columns);
        const str = await GET_DYNAMIC_MODEL_LIST(
          model as string,
          data?.listModelFields?.docs
        );
        setDynamicQueryString(str);
        listModelData(
          str,
          {
            sort: {
              createdOn: "desc",
            },
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
          },
          {
            cache: "no-store",
          }
        );
      })();
    }
  }, [data, loading, error]);

  useEffect(() => {
    if (dynamicQueryString)
      listModelData(
        dynamicQueryString,
        {
          sort: {
            [sorting[0]?.id || "createdOn"]: sorting[0]?.desc ? "desc" : "asc",
          },
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
        },
        {
          cache: "no-store",
        }
      );
  }, [pagination.pageSize, pagination.pageSize, dynamicQueryString, sorting]);
  useEffect(() => {
    if (listModelDataResponse.data) {
      console.log(listModelDataResponse.data, "data11");
    }

    if (listModelDataResponse.error) {
      console.log(listModelDataResponse.error);
    }
  }, [
    listModelDataResponse.data,
    listModelDataResponse.error,
    listModelDataResponse.loading,
  ]);
  return (
    <div>
      {!loading ? (
        <DynamicTable
          data={listModelDataResponse.data?.[`list${model}s`]?.docs || []}
          columns={columns}
          rowCount={
            listModelDataResponse.data?.[`list${model}s`]?.totalDocs || 0
          }
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          sorting={sorting}
        />
      ) : (
        <Text>Loading...</Text>
      )}
    </div>
  );
}

export default DynamicTableContainer;
