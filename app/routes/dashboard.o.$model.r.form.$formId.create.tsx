import React from 'react'
import CustomeForm from '../container/customeForm'
import { serverFetch } from '../utils/action';
import { GET_FORM } from '../utils/query';
export async function loader() {
  const response = await serverFetch(
    GET_FORM,
    {
        "where": {
            "id": {
                "is": "6803431c441dc5338056a096"
            }
        }
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
function CustomeFormPage({ loaderData }: { loaderData: any }) {
    return (
        <div>    
              <CustomeForm data={loaderData}/>
        </div>
    )
}

export default CustomeFormPage