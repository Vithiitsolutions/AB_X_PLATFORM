"use client";
import React, { Suspense, useEffect, useMemo } from "react";

import { Box } from "@mercury-js/mess";
import DynamicComponentLoader from "../../components/DynamicComponentLoader";
import { INPUTS, MESS_TAGS } from "../../utils/constant";
import ManagedComponent from "../../components/managedComponent";
import { ErrorBoundary } from "../../root";
import { DynamicButton } from "../../components/Button";
import { useNavigate, useParams } from "react-router";
import { useLazyQuery } from "../../utils/hook";
import { serverFetch } from "../../utils/action";
 import Cookies from 'js-cookie';

function RecordView({
  layoutStructuresData,
  recordData,
  layout = {},
  updateVisible = true,
}: {
  layoutStructuresData: any;
  recordData: any;
  layout: any;
  updateVisible?: boolean;
}) {
  const params = useParams();
  const [DeleteRecordd, DeleteRecorddResponse] = useLazyQuery(serverFetch);
  const navigate = useNavigate();
  const Delete_Query = useMemo(() => {
    return `mutation Delete${params?.model}($delete${params?.model}Id: ID!) {
  delete${params?.model}(id: $delete${params?.model}Id)
}`;
  }, []);

  function DeleteRecord(id: string) {
    console.log(id);
    DeleteRecordd(
      Delete_Query,
      {
        [`delete${params?.model}Id`]: id,
      },
      {
        cache: "no-store",
      }
    );
  }
  useEffect(() => {
    if (DeleteRecorddResponse?.data) {
      // toast({
      //   title: "Success",
      //   description: "Successful deleted",
      // });
      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000);
      navigate(`/dashboard/o/${params?.model}/list`);
    } else if (DeleteRecorddResponse?.error) {
      // toast({
      //   variant: "destructive",
      //   title: "Uh oh! Something went wrong.",
      //   description: DeleteRecorddResponse?.error?.message,
      // });
    }
  }, [
    DeleteRecorddResponse?.data,
    DeleteRecorddResponse?.loading,
    DeleteRecorddResponse?.error,
  ]);
  return (
    <Box
      styles={{
        base: {
          width: "full",
        },
      }}
    >
      <Box
        styles={{
          base: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 10,
          },
        }}
      >
        {layout?.buttons?.map((button: any) => {
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
                  padding: "5px 10px",
                },
              }}
            />
          );
        })}
        {/* <DynamicButton
          children={"Delete"}
          iconPosition={"left"}
          variant={"danger"}
          icon={"Trash"}
          type={"action"}
          onClick={() => DeleteRecord(params?.record!)}
          addOnStyles={{
            base: {
              padding: "3px 8px",
              fontSize: "12px",
            },
          }}
        /> */}

        {updateVisible && (
          <DynamicButton
            children={"Update"}
            iconPosition={"left"}
            variant={"primary"}
            icon={"Pencil"}
            type={"link"}
            href={`/dashboard/o/${params?.model}/r/${params?.record}/update`}
            addOnStyles={{
              base: {
                padding: "3px 8px",
                fontSize: "12px",
              },
            }}
          />
        )}
      </Box>
      {/* <Box ml={5} mb={4}></Box> */}
      <Box
        styles={{
          base: {
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.5rem",
            paddingTop: "0.5rem",
          },
          md: {
            gridTemplateColumns: "repeat(4, 1fr)",
          },
          lg: {
            gridTemplateColumns: "repeat(6, 1fr)",
          },
          _dark: {
            backgroundColor: "black",
          },
        }}
      >
        {layoutStructuresData?.listLayoutStructures.docs.map((item) => (
          <Box
            styles={{
              base: {
                gridColumn: `span ${Math.floor(Number(item.col * 2))}`,
                gridRowStart: `${item.row}`, 
                gridRowEnd: `span 1`, 
                height: "100%",
                overflowY: "auto",
                borderRadius: "5px",
                color: "white",
                display: "flex",
                flexDirection: "column",
              },
              // sm: {
              //   minHeight: `${item.row * 120}px`, // Adjusted for smaller screens
              // },
              // md: {
              //   minHeight: `${item.row * 150}px`, // Adjusted for medium screens
              // },
              // lg: {
              //   minHeight: `${item.row * 180}px`, // Adjusted for larger screens
              // },
            }}
          >
            {item.component?.managed ? (
              <ManagedComponent
                managed={item.component?.managed}
                componentName={item.component?.name}
              />
            ) : (
              <Suspense>
                <DynamicComponentLoader
                  code={item.component?.code}
                  props={{
                    Std: {
                      ...MESS_TAGS,
                      data: recordData,
                      serverFetch: serverFetch,
                      useLazyQuery: useLazyQuery,
                      userId:Cookies.get('userId'),
                      ...INPUTS
                    },
                  }}
                />
              </Suspense>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default RecordView;
