"use client";
import React, { useEffect, useState } from "react";
import { useLazyQuery } from "../../utils/hook";
import { serverFetch } from "../../utils/action";
import { useParams } from "react-router";
import {
  GET_LIST_MODEL_FIELDS,
  GET_MODEL,
  LIST_LAYOUT_STRUCTURES,
  LIST_LAYOUTS,
} from "../../utils/query";
import { Box, Text } from "@mercury-js/mess";
import { GET_DYNAMIC_RECORD_DATA } from "../../utils/functions";
import DynamicComponentLoader from "../../components/DynamicComponentLoader";
import { ErrorBoundary } from "../../root";
function RecordView() {
  const [ListLayouts, ListLayoutsResponse] = useLazyQuery(serverFetch);
  const [getModel, GetModelResponse] = useLazyQuery(serverFetch);
  const { model, record } = useParams();
  const [openPopUp, setPopUp] = useState(false);
  const [getCurrentLayoutStructures, getCurrentLayoutStructuresResponse] =
    useLazyQuery(serverFetch);
  const [getAllModelFields, { data, loading, error }] =
    useLazyQuery(serverFetch);
  const [dynamicGetQuary, DynamicGetQuaryResponse] = useLazyQuery(serverFetch);
  useEffect(() => {
    getModel(GET_MODEL, {
      where: {
        name: {
          is: model,
        },
      },
    });
    getAllModelFields(
      GET_LIST_MODEL_FIELDS,
      {
        where: {
          modelName: {
            is: model,
          },
        },
        limit: 200,
      },
      {
        cache: "no-store",
      }
    );
  }, [model]);
  useEffect(() => {
    if (GetModelResponse?.data) {
      console.log(GetModelResponse?.data);
    } else if (GetModelResponse?.error) {
      console.log(GetModelResponse?.error);
    }
  }, [
    GetModelResponse?.data,
    GetModelResponse?.error,
    GetModelResponse?.loading,
  ]);
  useEffect(() => {
    if (GetModelResponse?.data) {
      ListLayouts(
        LIST_LAYOUTS,
        {
          where: {
            model: {
              is: GetModelResponse?.data?.getModel?.id,
            },
          },
          limit: 100,
        },
        {
          cache: "no-store",
        }
      );
    }
  }, [GetModelResponse?.data]);

  useEffect(() => {
    if (ListLayoutsResponse?.data) {
      let layoutId;

      if (!layoutId) {
        layoutId = ListLayoutsResponse?.data?.listLayouts?.docs.find(
          (item: any) => item.profiles && item.profiles.length === 0
        )?.id;
      }
      getCurrentLayoutStructures(
        LIST_LAYOUT_STRUCTURES,
        {
          where: {
            layout: {
              is: layoutId,
            },
          },
          sort: {
            order: "asc",
          },
        },
        {
          cache: "no-store",
        }
      );
    }
  }, [
    ListLayoutsResponse?.data,
    ListLayoutsResponse?.loading,
    ListLayoutsResponse?.error,
  ]);

  useEffect(() => {
    if (data) {
      (async () => {
        const str = await GET_DYNAMIC_RECORD_DATA(
          model as string,
          data?.listModelFields?.docs
        );
        console.log(str);
        dynamicGetQuary(
          str,
          {
            where: {
              id: {
                is: record,
              },
            },
          },
          {
            cache: "no-store",
          }
        );
      })();
    }
  }, [data, loading, error]);

  useEffect(() => {
    if (DynamicGetQuaryResponse?.data) {
      console.log(DynamicGetQuaryResponse?.data, "dynamic data");
    } else if (DynamicGetQuaryResponse?.error) {
      console.log(DynamicGetQuaryResponse?.error);
    }
  }, [
    DynamicGetQuaryResponse?.data,
    DynamicGetQuaryResponse?.loading,
    DynamicGetQuaryResponse?.error,
  ]);
  return (
    // <div className="w-full">
    //   <div className="ml-5 mb-4">
    //     {/* <BreadcrumbComp breadcrumb={[{name: "Dashboard", url: "/dashboard", active: false}, {name: modelName as string || "Model", url: `/dashboard/o/${modelName}/list`, active: false}, {name: `Current ${modelName}`, active: true}]}/> */}
    //   </div>
    //   <div className="h-auto w-[100vw - 100px] grid lg:grid-cols-3 gap-2 md:grid-cols-2 grid-cols-1 dark:bg-black bg-white p-2">
    //     {getCurrentLayoutStructuresResponse.loading || loading || ListLayoutsResponse?.loading || GetModelResponse?.loading || getCurrentLayoutStructuresResponse.loading || DynamicGetQuaryResponse?.loading ?
    //       <>
    //         {[1, 2, 3, 4, 5].map((_, index) => (

    //           <div role="status" key={index} className="max-w-sm p-4 border border-gray-200 rounded  animate-pulse md:p-6 dark:border-gray-700">
    //             <div className="flex items-center justify-center h-16 mb-4 bg-gray-300 rounded dark:bg-gray-700">
    //             </div>
    //             <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
    //             <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
    //             <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
    //             <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
    //             <div className="flex items-center mt-4">
    //               <svg className="w-10 h-10 me-3 text-gray-200 dark:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
    //                 <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
    //               </svg>
    //               <div>
    //                 <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
    //                 <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
    //               </div>
    //             </div>
    //             <span className="sr-only">Loading...</span>
    //           </div>))}
    //       </>
    //       :
    //       <>
    //         {getCurrentLayoutStructuresResponse.data?.listLayoutStructures.docs.map(
    //           (item: any) => (
    //             <Box>
    //                 Hii Record
    //             </Box>
    //             // <Card
    //             //   classNames={`col-span-${item.col} row-span-${item.row} bg-white`}
    //             //   rows={item.row}
    //             // >
    //             //   {/* <App
    //             //     jsxString={decodeURIComponent(escape(atob(item.component.code)))}
    //             //     onClick={() => console.log("Clicked A button")}
    //             //     metaData={{ recordData: DynamicGetQuaryResponse?.data?.[`get${modelName}`], model: GetModelResponse?.data?.getModel, modelFields: data?.listModelFields?.docs }}
    //             //     managed={item.component?.managed} componentName={item.component?.name}
    //             //   /> */}
    //             //   <Box>
    //             //     <Text>reacord ciew card</Text>
    //             //   </Box>
    //             // </Card>
    //           )
    //         )}
    //       </>}
    //   </div>
    // </div>

    <Box
      styles={{
        base: {
          width: "full",
        },
      }}
    >
      {/* <Box ml={5} mb={4}></Box> */}
      <Box
        styles={{
          base: {
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "0.5rem", // Assuming gap of 2 is equivalent to 0.5rem
            padding: "0.5rem", // Assuming p of 2 is equivalent to 0.5rem
            backgroundColor: "white", // Default light background
          },
          md: {
            gridTemplateColumns: "repeat(2, 1fr)",
          },
          lg: {
            gridTemplateColumns: "repeat(3, 1fr)",
          },
          _dark: {
            backgroundColor: "black", // Dark background
          },
        }}
      >
        {getCurrentLayoutStructuresResponse.loading ||
        loading ||
        ListLayoutsResponse?.loading ||
        GetModelResponse?.loading ||
        DynamicGetQuaryResponse?.loading
          ? [...Array(5)].map((_, index) => (
              <Box
                key={index}
                styles={{
                  base: {
                    padding: "1rem",
                    border: "1px solid",
                    borderColor: "#a1a9c6",
                    borderRadius: "md",
                    background:
                      "linear-gradient(90deg, #7e8ab2 25%, #a1a9c6 50%, #7e8ab2 75%)",
                    backgroundSize: "200% 100%",
                    animation: "loading 1.5s infinite",
                  },
                }}
              >
                <Box
                  styles={{
                    base: {
                      height: "4rem",
                      marginBottom: "1rem",
                      background: "#a1a9c6",
                      borderRadius: "md",
                    },
                  }}
                />
                <Box
                  styles={{
                    base: {
                      height: "0.625rem",
                      width: "12rem",
                      marginBottom: "1rem",
                      background: "#a1a9c6",
                      borderRadius: "full",
                    },
                  }}
                />
                <Box
                  styles={{
                    base: {
                      height: "0.5rem",
                      marginBottom: "0.625rem",
                      background: "#a1a9c6",
                      borderRadius: "full",
                    },
                  }}
                />
                <Box
                  styles={{
                    base: {
                      height: "0.5rem",
                      marginBottom: "0.625rem",
                      background: "#a1a9c6",
                      borderRadius: "full",
                    },
                  }}
                />
                <Box
                  styles={{
                    base: {
                      height: "0.5rem",
                      background: "#a1a9c6",
                      borderRadius: "full",
                    },
                  }}
                />
              </Box>
            ))
          : getCurrentLayoutStructuresResponse.data?.listLayoutStructures.docs.map(
              (item) => (
                // <Box
                //   key={item.id}
                //   styles={{
                //     base: {
                //       padding: "1rem",
                //       borderRadius: "md",
                //       backgroundColor: "white",
                //     },
                //   }}
                // >
                //   <Text>{item.name || "Hi Record"}</Text>
                // </Box>
                <Box
                  styles={{
                    base: {
                      gridColumn: `span ${item.col}`,
                      gridRow: `span ${item.row}`,
                      // maxHeight: `${item.row * 250}px`,
                      height: "auto",
                      overflowY: "auto",
                      borderRadius: "20px",
                      backgroundColor: "red",
                      color: "white",
                    },
                  }}
                >
                  <Text
                    styles={{
                      base: {
                        maxHeight: `${item.row * 250}px`,
                        background: "black",
                      },
                    }}
                  >
                    {/* <ErrorBoundary> */}
                    
                    <DynamicComponentLoader code={item.code}/>
                    {/* </ErrorBoundary> */}
                  </Text>
                </Box>
              )
            )}
      </Box>
    </Box>
  );
}

export default RecordView;
