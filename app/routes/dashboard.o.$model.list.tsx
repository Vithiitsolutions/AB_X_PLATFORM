import React from "react";
import DynamicForm from "../components/dynamicForm";
import DynamicTableContainer from "../container/dynamicTableContainer";
import { serverFetch } from "../utils/action";
import { GET_VIEW, LIST_VIEW } from "../utils/query";
import {
  GET_DYNAMIC_MODEL_LIST,
  getModelFieldRefModelKey,
} from "../utils/functions";
import { A, Box } from "@mercury-js/mess";
import { ChevronsUpDown } from "lucide-react";
import { CustomeInput } from "../components/inputs";
import _ from "lodash";
import DynamicTable from "../components/table";

export async function loader({ params }: { params: { model: string } }) {
  const response = await serverFetch(
    GET_VIEW,
    {
      where: {
        modelName: {
          is: params?.model,
        },
      },
    },
    {
      cache: "no-store",
    }
  );
  if (response.error) {
    return response.error; //TODO: handle error
  }

  const response1 = await serverFetch(
    LIST_VIEW,
    {
      sort: {
        order: "asc",
      },
      where: {
        view: {
          is: response?.getView?.id,
        },
        visible: true,
      },
    },
    {
      cache: "no-store",
    }
  );

  const str = await GET_DYNAMIC_MODEL_LIST(
    params?.model as string,
    response1?.listViewFields?.docs.map((doc: any) => doc.field)
  );
  const modelData = await serverFetch(
    str,
    {
      sort: {
        createdOn: "desc",
      },
      limit: 10,
      offset: 0,
    },
    {
      cache: "no-store",
    }
  );
  return {
    view: response?.getView,
    dynamicQueryString: str,
    modelData: modelData?.[`list${params?.model}s`]?.docs,
    totalDocs: modelData?.[`list${params?.model}s`]?.totalDocs,
    modelName: params?.model,
    viewFields: response1?.listViewFields
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
  };
}) => {
  return (
    <div>
      {loaderData?.totalDocs && (
        <DynamicTableContainer
          viewFields={loaderData?.viewFields}
          dynamicQueryString={loaderData?.dynamicQueryString}
          modelData={loaderData?.modelData}
          modelName={loaderData?.modelName}
          totalDocs={loaderData?.totalDocs}
          viewId={loaderData.view?.id}
        />
      )}
    </div>
  );
};

export default dashboard;
