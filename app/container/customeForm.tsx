import { Box, Text } from "@mercury-js/mess";
import React, { useEffect } from "react";
import { useLazyQuery } from "../utils/hook";
import { serverFetch } from "../utils/action";
import { CREATE_RECORD_FORM, GET_FORM } from "../utils/query";
import { z, ZodTypeAny } from "zod";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicCustomeForm from "../components/dynamicForm/customeForm";
import { useParams } from "react-router";

type FieldType = {
    refField: {
        name: string;
        required: boolean | null;
        type: string;
    };
    regexp?: string;
    regExpError?: string;
};

type FormType = {
    data: {
        getForm: {
            fields: FieldType[];
        };
    };
};

export const generateSchema = (metadata: any) => {
    const schemaObj: Record<string, ZodTypeAny> = {};

    const defaultRegexMap: Record<string, { pattern: RegExp; error: string }> = {
      string: {
        pattern: /^[\w\s]+$/, // letters, digits, underscores, spaces
        error: "Only letters, numbers, and spaces allowed",
      },
      number: {
        pattern: /^\d+$/, // digits only
        error: "Only numeric values allowed",
      },
    };
  
    metadata?.getForm?.fields?.forEach((field) => {
      const { name, type, required, enumType, label, many } = field.refField;
      const userRegexp = field.regexp;
      const userRegExpError = field.regExpError;
  
      const wrapMany = (schema: any) => (many ? z.array(schema) : schema);
  
      const getRegexZod = (fallbackKey: "string" | "number") => {
        const fallback = defaultRegexMap[fallbackKey];
        const pattern = userRegexp ? new RegExp(userRegexp) : fallback.pattern;
        const message = userRegExpError || fallback.error;
        return z.string().regex(pattern, message);
      };
  
      switch (type) {
        case "string":
          const stringZod = getRegexZod("string");
          schemaObj[name] = required
            ? wrapMany(stringZod)
            : wrapMany(stringZod.optional());
          break;
  
        case "number":
        case "float":
          const numberZod = getRegexZod("number").transform((val) => parseFloat(val));
          schemaObj[name] = required
            ? wrapMany(numberZod)
            : wrapMany(numberZod.optional());
          break;
  
        case "boolean":
          schemaObj[name] = required
            ? wrapMany(z.boolean({ required_error: `${label} is required` }))
            : wrapMany(z.boolean()).optional();
          break;
  
        case "enum":
          if (enumType === "number") {
            schemaObj[name] = required
              ? wrapMany(z.coerce.number({ required_error: `${label} is required` }))
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
          schemaObj[name] = z.any(); // fallback for unknown types
          break;
      }
    });
  
    return z.object(schemaObj);
  };
  const generateStructuredPayload = (fields: any[], values: Record<string, any>) => {
    const result: Record<string, Record<string, any>> = {};
  
    fields.forEach((field) => {
      const modelName = field?.refModel?.name;
      const fieldName = field?.refField?.name;
  
      if (modelName && fieldName) {
        if (!result[modelName]) {
          result[modelName] = {};
        }
        result[modelName][fieldName] = values[fieldName];
      }
    });
  
    return result;
  };
  
  
function CustomeForm({data}:{data:any}) {
    const [createRecordForm,createRecordFormResponse]=useLazyQuery(serverFetch)
    const {formId}=useParams()
    useEffect(()=>{

    },[data])
    const formJson = data;

    const formSchema = React.useMemo(() => {
        if (!formJson) return z.object({});
        return generateSchema(formJson);
    }, [formJson]);

    type FormSchema = z.infer<typeof formSchema>;

    const defaultValues = React.useMemo(() => {
        if (!formJson?.getForm?.fields) return {};
        return formJson?.getForm.fields.reduce((acc: any, field: any) => {
          const name = field.refField.name;
          const type = field.refField.type;
    
          acc[name] =
            type === "boolean" ? false : type === "number" ? 0 : ""; // default to empty string
    
          return acc;
        }, {} as Record<string, any>);
    }, [formJson]);
console.log(defaultValues,"defaultValues")
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    useEffect(() => {
        if (formJson) {
          console.log("Loaded form schema", formJson);
        }
    }, [formJson]);

    const onSubmit = async(values) => {
        console.log(values,"values")
        const payload =await generateStructuredPayload(formJson?.getForm?.fields,values)
        console.log("Form submitted with values:", payload);
        createRecordForm(CREATE_RECORD_FORM,{
            "formId": formId,
            "formData": payload
          }, {
            cache: "no-store",
          })

    };
useEffect(()=>{
    if(createRecordFormResponse?.data){
        console.log(createRecordFormResponse?.data,"data")

    }else if(createRecordFormResponse?.error){
        console.log(createRecordFormResponse?.error,"error")
    }
},[createRecordFormResponse?.data,createRecordFormResponse?.error,createRecordFormResponse.loading])
    if (!formJson) return <p>Loading...</p>;

    return (
        <Box styles={{
            // base:{
            //     background:"red"
            // }
        }}>
            <DynamicCustomeForm
                form={form}
                handleSubmit={onSubmit}
                modelFields={formJson?.getForm?.fields}
                loading={false}
            />
        </Box>
    );
}
export default CustomeForm;
