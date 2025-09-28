import DynamicTableContainer from "../container/dynamicTableContainer";
import { serverFetch } from "../utils/action";
import { GET_VIEW, LIST_VIEW } from "../utils/query";
import {
  GET_DYNAMIC_MODEL_LIST_VIEW_FIELDS,
  getModelFieldRefModelKey,
  parseCookies,
} from "../utils/functions";
import { Box } from "@mercury-js/mess";
import _ from "lodash";

export async function loader({
  params,
  request,
}: {
  params: { viewId: string };
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

  const viewId = params?.viewId;
  const response = await serverFetch(
    GET_VIEW,
    {
      where: {
        id: {
          is: viewId,
        },
      },
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );
  if (response.error) {
    return response.error; //TODO: handle error
  }
  const modelName = response?.getView?.modelName;
  const response1 = await serverFetch(
    LIST_VIEW,
    {
      sort: {
        order: "asc",
      },
      limit: 10000,
      where: {
        view: {
          is: response?.getView?.id,
        },
        visible: true,
      },
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );
  const refKeyMap: Record<string, string> = {};

  for (const field of response1?.listViewFields?.docs || []) {
    if (field.field.type === "relationship" || field.field.type === "virtual") {
      refKeyMap[field.field.name] = await getModelFieldRefModelKey(
        field.field.ref,
        request.headers.get("Cookie")
      );
    }
  }

  const str = await GET_DYNAMIC_MODEL_LIST_VIEW_FIELDS(
    modelName as string,
    response1?.listViewFields?.docs,
    request.headers.get("Cookie"),
    response?.getView?.name
  );

  const modelData = await serverFetch(
    str,
    {
      sort: {
        createdOn: -1,
      },
      limit: 10,
      page: 1,
      search: "",
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );

  // const searchComposition = getSearchCompostion(
  //   response1?.listViewFields?.docs.map((doc: any) => doc.field),
  //   ""
  // );

  const apiName = `${modelName?.charAt(0).toLowerCase()}${modelName?.slice(
    1
  )}ViewFor${cookieObject.role}${response?.getView?.name}`;
  return {
    view: response?.getView,
    dynamicQueryString: str,
    modelData: modelData?.[apiName]?.docs,
    totalDocs: modelData?.[apiName]?.totalDocs,
    modelName: modelName,
    viewFields: response1?.listViewFields,
    refKeyMap,
    // searchVariables: searchComposition,
    buttons: response?.getView?.buttons?.filter((btn: any) =>
      btn.profiles
        .map((item: any) => item?.id)
        .includes(profileResponse?.listProfiles?.docs[0]?.id)
    ),
    apiName,
  };
}

const dashboard = ({
  loaderData,
}: {
  loaderData: {
    view: any;
    dynamicQueryString: string;
    modelData: any;
    totalDocs: number;
    modelName: string;
    viewFields: any;
    refKeyMap: any;
    // searchVaraiables: any;
    buttons: any[];
    apiName: string;
  };
}) => {
  return (
    <Box
      styles={{
        base: {
          padding: 10,
        },
        lg: {
          padding: 0,
        },
      }}
    >
      {loaderData?.viewFields?.totalDocs && (
        <DynamicTableContainer
          viewFields={loaderData?.viewFields}
          dynamicQueryString={loaderData?.dynamicQueryString}
          modelData={loaderData?.modelData}
          modelName={loaderData?.modelName}
          totalDocs={loaderData?.totalDocs}
          viewId={loaderData.view?.id}
          filters={
            loaderData.view?.filters ? JSON.parse(loaderData.view?.filters) : {}
          }
          refKeyMap={loaderData?.refKeyMap}
          buttons={loaderData?.buttons}
          apiName={loaderData?.apiName}
          viewLabel={loaderData?.view?.label || loaderData?.view?.name}
          // searchVaraiables={loaderData?.searchVaraiables}
        />
      )}
    </Box>
  );
};

export default dashboard;
