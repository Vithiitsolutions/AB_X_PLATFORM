import React, { useEffect } from "react";
import { useLazyQuery } from "../../utils/hook";
import { serverFetch } from "../../utils/action";

import { A, Text, Box } from "@mercury-js/mess";
import DynamicTable from "../../components/table";

import { PaginationState, SortingState } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { LIST_VIEW } from "../../utils/query";
import { getModelFieldRefModelKey } from "../../utils/functions";
import _ from 'lodash';
import { CustomeInput } from "../../components/inputs";

function DynamicTableContainer({
  totalDocs,
  modelData,
  modelName,
  dynamicQueryString,
  viewId,
  viewFields 
}: {
  modelData: any;
  totalDocs: number;
  modelName: string;
  dynamicQueryString: string;
  viewId: string,
  viewFields: any
}) {

  const [listModelData, listModelDataResponse] = useLazyQuery(serverFetch);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [objectDataList, setObjectDataList] = React.useState<any>(modelData);
  const [totalDocsCount, setTotalDocsCount] = React.useState(totalDocs);
  const [columnsData, setColumnsData] = React.useState([]);

  useEffect(()=>{
    (async() => {
      
      
      const refKeyMap: Record<string, string> = {};
  
      for (const field of viewFields?.docs || []) {
        if (field.field.type === "relationship" || field.field.type === "virtual") {
          refKeyMap[field.field.name] = await getModelFieldRefModelKey(
            field.field.ref
          );
        }
      }
    
      const columns = viewFields?.docs?.map((field: any) => {
        switch (field?.field?.type) {
          case "string":
          case "number":
          case "float":
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
      });
      setColumnsData(columns);
    })()
  }, [])
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
  }, [pagination.pageSize, pagination.pageSize, sorting, dynamicQueryString]);
  useEffect(() => {
    if (listModelDataResponse.data) {
      setObjectDataList(
        listModelDataResponse.data?.[`list${modelName}s`]?.docs || []
      );
      setTotalDocsCount(
        listModelDataResponse.data?.[`list${modelName}s`]?.totalDocs || 0
      );
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
      {listModelDataResponse.loading && !columnsData?.length ? (
        <Text>Loading...</Text>
      ) : (
        <DynamicTable
          data={objectDataList}
          columns={columnsData}
          rowCount={totalDocsCount}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          sorting={sorting}
        />
      )}
    </div>
  );
}

export default DynamicTableContainer;
