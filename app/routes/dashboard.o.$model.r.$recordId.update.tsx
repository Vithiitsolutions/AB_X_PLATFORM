import React from "react";
import UpdateDynamicRecord from "../container/dynamicTableContainer/updateModelForm";
import File from "../container/File";

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
    <div>
      
      {loaderData?.modelName === "File" ? <File edit={true} /> : <UpdateDynamicRecord />}
      
    </div>
  );
}

export default dashboad;
