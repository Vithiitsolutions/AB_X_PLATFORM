"use client";
import React, { Suspense, useEffect, useMemo } from "react";

import { Box } from "@mercury-js/mess";
import DynamicComponentLoader from "../../components/DynamicComponentLoader";
import { MESS_TAGS } from "../../utils/constant";
import ManagedComponent from "../../components/managedComponent";
import { ErrorBoundary } from "../../root";
import { DynamicButton } from "../../components/Button";
import { useNavigate, useParams } from "react-router";
import { useLazyQuery } from "../../utils/hook";
import { serverFetch } from "../../utils/action";
 import Cookies from 'js-cookie';

function PageView({
  pageData,
}: {
    pageData: any;
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
      flexWrap: "wrap",
      gap: "0.5rem",
      paddingTop: "0.5rem",
    },
    _dark: {
      backgroundColor: "black",
    },
  }}
>
  {pageData?.getPage &&
    <Box
      styles={{
        base: {
          width: "100%", // or set specific width like "48%" for 2-column-like layout
          height: "auto",
          overflowY: "auto",
          borderRadius: "5px",
          color: "white",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {pageData?.getPage.component?.managed ? (
        <ManagedComponent
          managed={pageData?.getPage.component?.managed}
          componentName={pageData?.getPage.component?.name}
        />
      ) : (
        <Suspense>
          <DynamicComponentLoader
            code={pageData?.getPage.component?.code}
            props={{
              Std: {
                ...MESS_TAGS,
                data: pageData?.getPage,
                serverFetch: serverFetch,
                useLazyQuery: useLazyQuery,
                userId: Cookies.get('userId'),
              },
            }}
          />
        </Suspense>
      )}
    </Box>
  }
</Box>

    </Box>
  );
}

export default PageView;
