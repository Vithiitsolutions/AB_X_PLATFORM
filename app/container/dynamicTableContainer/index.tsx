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
import { GET_VIEW, LIST_VIEW } from "../../utils/query";

function DynamicTableContainer() {
  let { model } = useParams();
  const [columns, setColumns] = useState<any>([]);

  const [listModelData, listModelDataResponse] = useLazyQuery(serverFetch);
  const [listView, listViewResponse] = useLazyQuery(serverFetch);

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
      GET_VIEW,
      {
        "where": {
          "modelName": {
            "is": model
          },
          
        }
      },
      {
        cache: "no-store",
      }
    );
  }, [model]);

  useEffect(() => {
    if (data) {
      console.log(data, "ajScjbxsj");
      listView(LIST_VIEW,{
        "sort": {
          "order": "asc"
        },
        "where": {
          "view": {
            "is": data?.getView?.id
          },
          "visible": true
        }
      },{
        cache: "no-store",
      })
     
    }
  }, [data, loading, error]);

  useEffect(() => {
  if(listViewResponse?.data){
    console.log(listViewResponse?.data?.listViewFields?.docs,"list view");
    (async () => {
      const refKeyMap: Record<string, string> = {};

      for (const field of listViewResponse?.data?.listViewFields?.docs || []) {
        if (field.field.type === "relationship" || field.field.type === "virtual") {
          console.log(field, "ref field");
          
          refKeyMap[field.field.name] = await getModelFieldRefModelKey(field.field.ref);
        }
      }

      const columns = listViewResponse?.data?.listViewFields?.docs?.map((field: any) => {
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
                        ?.map((item: string) =>
                          new Date(item).toLocaleString()
                        )
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
        listViewResponse?.data?.listViewFields?.docs.map(doc => doc.field)
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
  }else if(listViewResponse?.error){
    console.log(listViewResponse?.error,"error")
  }
  }, [listViewResponse?.data,listViewResponse?.loading,listViewResponse?.error,pagination])

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
      console.log(listModelDataResponse.data?.[`list${model}s`]?.totalDocs, "Pagination---");
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
      {loading || listModelDataResponse.loading  ? (
        <Text>Loading...</Text>
      ) : (
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
      ) }
    </div>
  );
}

export default DynamicTableContainer;
