import React from "react";
import CreateDynamicRecord from "../containers/createDynamicForm";
import RecordView from "../container/RecordView";
import { serverFetch } from "../utils/action";
import {
  GET_LIST_MODEL_FIELDS,
  GET_MODEL,
  LIST_LAYOUT_STRUCTURES,
  LIST_LAYOUTS,
} from "../utils/query";
import { GET_DYNAMIC_RECORD_DATA, parseCookies } from "../utils/functions";
import { Box } from "@mercury-js/mess";
import { layout } from "@react-router/dev/routes";

export async function loader({
  params,
  request,
}: {
  params: { model: string; record: string };
  request: any;
}) {
  const cookies = request.headers.get("Cookie");
  const cookieObject = parseCookies(cookies);
  const profileResponse = await serverFetch(
    `query Docs($where: whereProfileInput) {
  listProfiles(where: $where) {
    docs {
      id
      name
    }
  }
}`,
    {
      where: {
        name: {
          is: cookieObject.role,
        },
      },
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );
  if (profileResponse.error) {
    return profileResponse.error;
  }
  const { model, record } = params;
  const modelData = await serverFetch(
    GET_MODEL,
    {
      where: {
        name: {
          is: model,
        },
      },
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );
  if (modelData.error) {
    return modelData.error; //TODO: handle error
  }

  const modelFieldsData = await serverFetch(
    GET_LIST_MODEL_FIELDS,
    {
      where: {
        modelName: {
          is: model,
        },
        name: {
          notContains: "password",
        },
      },
      limit: 200,
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );
  if (modelFieldsData.error) {
    return modelFieldsData.error; //TODO: handle error
  }

  const layoutData = await serverFetch(
    LIST_LAYOUTS,
    {
      where: {
        model: {
          is: modelData?.getModel?.id,
        },
        profiles: {
          is: profileResponse?.listProfiles?.docs[0]?.id,
        },
      },
      limit: 100,
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );

  if (layoutData.error) {
    return layoutData.error; //TODO: handle error
  }

  const layoutId = layoutData?.listLayouts?.docs?.[0]?.id;

  const layoutStructuresData = await serverFetch(
    LIST_LAYOUT_STRUCTURES,
    {
      where: {
        layout: {
          is: layoutId,
        },
        visible: true,
      },
      sort: {
        order: "asc",
      },
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );

  if (layoutStructuresData.error) {
    return layoutStructuresData.error; //TODO: handle error
  }

  const str = await GET_DYNAMIC_RECORD_DATA(
    model as string,
    modelFieldsData?.listModelFields?.docs,
    request.headers.get("Cookie")
  );
  const recordData = await serverFetch(
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
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );

  if (recordData.error) {
    return recordData.error; //TODO: handle error
  }
  return {
    modelName: model,
    recordData: recordData?.[`get${model}`],
    layoutStructuresData,
    layout: layoutData?.listLayouts?.docs?.[0],
    buttons: layoutData?.listLayouts?.docs?.[0]?.buttons?.filter((btn: any) =>
      btn.profiles
        .map((item: any) => item?.id)
        .includes(profileResponse?.listProfiles?.docs[0]?.id)
    ),
  };
}

function Record({
  loaderData,
}: {
  loaderData: {
    recordData: any;
    layoutStructuresData: any;
    modelName: string;
    layout: any;
    buttons: any[];
  };
}) {
  return (
    <React.Suspense fallback={<ComponentSkeletonLoader />}>
      <Box
        styles={{
          base: {
            padding: "10px",
          },
          lg: {
            padding: "0",
          },
        }}
      >
        <RecordView
          layoutStructuresData={loaderData.layoutStructuresData}
          recordData={loaderData.recordData}
          layout={loaderData.layout}
          buttons={loaderData?.buttons}
        />
      </Box>
    </React.Suspense>
  );
}

export default Record;

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
