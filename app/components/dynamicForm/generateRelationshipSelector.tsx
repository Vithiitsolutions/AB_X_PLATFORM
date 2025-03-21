import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { serverFetch } from '../../utils/action';
import { useLazyQuery } from '../../utils/hook';
import { GET_DYNAMIC_MODEL_LIST, getModelFieldRefModelKey } from '../../utils/functions';
import { Box, Option } from '@mercury-js/mess';

const GenerateRelationshipValues = ({ fieldData, form }: { fieldData: any, form: any }) => {
    const [listRecords, { data, loading, error }] = useLazyQuery(serverFetch);
    const [listModelFields, listModelFieldsResponse] = useLazyQuery(serverFetch);
    const [refKey, setRefKey] = useState("");

    useEffect(() => {
        (async () => {
            const key = await getModelFieldRefModelKey(fieldData.ref);
            setRefKey(key);
        })()
        listModelFields(
            `query ListModelFields($where: whereModelFieldInput, $limit: Int!) {
    listModelFields(where: $where, limit: $limit) {
      docs {
        id
        fieldName
        enumValues
        createdBy {
          id
          firstName
          
        }
        label
        managed
        required
        enumType
        ref
        many
        unique
        type
        model {
          id
          name
          label
          key
          prefix
        }
        updatedBy {
          id
          firstName
          
        }
      }
      limit
    }
  }`,
            {
                where: {
                    modelName: {
                        is: fieldData.ref,
                    },
                },
                limit: 200
            },
            {

            }
        )
    }, [])
    useEffect(() => {
        if (listModelFieldsResponse.data) {
            console.log(listModelFieldsResponse.data);

            GET_DYNAMIC_MODEL_LIST(fieldData.ref, listModelFieldsResponse?.data?.listModelFields?.docs).then((str) => {
                listRecords(
                    str,
                    {
                        sort: {
                            createdOn: "desc",
                        },
                        limit: 1000
                    },
                    {

                    }
                )
            })

        }
    }, [listModelFieldsResponse.data, listModelFieldsResponse.error, listModelFieldsResponse.loading])

    useEffect(() => {
        if (data) {
            console.log(form.watch(fieldData.fieldName));

        }
    }, [data])


    return (
        <Box>
            {
                data?.[`list${fieldData.ref}s`]?.docs.map((item: any) => {

                    return   <Option key={item?.id} value={item.id}  title={JSON.stringify(item, null, 4)}>
                    {refKey ? item[refKey] : item.id}
                   </Option>
                })
            }
        </Box>
    )
}

export default GenerateRelationshipValues