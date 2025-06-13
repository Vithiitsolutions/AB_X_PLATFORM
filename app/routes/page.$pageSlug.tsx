import React from "react";
import CreateDynamicRecord from "../containers/createDynamicForm";
import RecordView from "../container/RecordView";
import { serverFetch } from "../utils/action";
import {
  GET_LIST_MODEL_FIELDS,
  GET_MODEL,
  GET_PAGES,
  LIST_LAYOUT_STRUCTURES,
  LIST_LAYOUTS,
} from "../utils/query";
import { GET_DYNAMIC_RECORD_DATA } from "../utils/functions";
import { Box } from "@mercury-js/mess";
import { layout } from "@react-router/dev/routes";
import PageView from "../container/pageView";

export async function loader({
  params,
  request,
}: {
  params: { pageSlug:string; };
  request: any;
}) {
  const { pageSlug} = params;
  const PageData = await serverFetch(
    GET_PAGES,
    {
      where: {
        slug: {
          is: pageSlug,
        },
        isPublished:true,
        isProtected: false,
      },
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );
  if (PageData.error) {
    return PageData.error; //TODO: handle error
  }


  return {
    pageData: PageData,
  };
}

function PageLayout({
  loaderData,
}: {
  loaderData: {
    pageData: any;
  };
}) {
  return (
    <React.Suspense fallback={<ComponentSkeletonLoader />}>
      <PageView pageData={loaderData.pageData}  />
    </React.Suspense>
  );
}

export default PageLayout;

const ComponentSkeletonLoader = () => {
  return (
    <>
      {[...Array(5)].map((_, index) => (
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
      ))}
    </>
  );
};
