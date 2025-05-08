"use client";

import { useNavigate, useParams } from "react-router";
import { useLazyQuery } from "../../utils/hook";
import { serverFetch } from "../../utils/action";
import { useEffect, useMemo } from "react";
import { generateSchema } from "../../containers/createDynamicForm";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicForm from "../../components/dynamicForm/modelForm";
import React from "react";

const UpdateDynamicRecord = () => {
  // const router = useRouter()

  const { model } = useParams();
  const navigate = useNavigate();
  const { recordId } = useParams();
  console.log(model, recordId, "enter");
  const [getAllModelFields, { data, loading, error }] =
    useLazyQuery(serverFetch);
  const [dynamicGetQuary, DynamicGetQuaryResponse] = useLazyQuery(serverFetch);
  const Update_Query = useMemo(() => {
    return `mutation Update${model}($input: update${model}Input!) {
            update${model}(input: $input) {
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
        acc[field.fieldName] =
          field.type === "boolean" ? false : field.type == "number" ? 0 : "";
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
      // toast({
      //     variant: "destructive",
      //     title: "Uh oh! Something went wrong.",
      //     description: updateRecordResponse.error?.message,
      // });
    }
  }, [
    updateRecordResponse?.data,
    updateRecordResponse?.loading,
    updateRecordResponse?.error,
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
      console.log(DynamicGetQuaryResponse?.data, "DynamicGetQuaryResponse");
      data.listModelFields?.docs.forEach((item: any) => {
        if (item.type === "relationship") {
          if (item.many == true) {
            form.setValue(
              item.name,
              DynamicGetQuaryResponse?.data?.[`get${model}`]?.[item.name]?.map(
                (item: any) => item?.id
              )
            );
          } else{

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
  useEffect(() => {
    console.log(form, "form");
  }, [form]);
  return (
    <div>
      <DynamicForm
        handleSubmit={onSubmit}
        modelFields={data?.listModelFields?.docs || []}
        form={form}
        loading={updateRecordResponse?.loading}
        modelName={model!}
      />
    </div>
  );
};

export default UpdateDynamicRecord;
