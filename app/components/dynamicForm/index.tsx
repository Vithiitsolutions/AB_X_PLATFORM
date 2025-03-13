import React from "react";
import { useForm } from "react-hook-form";
import { CustomeInput, CustomSelect } from "../inputs";

function DynamicForm() {
    const { register, formState: { errors }, handleSubmit } = useForm();
      const onSubmit = (data: any) => console.log(data);

  const formFields = [
    {
      name: "firstName",
      type: "text",
      pattern: /^[A-Za-z]+$/i,
      label: "First Name",
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    {
      name: "mobile",
      type: "number",
      label: "Mobile Number",
      required: true,
      min: 1000000000, // 10-digit number
      max: 9999999999,
    },
    {
      name: "status",
      type: "radio",
      label: "Active Status",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
      required: true,
    },
    {
      name: "terms",
      type: "checkbox",
      label: "Accept Terms & Conditions",
      required: true,
    },
    {
      name: "gender",
      type: "select",
      label: "Gender",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
      ],
      required: true,
    },
  ];
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formFields.map((field, index) => (
        <div key={index} className="flex flex-col">
          <label className="font-medium">{field.label}</label>

          {/* Render Input Fields Dynamically */}
          {field.type === "text" || field.type === "number" ? (
            <CustomeInput
              type={field.type}
              placeholder={`Enter ${field.label}`}
              {...register(field.name, {
                required: field.required,
                minLength: field.minLength,
                maxLength: field.maxLength,
                min: field.min,
                max: field.max,
                pattern: field.pattern,
              })}
              aria-invalid={errors.firstName ? "true" : "false"} 
            />
          ) : field.type === "radio" ? (
            <div className="flex space-x-4">
              {field.options?.map((option, idx) => (
                <label key={idx} className="flex items-center space-x-2">
                  <CustomeInput
                    type="radio"
                    value={option.value}
                    {...register(field.name, { required: field.required })}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          ) : field.type === "checkbox" ? (
            <label className="flex items-center space-x-2">
              <CustomeInput type="checkbox" {...register(field.name, { required: field.required })} />
              <span>{field.label}</span>
            </label>
          ) : field.type === "select" ? (
            <CustomSelect
              options={field.options}
              {...register(field.name, { required: field.required })}
            />
          ) : null}
        </div>
      ))}
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Submit
      </button>
    </form>
  );
}

export default DynamicForm;
