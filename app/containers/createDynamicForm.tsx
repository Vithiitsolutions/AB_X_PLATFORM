"use client";
import React, { useEffect, useMemo } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { useLazyQuery } from "../utils/hook";
import { serverFetch } from "../utils/action";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicForm from "../components/dynamicForm/modelForm";

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
}: {
  model: string;
  handleClose?: (value: string | string[]) => void;
}) => {
  let navigate = useNavigate();
  const [getAllModelFields, { data, loading, error }] =
    useLazyQuery(serverFetch);
  const Create_Query = useMemo(() => {
    return `mutation Create${model}($input: ${model}Input!) {
            create${model}(input: $input) {
              id
            }
          }`;
  }, []);

  const formSchema = generateSchema(data?.listModelFields?.docs);
  type FormSchema = z.infer<typeof formSchema>;
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: data?.listModelFields?.docs.reduce(
      (acc: any, field: any) => {
        acc[field.name] =
          field.type === "boolean" ? false : field.type == "number" ? 0 : "";
        return acc;
      },
      {} as Record<string, any>
    ),
  });
  useEffect(() => {
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
        handleClose(createRecordResponse?.data[`create${model}`]?.id)
      } else navigate(`/dashboard/o/${model}/list`);
    }
    if (createRecordResponse?.error) {
      console.log(createRecordResponse?.error);
      //   toast({
      //     variant: "destructive",
      //     title: "Uh oh! Something went wrong.",
      //     description: createRecordResponse.error?.message,
      //   });
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
      {/* {modelName == "File" ? (
        <FileRecordContainer />
      ) : modelName == "Order" ? (
        <CreateOrderContainer />
      ) : (
        <DynamicForm
          handleSubmit={onSubmit}
          modelFields={data?.listModelFields?.docs || []}
          form={form}
          loading={createRecordResponse?.loading}
        />
      )} */}
      {data?.listModelFields?.docs.length > 0 && (
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
