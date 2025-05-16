import React from "react";
import CustomeForm from "../container/customeForm";
import { serverFetch } from "../utils/action";
import { GET_FORM, GET_META_DATA_RECORD_CREATE } from "../utils/query";
import { useParams } from "react-router";
export async function loader({
  params,
  request,
}: {
  params: { formId: string };
  request: any;
}) {
  const response = await serverFetch(
    GET_META_DATA_RECORD_CREATE,
    {
      formId: params?.formId,
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );
  if (response.error) {
    return response.error;
  }
  console.log(response, "response");
  return response;
}
function customeFormPage({ loaderData }: { loaderData: any }) {
  return (
    <div>
      <CustomeForm data={loaderData} />
    </div>
  );
}

export default customeFormPage;
