"use client";
import React, { Suspense } from "react";

import { Box } from "@mercury-js/mess";
import DynamicComponentLoader from "../../components/DynamicComponentLoader";
import { MESS_TAGS } from "../../utils/constant";
import ManagedComponent from "../../components/managedComponent";
import { ErrorBoundary } from "../../root";
function RecordView({
  layoutStructuresData,
  recordData,
}: {
  layoutStructuresData: any;
  recordData: any;
}) {
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
        {layoutStructuresData?.listLayoutStructures.docs.map((item) => (
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
            {item.component?.managed ? (
              <ManagedComponent
                managed={item.component?.managed}
                componentName={item.component?.name}
              />
            ) : (
              <Suspense>
                {/* <ErrorBoundary> */}
                  <DynamicComponentLoader
                    code={item.component?.code}
                    props={{
                      Std: {
                        ...MESS_TAGS,
                        data: recordData,
                      },
                    }}
                  />
                {/* </ErrorBoundary> */}
              </Suspense>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default RecordView;
