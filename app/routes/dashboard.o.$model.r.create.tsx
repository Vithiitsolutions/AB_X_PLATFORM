import React from "react";
import CreateDynamicRecord from "../containers/createDynamicForm";
import File from "../container/File";
import { Box } from "@mercury-js/mess";

export async function loader({ params }: { params: { model: string } }) {
  return {
    modelName: params.model,
  };
}

function CreateModelForm({
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
        <File />
      ) : (
        <CreateDynamicRecord model={loaderData.modelName} />
      )}
    </Box>
  );
}

export default CreateModelForm;
