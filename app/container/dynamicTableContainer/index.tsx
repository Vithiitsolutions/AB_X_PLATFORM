import React, { useEffect } from "react";
import { useLazyQuery } from "../../utils/hook";
import { serverFetch } from "../../utils/action";

import { A, Text, Box } from "@mercury-js/mess";
import DynamicTable from "../../components/table";

import { PaginationState, SortingState } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import _ from "lodash";
import { CustomeInput } from "../../components/inputs";
import { DynamicButton } from "../../components/Button";

function DynamicTableContainer({
  totalDocs,
  modelData,
  modelName,
  dynamicQueryString,
  filters,
  viewId,
  viewFields,
  refKeyMap,
  buttons,
  apiName,
  viewLabel,
  // searchVaraiables,
}: {
  modelData: any;
  totalDocs: number;
  modelName: string;
  dynamicQueryString: string;
  filters: any;
  viewId: string;
  viewFields: any;
  refKeyMap: Record<string, string>;
  buttons: any;
  apiName: string;
  viewLabel?: string;
  // searchVaraiables: any;
}) {
  const [listModelData, listModelDataResponse] = useLazyQuery(serverFetch);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      desc: true,
      id: "updatedOn",
    },
  ]);
  const [objectDataList, setObjectDataList] = React.useState<any>(modelData);
  const [totalDocsCount, setTotalDocsCount] = React.useState(totalDocs);
  const [columnsData, setColumnsData] = React.useState([]);
  const [searchText, setSearchText] = React.useState("");

  useEffect(() => {
    (async () => {
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
                    field?.sortable
                      ? column.toggleSorting(column.getIsSorted() === "asc")
                      : null
                  }
                  className="flex items-center cursor-pointer"
                >
                  {_.startCase(field.label || field?.field?.label)}
                  {field?.sortable && (
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                  )}
                </Box>
              ),
              Cell: ({ row }: any) => {
                return (
                  <div className="text-wrap break-words max-w-40 line-clamp-6">
                    {field?.field?.many
                      ? row.getValue(field?.field?.name).join(", ")
                      : row.getValue(field?.field?.name)}
                  </div>
                );
              },
            };

          case "relationship":
          case "virtual":
            return {
              accessorKey: `${field?.field?.name}.id`,
              header: ({ column }) => {
                return (
                  <Box
                    onClick={() =>
                      field?.sortable
                        ? column.toggleSorting(column.getIsSorted() === "asc")
                        : null
                    }
                    className="font-bold w-full flex justify-start items-center gap-1"
                  >
                    {_.startCase(field.label || field?.field?.label)}
                    {/* ({field.ref}) */}
                    {field?.sortable && (
                      <ChevronsUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Box>
                );
              },
              cell: ({ row }) => {
                // TODO: have to handle nested relationship case also
                if (field?.field?.many) {
                  return (
                    <div className="flex justify-center items-center flex-wrap gap-2">
                      {row.original[field?.field?.name]?.map((item: any) => (
                        <A
                          href={
                            field?.isNavigatable
                              ? field.valueField
                                ? `${
                                    item?.[
                                      `${field.field?.ref}_${field.valueField}`
                                    ]?.id
                                      ? `/dashboard/o/${field?.field?.ref}/r/${
                                          item?.[
                                            `${field.field?.ref}_${field.valueField}`
                                          ]?.id
                                        }`
                                      : "#"
                                  }`
                                : `${
                                    item?.id
                                      ? `/dashboard/o/${field?.field?.ref}/r/${item?.id}`
                                      : "#"
                                  }`
                              : "#"
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline"
                          title={JSON.stringify(item, null, 2)}
                        >
                          {field.valueField
                            ? item?.[
                                `${field.field?.ref}_${field.valueField}`
                              ]?.[field.valueField]
                            : refKeyMap[field?.field?.name]
                              ? item?.[`${refKeyMap[field?.field?.name]}`]
                              : item?.id || "-"}
                        </A>
                      ))}
                    </div>
                  );
                } else {
                  let value = "-";
                  let valueId = "";

                  if (field?.valueField) {
                    if (field.valueField.includes(".") && field.title) {
                      value =
                        row.original?.[field.title]?.[
                          field.valueField.split(".").pop()
                        ] || "-";

                      valueId = row.original?.[field.title]?.id || "";
                    } else {
                      value =
                        row.original?.[
                          `${field.field?.ref}_${field.valueField}`
                        ]?.[field.valueField] || "-";

                      valueId =
                        row.original?.[
                          `${field.field?.ref}_${field.valueField}`
                        ]?.id || "";
                    }
                  } else if (refKeyMap[field.field?.name]) {
                    value =
                      row.original[field.field?.name]?.[
                        `${refKeyMap[field.field?.name]}`
                      ] || "-";
                    valueId = row.original[field.field?.name]?.id || "";
                  } else {
                    value = row.original[field.field?.name]?.id || "-";
                    valueId = row.original[field.field?.name]?.id || "";
                  }
                  return (
                    <A
                      href={
                        field?.isNavigatable
                          ? `/dashboard/o/${field.field?.ref}/r/${valueId}`
                          : "#"
                      }
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {value}
                    </A>
                  );
                }
              },
            };
          case "boolean":
            return {
              accessorKey: field.field?.name,
              header: _.startCase(field.label || field?.field?.label),
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
                            type="checkbox"
                            addonstyles={{
                              base: {
                                height: "20px",
                                width: "20px",
                              },
                            }}
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
                        type="checkbox"
                        addonstyles={{
                          base: {
                            height: "20px",
                            width: "20px",
                          },
                        }}
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
                      field?.sortable
                        ? column.toggleSorting(column.getIsSorted() === "asc")
                        : null
                    }
                    className="flex items-center cursor-pointer"
                  >
                    {_.startCase(field.label || field?.field?.label)}
                    {field?.sortable && (
                      <ChevronsUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Box>
                );
              },
              cell: ({ row }) => {
                let value = "";

                switch (field?.type) {
                  case "date":
                    value = field.field?.many
                      ? row
                          .getValue(field.field?.name)
                          ?.map((item: string) =>
                            new Date(item).toLocaleDateString()
                          )
                          ?.join(", ")
                      : new Date(
                          row.getValue(field.field?.name)
                        ).toLocaleDateString();
                    break;
                  case "datetime":
                    field.field?.many
                      ? row
                          .getValue(field.field?.name)
                          ?.map((item: string) =>
                            new Date(item).toLocaleString()
                          )
                          ?.join(", ")
                      : new Date(
                          row.getValue(field.field?.name)
                        ).toLocaleString();
                    break;
                  case "time":
                    value = field.field?.many
                      ? row
                          .getValue(field.field?.name)
                          ?.map((item: string) =>
                            new Date(item).toLocaleTimeString()
                          )
                          ?.join(", ")
                      : new Date(
                          row.getValue(field.field?.name)
                        ).toLocaleTimeString();
                    break;
                  default:
                    field.field?.many
                      ? row
                          .getValue(field.field?.name)
                          ?.map((item: string) =>
                            new Date(item).toLocaleString()
                          )
                          ?.join(", ")
                      : new Date(
                          row.getValue(field.field?.name)
                        ).toLocaleString();
                }
                return <div className="">{value}</div>;
              },
            };
          default:
            return {
              accessorKey: field.field?.name,
              header: ({ column }) => {
                return (
                  <Box
                    onClick={() =>
                      field?.sortable
                        ? column.toggleSorting(column.getIsSorted() === "asc")
                        : null
                    }
                    className="flex items-center cursor-pointer"
                  >
                    {_.startCase(field.label || field?.field?.label)}
                    {field?.sortable && (
                      <ChevronsUpDown className="ml-2 h-4 w-4" />
                    )}
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
    })();
  }, []);
  const debouncedListModelData = React.useCallback(
    _.debounce((query: string, variables: any, options: any) => {
      listModelData(query, variables, options);
    }, 500),
    []
  );
  React.useEffect(() => {
    if (dynamicQueryString)
      debouncedListModelData(
        dynamicQueryString,
        {
          search: searchText,
          sort: {
            [sorting[0]?.id || "createdOn"]: sorting[0]?.desc ? -1 : 1,
          },
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1,
          filters: filters || {},
        },
        {
          cache: "no-store",
        }
      );
  }, [
    pagination.pageSize,
    pagination.pageSize,
    sorting,
    dynamicQueryString,
    pagination,
    searchText,
  ]);

  useEffect(() => {
    if (listModelDataResponse.data) {
      setObjectDataList(listModelDataResponse.data?.[apiName]?.docs || []);
      setTotalDocsCount(listModelDataResponse.data?.[apiName]?.totalDocs || 0);
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
    <Box
      styles={{
        base: {
          display: "flex",
          flexDirection: "column",
          gap: 10,
        },
      }}
    >
      <Box
        styles={{
          base: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignContent: "center",
            flexWrap: "wrap",
            gap: 10,
          },
        }}
      >
        <Text
          styles={{
            base: {
              fontSize: "16px",
              marginLeft: "5px",
            },
          }}
        >
          {/* {/(s|x|z|ch|sh)$/i.test(_.startCase(viewLabel))
            ? _.startCase(viewLabel) + "es"
            : _.startCase(viewLabel) + "s"} */}
          {_.startCase(viewLabel)}
        </Text>
        <Box
          styles={{
            base: {
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            },
          }}
        >
          <CustomeInput
            addonstyles={{
              base: {
                width: "300px",
                height: "35px",
                borderRadius: "6px",
              },
            }}
            placeholder="Search"
            onChange={(e) => setSearchText(e.target.value)}
          />

          {buttons?.map((button: any) => {
            return (
              <DynamicButton
                children={button?.text}
                iconPosition={button?.iconPosition}
                variant={button?.variant}
                icon={button?.icon}
                type={button?.type}
                href={button?.href}
                code={button?.buttonFn?.code}
                title={button?.tooltip}
                addOnStyles={{
                  base: {
                    padding: "3px 8px",
                    fontSize: "12px",
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {listModelDataResponse.loading && !columnsData?.length ? (
        <Text>Loading...</Text>
      ) : (
        <DynamicTable
          data={objectDataList || []}
          columns={columnsData}
          rowCount={totalDocsCount}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          sorting={sorting}
        />
      )}
    </Box>
  );
}

export default DynamicTableContainer;
