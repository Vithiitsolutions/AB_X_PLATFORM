import React, { useEffect, useState } from 'react';
import { useLazyQuery } from '../../utils/hook';
import { serverFetch } from '../../utils/action';
import { GET_DYNAMIC_MODEL_LIST, getModelFieldRefModelKey } from '../../utils/functions';
import Multiselect from 'multiselect-react-dropdown';

const GenerateMultiRelationshipItems = ({ fieldData, form }: { fieldData: any; form: any }) => {
    const [listRecords, { data, loading, error }] = useLazyQuery(serverFetch);
    const [listModelFields, listModelFieldsResponse] = useLazyQuery(serverFetch);
    const [refKey, setRefKey] = useState('');
    const [options, setOptions] = useState<any[]>([]);
    const [selectedValues, setSelectedValues] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            const key = await getModelFieldRefModelKey(fieldData.ref);
            setRefKey(key);
        })();
        
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
                limit: 200,
            },
            {}
        );
    }, []);

    useEffect(() => {
        if (listModelFieldsResponse.data) {
            GET_DYNAMIC_MODEL_LIST(fieldData.ref, listModelFieldsResponse?.data?.listModelFields?.docs).then((data) => {
                listRecords(
                    data,
                    {
                        sort: {
                            createdOn: 'desc',
                        },
                        limit: 1000,
                    },
                    {}
                );
            });
        }
    }, [listModelFieldsResponse.data, listModelFieldsResponse.error, listModelFieldsResponse.loading]);

    useEffect(() => {
        if (data) {
            const formattedOptions = data?.[`list${fieldData.ref}s`]?.docs.map((item: any) => ({
                id: item.id,
                name: refKey ? item[refKey] : item.id,
            }));
            setOptions(formattedOptions || []);
            setSelectedValues(form.watch(fieldData.fieldName) || []);
        }
    }, [data]);

    const onSelect = (selectedList: any) => {
        setSelectedValues(selectedList);
        form.setValue(fieldData.fieldName, selectedList);
    };

    const onRemove = (selectedList: any) => {
        setSelectedValues(selectedList);
        form.setValue(fieldData.fieldName, selectedList);
    };

    return (
        <Multiselect
            options={options}
            selectedValues={selectedValues}
            onSelect={onSelect}
            onRemove={onRemove}
            displayValue="name"
        />
    );
};

export default GenerateMultiRelationshipItems;
