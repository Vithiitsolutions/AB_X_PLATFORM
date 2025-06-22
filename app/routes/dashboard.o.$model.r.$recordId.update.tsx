import React from "react";
import UpdateDynamicRecord from "../container/dynamicTableContainer/updateModelForm";
import File from "../container/File";
import { Box } from "@mercury-js/mess";

export async function loader({ params }: { params: { model: string } }) {
  return {
    modelName: params.model,
  };
}

function dashboad({
  loaderData,
}: {
  loaderData: {
    modelName: string;
  };
}) {
  return (
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
      {loaderData?.modelName === "File" ? (
        <File edit={true} />
      ) : (
        <UpdateDynamicRecord />
      )}
    </Box>
  );
}

export default dashboad;
