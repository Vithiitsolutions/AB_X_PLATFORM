"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useLazyQuery } from "../../utils/hook";
import { serverFetch } from "../../utils/action";
import { useParams } from "react-router";
import {
  GET_LIST_MODEL_FIELDS,
  GET_MODEL,
  LIST_LAYOUT_STRUCTURES,
  LIST_LAYOUTS,
} from "../../utils/query";
import {
  Box
} from "@mercury-js/mess";
import { GET_DYNAMIC_RECORD_DATA } from "../../utils/functions";
import DynamicComponentLoader from "../../components/DynamicComponentLoader";
import { ErrorBoundary } from "../../root";
import { MESS_TAGS } from "../../utils/constant";
import ManagedComponent from "../../components/managedComponent";
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
                      borderRadius: "5  px",
                      // backgroundColor: "red",
                      color: "white",
                    },
                  }}
                >
                  {/* <ErrorBoundary> */}
                  { item.component?.managed ?<ManagedComponent managed={item.component?.managed} componentName={item.component?.name} />: 
                  <Suspense>
                    <DynamicComponentLoader
                      code={item.component?.code}
                      props={{
                        Std: {
                          ...MESS_TAGS,
                          data: DynamicGetQuaryResponse?.data?.[`get${model}`],
                        },
                      }}
                    />
                  </Suspense>}
                  {/* </ErrorBoundary> */}
                </Box>
              )
            )}
      </Box>
    </Box>
  );
}

export default RecordView;
