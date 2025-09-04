import React from "react";
import CreateDynamicRecord from "../containers/createDynamicForm";
import File from "../container/File";
import { Box } from "@mercury-js/mess";
import { parseCookies } from "../utils/functions";
import { serverFetch } from "../utils/action";

export async function loader({ params, request }: { params: { model: string }, request: any }) {

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
  return {
    modelName: params.model,
    profiles: profileResponse?.listProfiles?.docs[0]?.id || []
  };
}

function CreateModelForm({
  loaderData,
}: {
  loaderData: {
    modelName: string;
    profiles: string[];
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
        <CreateDynamicRecord model={loaderData.modelName} profiles={loaderData.profiles} />
      )}
    </Box>
  );
}

export default CreateModelForm;
