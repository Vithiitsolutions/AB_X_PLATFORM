import { Box, Text } from "@mercury-js/mess";
import React, { useEffect } from "react";
import { useLazyQuery } from "../utils/hook";
import { serverFetch } from "../utils/action";
import { GET_FORM } from "../utils/query";
import { z, ZodTypeAny } from "zod";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicCustomeForm from "../components/dynamicForm/customeForm";

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

export function generateZodSchemaWithRegexFallback(formJson: FormType) {
    const shape: Record<string, ZodTypeAny> = {};

    formJson?.data?.getForm?.fields.forEach((field) => {
        const { name, required, type } = field.refField;
        const userRegexp = field.regexp;
        const userRegExpError = field.regExpError;

        let zodType: ZodTypeAny;

        // Default regexes for types
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

        // Fallback regex if none is provided
        const fallback = defaultRegexMap[type];

        if (type === "string" || type === "number") {
            const finalRegex = userRegexp || fallback?.pattern?.source || ".*";
            const finalError = userRegExpError || fallback?.error || "Invalid value";

            // All values are initially strings, apply regex manually
            zodType = z
                .string()
                .regex(new RegExp(finalRegex), finalError);

            if (type === "number") {
                zodType = zodType.transform((val) => parseFloat(val));
            }
        } else {
            // If it's not a string/number, fallback to any
            zodType = z.any();
        }

        // Handle optional
        if (!required) {
            zodType = zodType.optional();
        }

        shape[name] = zodType;
    });

    return z.object(shape);
}

function CustomeForm({data}:{data:any}) {
    useEffect(()=>{

    },[data])
    const formJson = data;

    const formSchema = React.useMemo(() => {
        if (!formJson) return z.object({});
        return generateZodSchemaWithRegexFallback(formJson);
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

    const onSubmit: SubmitHandler<FormSchema> = (values) => {
        console.log("Form submitted with values:", values);
    };

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
