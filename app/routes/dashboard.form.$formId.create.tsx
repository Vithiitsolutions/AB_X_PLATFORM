import React from 'react'
import CustomeForm from '../container/customeForm'
import { serverFetch } from '../utils/action';
import { GET_FORM, GET_META_DATA_RECORD_CREATE } from '../utils/query';
import { useParams } from 'react-router';
export async function loader({params}:{params:{formId:string}}) {
  const response = await serverFetch(
    GET_META_DATA_RECORD_CREATE,
    {
      "formId": params?.formId
    },
    {
      cache: "no-store",
    }
  );
  if (response.error) {
    return response.error; 
  }
  console.log(response,"response")
  return response;
}
function customeFormPage({ loaderData }: { loaderData: any }) {
    return (
        <div>    
              <CustomeForm data={loaderData}/>
        </div>
    )
}

export default customeFormPage