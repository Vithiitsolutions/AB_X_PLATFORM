import React from "react";
import CreateDynamicRecord from "../containers/createDynamicForm";
import File from "../container/File";

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
    <div>
      {loaderData?.modelName === "File" ? <File /> : <CreateDynamicRecord model={loaderData.modelName}/>}
    </div>
  );
}

export default CreateModelForm;
