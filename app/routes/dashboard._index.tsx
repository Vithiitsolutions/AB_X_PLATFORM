import { Box, Text } from "@mercury-js/mess";
import React from "react";
import { DynamicButton } from "../components/Button";
import RecordView from "../container/RecordView";
import { serverFetch } from "../utils/action";
import { GET_LIST_MODEL_FIELDS, GET_MODEL, GET_TAB, LIST_LAYOUT_STRUCTURES, LIST_LAYOUTS } from "../utils/query";
import { GET_DYNAMIC_RECORD_DATA } from "../utils/functions";

export async function loader() {

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
      },
      limit: 200,
    },
    {
      cache: "no-store",
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
      },
      sort: {
        order: "asc",
      },
    },
    {
      cache: "no-store",
    }
  );

  if (layoutStructuresData.error) {
    return layoutStructuresData.error; //TODO: handle error
  }

  const str = await GET_DYNAMIC_RECORD_DATA(
    "Dashboard",
    modelFieldsData?.listModelFields?.docs
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
    }
  );

  if (recordData.error) {
    return recordData.error; //TODO: handle error
  }
  return {
    modelName: "Dashboard",
    recordData: recordData?.[`getDashboard`],
    layoutStructuresData,
    layout:layoutData?.listLayouts?.docs.find(
      (item: any) => item.profiles && item.profiles.length === 0
    )
  };
}


const dashboard = ({
  loaderData,
}: {
  loaderData: {
    recordData: any;
    layoutStructuresData: any;
    modelName: string;
    layout:any
  };
}) => {

  return (
    <Box styles={{
      base: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "start",
        height: "100vh",
      },
    }}>
      <Box
        styles={{
          base: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignContent: "center",
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
          Dashboard
        </Text>
        
      </Box>

      <Box styles={ {
        base: {
          width: "100%",
          height: "calc(100vh - 56px)",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "10px",
        },
      }}>

        <RecordView layout={loaderData.layout || {}} layoutStructuresData={loaderData.layoutStructuresData} recordData={loaderData.recordData} />
      </Box>
    </Box>
  );
};

export default dashboard;
