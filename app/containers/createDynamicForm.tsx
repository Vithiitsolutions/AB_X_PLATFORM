"use client";
import React, { cache, useEffect, useMemo } from "react";
import { z } from "zod";
import { set, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { useLazyQuery } from "../utils/hook";
import { serverFetch } from "../utils/action";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicForm from "../components/dynamicForm/modelForm";
import { get } from "http";
import DynamicFormWithConfig from "../components/dynamicForm/DynamicFormWithConfig";

export const generateSchema = (metadata: any[]) => {
  const schemaObj: Record<string, any> = {};

  metadata?.forEach((field) => {
    const { name, type, required, enumType, label, many } = field;

    const wrapMany = (schema: any) => (many ? z.array(schema) : schema);

    switch (type) {
      case "string":
        schemaObj[name] = required
          ? wrapMany(z.string({ required_error: `${label} is required` }))
          : wrapMany(z.string()).optional();
        break;

      case "number":
      case "float":
        schemaObj[name] = required
          ? wrapMany(
              z.coerce.number({ required_error: `${label} is required` })
            )
          : wrapMany(z.coerce.number()).optional();
        break;

      case "boolean":
        schemaObj[name] = required
          ? wrapMany(z.boolean({ required_error: `${label} is required` }))
          : wrapMany(z.boolean()).optional();
        break;

      case "enum":
        if (enumType === "number") {
          schemaObj[name] = required
            ? wrapMany(
                z.coerce.number({ required_error: `${label} is required` })
              )
            : wrapMany(z.coerce.number()).optional();
        } else if (enumType === "string") {
          schemaObj[name] = required
            ? wrapMany(z.string({ required_error: `${label} is required` }))
            : wrapMany(z.string()).optional();
        }
        break;

      case "relationship":
        schemaObj[name] = required
          ? wrapMany(z.string({ required_error: `${label} is required` }))
          : wrapMany(z.string()).optional();
        break;

      case "date":
        schemaObj[name] = required
          ? wrapMany(z.coerce.date({ required_error: `${label} is required` }))
          : wrapMany(z.coerce.date()).optional();
        break;

      default:
        break;
    }
  });

  return z.object(schemaObj);
};

const CreateDynamicRecord = ({
  model,
  handleClose,
  profiles,
}: {
  model: string;
  handleClose?: (value: string) => void;
  profiles?: string[];
}) => {
  let navigate = useNavigate();
  const [getAllModelFields, { data, loading, error }] =
    useLazyQuery(serverFetch);
  const [getForm, getFormResponse] = useLazyQuery(serverFetch);
  const [formFields, setFormFields] = React.useState<any[]>([]);
  const [formData, setFormData] = React.useState<any>(null);
  const [getFormFields, getFormFieldsResponse] = useLazyQuery(serverFetch);
  const Create_Query = useMemo(() => {
    return `mutation Create${model}($input: ${model}Input!) {
            create${model}(input: $input) {
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
      setFormData(getFormResponse?.data?.listForms?.docs[0]);
      const formId = getFormResponse?.data?.listForms?.docs[0]?.id;

      if (formId) {
        getFormFields(
          `query Docs($where: whereFormFieldInput, $sort: sortFormFieldInput) {
  listFormFields(where: $where, sort: $sort) {
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
              isCreatable: true,
            },
            sort: {
              order: "asc",
            },
          },
          { cache: "no-store" }
        );
      } else {
        getAllModelFields(
          ` query ListModelFields($where: whereModelFieldInput, $limit: Int!) {
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
      }
    }
  }, [getFormResponse?.data, getFormResponse?.loading, getFormResponse?.error]);
  useEffect(() => {
    if (getFormFieldsResponse?.data) {
      setFormFields(getFormFieldsResponse?.data?.listFormFields?.docs || []);
    }
  }, [
    getFormFieldsResponse?.data,
    getFormFieldsResponse?.loading,
    getFormFieldsResponse?.error,
  ]);
  useEffect(() => {
    if (data) {
      console.log(data?.listModelFields?.docs, "data");
    } else if (error) {
      console.log(error, "error");
    }
  }, [data, loading, error]);
  const [createRecord, createRecordResponse] = useLazyQuery(serverFetch);
  useEffect(() => {
    if (createRecordResponse?.data) {
      console.log(createRecordResponse?.data);
      //   toast({
      //     title: "Success",
      //     description: "Successful created",
      //   });
      //   setTimeout(() => {
      //     router.back();
      //   }, 2000);

      if (typeof handleClose == "function") {
        handleClose(createRecordResponse?.data[`create${model}`]?.id);
      } else navigate(`/dashboard/o/${model}/list`);
    }
    if (createRecordResponse?.error) {
      console.log(createRecordResponse?.error);
    }
  }, [
    createRecordResponse?.data,
    createRecordResponse?.loading,
    createRecordResponse?.error,
  ]);

  const onSubmit: SubmitHandler<FormSchema> = (values) => {
    console.log("enter");
    console.log(values, "values");
    createRecord(
      Create_Query,
      { input: values },
      {
        cache: "no-store",
      }
    );
  };
  return (
    <div>
      {formData && formFields && formFields.length > 0 ? (
        <DynamicFormWithConfig
          handleSubmit={onSubmit}
          formFields={formFields || []}
          formConfig={formData}
          form={form}
          loading={createRecordResponse?.loading}
          modelName={model}
          handleClose={handleClose}
        />
      ) : (
        <DynamicForm
          handleSubmit={onSubmit}
          modelFields={data?.listModelFields?.docs || []}
          form={form}
          loading={createRecordResponse?.loading}
          modelName={model}
          handleClose={handleClose}
        />
      )}
    </div>
  );
};

export default CreateDynamicRecord;
