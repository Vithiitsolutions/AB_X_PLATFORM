"use client";

import { useNavigate, useParams } from "react-router";
import { useLazyQuery } from "../../utils/hook";
import { serverFetch } from "../../utils/action";
import { useEffect, useMemo } from "react";
import { generateSchema } from "../../containers/createDynamicForm";
import { z } from "zod";
import { set, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicForm from "../../components/dynamicForm/modelForm";
import React from "react";
import DynamicFormWithConfig from "../../components/dynamicForm/DynamicFormWithConfig";

const UpdateDynamicRecord = ({ profiles }: { profiles?: string[] }) => {
  // const router = useRouter()

  const { model } = useParams();
  const navigate = useNavigate();
  const { recordId } = useParams();

  const [getAllModelFields, { data, loading, error }] =
    useLazyQuery(serverFetch);
  const [dynamicGetQuary, DynamicGetQuaryResponse] = useLazyQuery(serverFetch);
  const [getForm, getFormResponse] = useLazyQuery(serverFetch);
  const [formFields, setFormFields] = React.useState<any[]>([]);
  const [formData, setFormData] = React.useState<any>(null);
  const [getFormFields, getFormFieldsResponse] = useLazyQuery(serverFetch);
  const Update_Query = useMemo(() => {
    return `mutation Update${model}($input: update${model}Input!) {
            update${model}(input: $input) {
              id
            }
          }`;
  }, []);

  const formSchema = generateSchema(
    formData?.id
      ? formFields.map((item) => item.field)
      : data?.listModelFields?.docs
  );
  type FormSchema = z.infer<typeof formSchema>;
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: formData?.id
      ? formFields.reduce(
          (acc: any, field: any) => {
            acc[field.field.name] =
              field.field.type === "boolean"
                ? false
                : field.field.type == "number"
                  ? 0
                  : "";
            return acc;
          },
          {} as Record<string, any>
        )
      : data?.listModelFields?.docs.reduce(
          (acc: any, field: any) => {
            acc[field.name] =
              field.type === "boolean"
                ? false
                : field.type == "number"
                  ? 0
                  : "";
            return acc;
          },
          {} as Record<string, any>
        ),
  });
  useEffect(() => {
    getAllModelFields(
      `query ListModelFields($where: whereModelFieldInput, $limit: Int!) {
    listModelFields(where: $where, limit: $limit) {
      docs {
        id
        name
        enumValues
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
          recordKey {
            id
            label
          }
        }

      }
      limit
    }
  }`,
      {
        where: {
          modelName: {
            is: model,
          },
          name: {
            notContains: "password",
          },
        },
        limit: 200,
      },
      {
        cache: "no-store",
      }
    );
  }, []);
  useEffect(() => {
    if (data) {
      console.log(data, "data");
      let str = `query Get${model}($where: where${model}Input!) {
                get${model}(where: $where) {
                        id`;
      data?.listModelFields?.docs?.forEach((item: any) => {
        if (item.type === "virtual" || item.type === "relationship") {
          str += `
                        ${item.name} {
                            id
                        }`;
          return;
        }
        str += `
                        ${item.name}`;
      });
      str += `
                        }
                }`;
      console.log(str);
      dynamicGetQuary(
        str,
        {
          where: {
            id: {
              is: recordId,
            },
          },
        },
        {
          cache: "no-store",
        }
      );
    }
    if (error) {
      console.log(error, "error");
    }
  }, [data, loading, error]);
  const [updateRecord, updateRecordResponse] = useLazyQuery(serverFetch);
  useEffect(() => {
    if (updateRecordResponse?.data) {
      console.log(updateRecordResponse?.data);
      navigate(-1);
      // toast({
      //     title: "Success",
      //     description: "Successful updated",
      // })
      // setTimeout(() => {
      //     router.back()
      // }, 2000)
    }
    if (updateRecordResponse?.error) {
      console.log(updateRecordResponse?.error);
      alert(updateRecordResponse?.error?.message);
    }
  }, [
    updateRecordResponse?.data,
    updateRecordResponse?.loading,
    updateRecordResponse?.error,
  ]);

  useEffect(() => {
    getForm(
      `query Docs($where: whereFormInput) {
    listForms(where: $where) {
      docs {
        id
        createLabel
        updateLabel
        model {
          id
          label
          name
        }
        modelName
        profiles {
          id
          label
          name
        }
      }
    }
  }`,
      {
        where: {
          modelName: {
            is: model,
          },
          profiles: {
            in: profiles,
          },
        },
      },
      {
        cache: "no-store",
      }
    );
  }, []);

  useEffect(() => {
    if (getFormResponse?.data) {
      const formId = getFormResponse?.data?.listForms?.docs[0]?.id;
      
      if (formId) {
        setFormData(getFormResponse?.data?.listForms?.docs[0]);
        getFormFields(
          `query Docs($where: whereFormFieldInput, $sort: sortFormFieldInput, $limit: Int!) {
  listFormFields(where: $where, sort: $sort, limit: $limit) {
    docs {
      id
      label
      placeholder
      regExpError
      regexp
      visible
      order
      createAllowed
      field {
        ref
        type
        required
        name
        unique
        label
        id
        enumType
        enumValues
        many
        modelName
        default
      }
    }
  }
}`,
          {
            where: {
              form: {
                is: formId,
              },
              visible: true,
              isEditable: true,
            },
            sort: {
              order: "asc",
            },
            limit: 1000,
          },
          { cache: "no-store" }
        );
      } else {
        setFormData(null);
        setFormFields([]);
      }
    }
  }, [getFormResponse?.data, getFormResponse?.loading, getFormResponse?.error]);
  useEffect(() => {
    if (getFormFieldsResponse?.data) {
      setFormFields(getFormFieldsResponse?.data?.listFormFields?.docs || []);
    }
    if (getFormFieldsResponse?.error) {
      setFormFields([]);
    }
  }, [
    getFormFieldsResponse?.data,
    getFormFieldsResponse?.loading,
    getFormFieldsResponse?.error,
  ]);

  const onSubmit: SubmitHandler<FormSchema> = (values) => {
    values.id = recordId;
    console.log(values);
    updateRecord(
      Update_Query,
      { input: values },
      {
        cache: "no-store",
      }
    );
  };

  useEffect(() => {
    if (DynamicGetQuaryResponse?.data) {
      data.listModelFields?.docs.forEach((item: any) => {
        if (item.type === "relationship") {
          if (item.many == true) {
            form.setValue(
              item.name,
              DynamicGetQuaryResponse?.data?.[`get${model}`]?.[item.name]?.map(
                (item: any) => item?.id
              )
            );
          } else {
            form.setValue(
              item.name,
              DynamicGetQuaryResponse?.data?.[`get${model}`]?.[item.name]?.id,
              { shouldTouch: true, shouldDirty: true, shouldValidate: true }
            );
          }
          return;
        }
        if (item.type === "date") {
          const input =
            DynamicGetQuaryResponse?.data?.[`get${model}`]?.[item.name];
          const date = new Date(input);

          const formatted =
            date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(date.getDate()).padStart(2, "0") +
            "T" +
            String(date.getHours()).padStart(2, "0") +
            ":" +
            String(date.getMinutes()).padStart(2, "0");

          form.setValue(item.name, formatted);
          return;
        }

        form.setValue(
          item.name,
          DynamicGetQuaryResponse?.data?.[`get${model}`]?.[item.name]
        );
      });
    } else if (DynamicGetQuaryResponse?.error) {
      console.log(DynamicGetQuaryResponse?.error);
    }
  }, [
    DynamicGetQuaryResponse?.data,
    DynamicGetQuaryResponse?.loading,
    DynamicGetQuaryResponse?.error,
  ]);
  return (
    <div>
      {formData && formFields && formFields.length > 0 ? (
        <DynamicFormWithConfig
          formFields={formFields || []}
          formConfig={formData}
          handleSubmit={onSubmit}
          form={form}
          loading={updateRecordResponse?.loading}
          modelName={model!}
        />
      ) : formData == null ? (
        <DynamicForm
          handleSubmit={onSubmit}
          modelFields={data?.listModelFields?.docs || []}
          form={form}
          loading={updateRecordResponse?.loading}
          modelName={model!}
        />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default UpdateDynamicRecord;
