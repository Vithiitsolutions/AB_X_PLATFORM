import { Box, Text } from "@mercury-js/mess";
import RecordView from "../container/RecordView";
import { serverFetch } from "../utils/action";
import {
  GET_LIST_MODEL_FIELDS,
  GET_MODEL,
  GET_TAB,
  LIST_LAYOUT_STRUCTURES,
  LIST_LAYOUTS,
} from "../utils/query";
import { GET_DYNAMIC_RECORD_DATA, parseCookies } from "../utils/functions";

export async function loader({ request }: any) {
  const tabData = await serverFetch(
    GET_TAB,
    {
      where: {
        label: {
          contains: "Dashboard",
        },
      },
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );
  if (tabData.error) {
    return tabData.error;
  }
  console.log(tabData, "tabData");

  const modelFieldsData = await serverFetch(
    GET_LIST_MODEL_FIELDS,
    {
      where: {
        modelName: {
          is: tabData?.listTabs?.docs[0]?.model?.name,
        },
        name: {
          notContains: "password",
        }
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
          is: tabData?.listTabs?.docs[0]?.model?.id,
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

  const layoutId = layoutData?.listLayouts?.docs.find(
    (item: any) => item.profiles && item.profiles.length === 0
  )?.id;

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
    "Dashboard",
    modelFieldsData?.listModelFields?.docs,
    request.headers.get("Cookie")
  );
  const recordData = await serverFetch(
    str,
    {
      where: {
        id: {
          is: tabData?.listTabs?.docs[0]?.recordId,
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
    modelName: "Dashboard",
    recordData: recordData?.[`getDashboard`],
    layoutStructuresData,
    layout: layoutData?.listLayouts?.docs.find(
      (item: any) => item.profiles && item.profiles.length === 0
    ),
  };
}

const dashboard = ({
  loaderData,
}: {
  loaderData: {
    recordData: any;
    layoutStructuresData: any;
    modelName: string;
    layout: any;
  };
}) => {

  return (
    <>
     

      <Box
        styles={{
          base: {
            width: "100%",
            // height: "fit-content",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "10px",
          },
        }}
      >
        <RecordView
          layout={loaderData.layout || {}}
          layoutStructuresData={loaderData.layoutStructuresData}
          recordData={loaderData.recordData}
          updateVisible={false}
        />
      </Box>
    </>
  );
};

export default dashboard;
