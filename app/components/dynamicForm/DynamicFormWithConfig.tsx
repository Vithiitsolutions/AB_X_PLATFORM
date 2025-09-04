import {
  useForm,
  Controller,
  UseFormReturn,
  SubmitHandler,
  FieldValues,
} from "react-hook-form";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Clx,
  H1,
  Label,
  Option,
  Select,
  Text,
} from "@mercury-js/mess";
import { CustomeInput } from "../inputs";
import { ChevronDown } from "lucide-react";
import CustomeButton, { DynamicButton } from "../Button";
import GenerateRelationshipValues from "./generateRelationshipSelector";
import GenerateMultiRelationshipItems from "./generateMultiRelationshipItem";
import { useNavigate, useParams } from "react-router";
import CreateDynamicRecord from "../../containers/createDynamicForm";
import File from "../../container/File";

const DynamicFormWithConfig = ({
  handleSubmit,
  formFields,
  form,
  loading,
  modelName,
  handleClose,
  formConfig,
}: {
  handleSubmit: SubmitHandler<FieldValues>;
  formFields: any[];
  form: UseFormReturn;
  loading?: boolean;
  modelName: string;
  handleClose?: (vaue: string) => void;
  formConfig?: any;
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const [createRecord, setCreateRecord] = useState<{
    open: boolean;
    modelName: string;
    field: string;
    value: string | string[];
    many?: boolean;
  }>({
    open: false,
    modelName: "",
    field: "",
    value: "",
    many: false,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const capitalizeFirstLetter = (str?: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  console.log(formFields, "formFields");
  
  return (
    <Box
      styles={{
        base: {
          display: "flex",
          flexDirection: "column",
          gap: 20,
        },
      }}
    >
      <Text
        as={H1}
        styles={{
          base: {
            fontSize: "20px",
            fontWeight: 500,
          },
        }}
      >
        {((params?.recordId ? formConfig?.updateLabel : formConfig.createLabel) || (params?.recordId
            ? `Update ${capitalizeFirstLetter(modelName)}`
            : `Create ${capitalizeFirstLetter(modelName)}`))}
      </Text>

      {createRecord.open && (
        <Box
          styles={{
            base: {
              position: "fixed",
              inset: 0, // full viewport
              backgroundColor: "rgba(0, 0, 0, 0.5)", // dark semi-transparent backdrop
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000, // make sure it’s on top
            },
          }}
        >
          <Box
            styles={{
              base: {
                backgroundColor: "white",
                width: "90%",
                maxWidth: "600px",
                borderRadius: "10px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                padding: "20px 30px",
                maxHeight: "90vh",
                overflowY: "auto",
              },
            }}
          >
            {createRecord.modelName === "File" ? (
              <File
                handleClose={(value: string) => {
                  if (!value) {
                    setCreateRecord({
                      ...createRecord,
                      open: false,
                    });
                    return;
                  }
                  if (createRecord.many) {
                    form.setValue(
                      createRecord.field,
                      [...createRecord?.value, value],
                      {
                        shouldTouch: true,
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    );
                    setCreateRecord({
                      ...createRecord,
                      value: createRecord.many
                        ? [...createRecord?.value, value]
                        : value,
                      open: false,
                    });
                  } else {
                    form.setValue(createRecord.field, value, {
                      shouldTouch: true,
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setCreateRecord({
                      ...createRecord,
                      value: createRecord.many
                        ? [...createRecord?.value, value]
                        : value,
                      open: false,
                    });
                  }

                  setRefreshKey((prev) => prev + 1);
                }}
              />
            ) : (
              <CreateDynamicRecord
                model={createRecord.modelName}
                handleClose={(value: string) => {
                  if (!value) {
                    setCreateRecord({
                      ...createRecord,
                      open: false,
                    });
                    return;
                  }
                  if (createRecord.many) {
                    form.setValue(
                      createRecord.field,
                      [...createRecord?.value, value],
                      {
                        shouldTouch: true,
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    );
                    setCreateRecord({
                      ...createRecord,
                      value: createRecord.many
                        ? [...createRecord?.value, value]
                        : value,
                      open: false,
                    });
                  } else {
                    form.setValue(createRecord.field, value, {
                      shouldTouch: true,
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setCreateRecord({
                      ...createRecord,
                      value: createRecord.many
                        ? [...createRecord?.value, value]
                        : value,
                      open: false,
                    });
                  }

                  setRefreshKey((prev) => prev + 1);
                }}
              />
            )}
          </Box>
        </Box>
      )}

      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
        {...form}
      >
        <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
          {formFields.map((item) => {
            return (
              <div>
                {item.field?.type === "string" &&
                  (!item.field?.many || item?.field?.many == null) && (
                    <Controller
                      control={form.control}
                      name={item.field?.name}
                      render={({ field }) => (
                        <Box
                          styles={{
                            base: {
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            },
                          }}
                        >
                          <Text
                            styles={{
                              base: { fontWeight: 500, fontSize: "13px" },
                            }}
                          >
                            {item?.label || _.startCase(item.field?.label)}
                          </Text>
                          <CustomeInput
                            placeholder={item.placeholder}
                            {...field}
                            type="text"
                          />
                          {form.formState.errors[item.field?.name] && (
                            <Text
                              styles={{
                                base: { color: "red", fontSize: "12px" },
                              }}
                            >
                              {form.formState.errors[item.field?.name]?.message}
                            </Text>
                          )}
                          {/* <FormMessage /> */}
                        </Box>
                      )}
                    />
                  )}

                {item.field?.type == "date" && (
                  <Controller
                    control={form.control}
                    name={item.field?.name}
                    render={({ field }) => (
                      <Box
                        styles={{
                          base: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          },
                        }}
                      >
                        <Text
                          styles={{
                            base: { fontWeight: 500, fontSize: "13px" },
                          }}
                        >
                          {item?.label || _.startCase(item.field?.label)}
                        </Text>

                        {/* <DateTimePicker
                              granularity="second"
                              hourCycle={12}
                              jsDate={field.value}
                              onJsDateChange={field.onChange}
                            /> */}
                        <CustomeInput
                          placeholder={item.label}
                          {...field}
                          type="datetime-local"
                        />
                        {form.formState.errors[item.field?.name] && (
                          <Text
                            styles={{
                              base: { color: "red", fontSize: "12px" },
                            }}
                          >
                            {form.formState.errors[item.field?.name]?.message}
                          </Text>
                        )}
                        {/* <FormMessage /> */}
                      </Box>
                    )}
                  />
                )}

                {["string", "number", "boolean"].includes(item.field?.type) &&
                  item.field?.many && (
                    <Controller
                      control={form.control}
                      name={item.field?.name}
                      render={({ field }) => (
                        <Box
                          styles={{
                            base: {
                              display: "flex",
                              flexDirection: "column",
                              gap: 5,
                            },
                          }}
                        >
                          <Text
                            styles={{
                              base: { fontWeight: 500, fontSize: "13px" },
                            }}
                          >
                            {item?.label || _.startCase(item.field?.label)}
                          </Text>

                          {/* <FormControl> */}
                          <CustomeInput
                            placeholder={`Enter values separated by comma`}
                            {...field}
                            type="text"
                            onChange={(event) => {
                              const arrayValues = event.target.value
                                .split(",")
                                .map((value: string) => {
                                  const trimmedValue = value.trim();
                                  if (item.field?.type === "number") {
                                    return isNaN(Number(trimmedValue))
                                      ? null
                                      : trimmedValue;
                                  } else if (item.field?.type === "boolean") {
                                    return ["t", "T", "true", true].includes(
                                      trimmedValue
                                    )
                                      ? true
                                      : ["f", "F", "false", false].includes(
                                            trimmedValue
                                          )
                                        ? false
                                        : "";
                                  } else {
                                    return trimmedValue;
                                  }
                                })
                                .filter((value: any) => {
                                  if (item.field?.type === "number") {
                                    return value !== null;
                                  } else if (item.field?.type === "boolean") {
                                    return value !== null;
                                  }
                                  return true;
                                });

                              field.onChange(arrayValues);
                            }}
                          />
                          {form.formState.errors[item.field?.name] && (
                            <Text
                              styles={{
                                base: { color: "red", fontSize: "12px" },
                              }}
                            >
                              {form.formState.errors[item.field?.name]?.message}
                            </Text>
                          )}
                          {/* </FormControl> */}
                          {/* <FormMessage /> */}
                        </Box>
                      )}
                    />
                  )}

                {item.field?.type == "relationship" && !item.field?.many && (
                  <Controller
                    control={form.control}
                    name={item.field?.name}
                    render={({ field }) => (
                      <Box
                        styles={{
                          base: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          },
                        }}
                      >
                        <Box
                          styles={{
                            base: {
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between", // push left + right apart
                              width: "100%", // take full width of container
                            },
                          }}
                        >
                          <Text
                            styles={{
                              base: { fontWeight: 500, fontSize: "13px" },
                            }}
                          >
                            {item?.label || _.startCase(item.field?.label)}
                          </Text>

                          {item?.createAllowed && (
                            <Box
                              styles={{
                                base: {
                                  cursor: "pointer",
                                  background: "white",
                                  padding: "5px 10px", // add horizontal padding
                                  boxShadow:
                                    "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                                  borderRadius: "5px", // optional: smooth corners
                                  fontSize: "12px", // match or slightly smaller than the left text
                                },
                              }}
                              onClick={() =>
                                setCreateRecord({
                                  modelName: item.field?.ref,
                                  open: true,
                                  field: field.name,
                                  value: "",
                                  many: false,
                                })
                              }
                            >
                              + Create new {_.startCase(item.field?.ref)}
                            </Box>
                          )}
                        </Box>

                        <Box
                          styles={{
                            base: {
                              position: "relative", // Make parent relative for absolute positioning
                              display: "inline-block", // Adjust width based on content
                              width: "100%", // Ensure it remains dynamic
                            },
                          }}
                        >
                          <Select
                            onChange={field.onChange}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            disabled={field.disabled}
                            value={form.watch(item.field?.name)}
                            key={`${item.field?.name}-${refreshKey}`}
                            styles={Clx({
                              base: {
                                height: 40,
                                width: "100%", // Inherit width from parent
                                border: "1.05px solid #E5E5E5",
                                borderRadius: "10.51px",
                                paddingLeft: 10,
                                paddingRight: 35, // Leave space for the icon
                                backgroundColor: "#F8F8F8",
                                cursor: "pointer",
                                appearance: "none",
                                fontSize: "14px",
                              },
                            })}
                          >
                            <Option>
                              Select a {_.startCase(item.field?.ref)}
                            </Option>
                            <GenerateRelationshipValues
                              fieldData={item.field}
                              form={form}
                              key={`values-${refreshKey}`}
                            />
                          </Select>

                          {/* Dropdown Icon (absolute inside Box) */}
                          <Box
                            styles={{
                              base: {
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                              },
                            }}
                          >
                            <ChevronDown size={20} color="#555" />
                          </Box>
                        </Box>
                        {form.formState.errors[item.field?.name] && (
                          <Text
                            styles={{
                              base: { color: "red", fontSize: "12px" },
                            }}
                          >
                            {form.formState.errors[item.field?.name]?.message}
                          </Text>
                        )}
                      </Box>
                    )}
                  />
                )}

                {item.field?.type == "relationship" && item.field?.many && (
                  <Controller
                    control={form.control}
                    name={item.field?.name}
                    render={({ field }) => (
                      <Box
                        styles={{
                          base: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          },
                        }}
                      >
                        <Box
                          styles={{
                            base: {
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between", // push left + right apart
                              width: "100%", // take full width of container
                            },
                          }}
                        >
                          <Text
                            styles={{
                              base: { fontWeight: 500, fontSize: "13px" },
                            }}
                          >
                            {item?.label || _.startCase(item.field?.label)}
                          </Text>

                          {item?.createAllowed && (
                            <Box
                              styles={{
                                base: {
                                  cursor: "pointer",
                                  background: "white",
                                  padding: "5px 10px", // add horizontal padding
                                  boxShadow:
                                    "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                                  borderRadius: "5px", // optional: smooth corners
                                  fontSize: "12px", // match or slightly smaller than the left text
                                },
                              }}
                              onClick={() =>
                                setCreateRecord({
                                  modelName: item.field?.ref,
                                  open: true,
                                  field: field.name,
                                  value: field.value,
                                  many: true,
                                })
                              }
                            >
                              + Create new {_.startCase(item.field?.ref)}
                            </Box>
                          )}
                        </Box>
                        <GenerateMultiRelationshipItems
                          fieldData={item?.field}
                          form={form}
                          {...field}
                          key={`${item.field?.name}-${refreshKey}`}
                        />
                        {form.formState.errors[item.field?.name] && (
                          <Text
                            styles={{
                              base: { color: "red", fontSize: "12px" },
                            }}
                          >
                            {form.formState.errors[item.field?.name]?.message}
                          </Text>
                        )}
                      </Box>
                    )}
                  />
                )}
                {["number", "float"].includes(item.field?.type) &&
                  !item.field?.many && (
                    <Controller
                      control={form.control}
                      name={item.field?.name}
                      render={({ field }) => (
                        <Box
                          styles={{
                            base: {
                              display: "flex",
                              flexDirection: "column",
                              gap: 5,
                            },
                          }}
                        >
                          <Text
                            styles={{
                              base: { fontWeight: 500, fontSize: "13px" },
                            }}
                          >
                            {item?.label || _.startCase(item.field?.label)}
                          </Text>
                          <CustomeInput
                            placeholder={item.label}
                            {...field}
                            type="number"
                          />
                          {form.formState.errors[item.field?.name] && (
                            <Text
                              styles={{
                                base: { color: "red", fontSize: "12px" },
                              }}
                            >
                              {form.formState.errors[item.field?.name]?.message}
                            </Text>
                          )}
                          {/* <FormMessage /> */}
                        </Box>
                      )}
                    />
                  )}

                {item.field?.type === "boolean" && !item.field?.many && (
                  <Controller
                    control={form.control}
                    name={item.field?.name}
                    render={({ field }) => (
                      <Box
                        styles={{
                          base: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          },
                        }}
                      >
                        <Box
                          styles={{
                            base: {
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 5,
                              marginTop: 20,
                            },
                          }}
                        >
                          <CustomeInput
                            checked={field.value}
                            onChange={field.onChange}
                            type="checkbox"
                            addonstyles={{
                              base: {
                                height: "20px",
                                width: "20px",
                              },
                            }}
                            id={item.field?.name}
                            name={item.field?.name}
                          />
                          <div className="space-y-1 leading-none">
                            <Label
                              htmlFor={item.field?.name}
                              styles={{
                                base: { fontWeight: 500, fontSize: "13px" },
                              }}
                            >
                              {item?.label || _.startCase(item.field?.label)}
                            </Label>
                          </div>
                        </Box>
                        {form.formState.errors[item.field?.name] && (
                          <Text
                            styles={{
                              base: { color: "red", fontSize: "12px" },
                            }}
                          >
                            {form.formState.errors[item.field?.name]?.message}
                          </Text>
                        )}
                      </Box>
                    )}
                  />
                )}
                {item.field?.type === "enum" && (
                  <Controller
                    control={form.control}
                    name={item.field?.name}
                    render={({ field }) => (
                      <Box
                        styles={{
                          base: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          },
                        }}
                      >
                        <Text
                          styles={{
                            base: { fontWeight: 500, fontSize: "13px" },
                          }}
                        >
                          {item?.label || _.startCase(item.field?.label)}
                        </Text>

                        <Box
                          styles={{
                            base: {
                              position: "relative", // Make parent relative for absolute positioning
                              display: "inline-block", // Adjust width based on content
                              width: "100%", // Ensure it remains dynamic
                            },
                          }}
                        >
                          <Select
                            {...field}
                            onValueChange={(value) => {
                              console.log(value, "enum value");
                              form.setValue(item.field?.name, value);
                            }}
                            value={form.watch(item.field?.name)}
                            styles={Clx({
                              base: {
                                height: 40,
                                width: "100%", // Inherit width from parent
                                border: "1.05px solid #E5E5E5",
                                borderRadius: "10.51px",
                                paddingLeft: 10,
                                paddingRight: 35, // Leave space for the icon
                                backgroundColor: "#F8F8F8",
                                cursor: "pointer",
                                appearance: "none",
                                fontSize: "14px",
                              },
                            })}
                          >
                            <Option>
                              Select{" "}
                              {item?.label || _.startCase(item.field?.label)}
                            </Option>
                            {item?.enumValues?.map((option) => (
                              <Option key={option} value={option}>
                                {_.startCase(option)}
                              </Option>
                            ))}
                          </Select>

                          {/* Dropdown Icon (absolute inside Box) */}
                          <Box
                            styles={{
                              base: {
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                              },
                            }}
                          >
                            <ChevronDown size={20} color="#555" />
                          </Box>
                        </Box>
                        {form.formState.errors[item.field?.name] && (
                          <Text
                            styles={{
                              base: { color: "red", fontSize: "12px" },
                            }}
                          >
                            {form.formState.errors[item.field?.name]?.message}
                          </Text>
                        )}
                      </Box>
                    )}
                  />
                )}
                {item.field?.type === "textarea" && (
                  <Controller
                    control={form.control}
                    name={item.field?.name}
                    render={({ field }) => (
                      <Box
                        styles={{
                          base: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          },
                        }}
                      >
                        <Text
                          styles={{
                            base: { fontWeight: 500, fontSize: "13px" },
                          }}
                        >
                          {item?.label || _.startCase(item.field?.label)}
                        </Text>
                        <textarea
                          {...field}
                          placeholder={item.label}
                          className="border border-gray-300 rounded-md p-2 w-full h-24"
                        />
                        {form.formState.errors[item.field?.name] && (
                          <Text
                            styles={{
                              base: { color: "red", fontSize: "12px" },
                            }}
                          >
                            {form.formState.errors[item.field?.name]?.message}
                          </Text>
                        )}
                      </Box>
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        <Box
          styles={{
            base: {
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              gap: 10,
            },
          }}
        >
          <CustomeButton
            type="submit"
            children={loading ? "loading..." : "Submit"}
          />
          <DynamicButton
            children={"Cancel"}
            variant={"secondary"}
            type={"action"}
            onClick={() => {
              if (typeof handleClose === "function") {
                handleClose("");
              } else navigate(-1);
            }}
          />
        </Box>{" "}
      </form>
    </Box>
  );
};

export default DynamicFormWithConfig;
