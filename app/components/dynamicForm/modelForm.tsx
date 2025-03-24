"use client";
import { useForm, Controller } from "react-hook-form";

// import { ModelFieldType } from "@/types";
// import GenerateRelationshipValues from "./GenerateRelationshipSelectItems";
// import GenerateMultiRelationshipItems from "./GenerateMultiRelationshipItems";
import _ from "lodash";
import React from "react";
import { Box, Button, Clx, Option, Select, Text } from "@mercury-js/mess";
import { CustomeInput } from "../inputs";
import { ChevronDown } from "lucide-react";
import CustomeButton from "../Button";
import GenerateRelationshipValues from "./generateRelationshipSelector";
import GenerateMultiRelationshipItems from "./generateMultiRelationshipItem";

const DynamicForm = ({
  handleSubmit,
  modelFields,
  form,
  loading,
}: {
  handleSubmit: Function;
  modelFields: any[];
  form: any;
  loading?: boolean;
}) => {
  console.log(modelFields, "modelFields");
  return (
    <div>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
        {...form}
      >
        <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
          {modelFields.map((item) => {
            return (
              <div>
                {item.type === "string" &&
                  (!item.many || item?.many == null) && (
                    <Controller
                      control={form.control}
                      name={item.name}
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
                              base: { fontWeight: 500, fontSize: "15px" },
                            }}
                          >
                            {_.startCase(item.label)}
                          </Text>
                          <CustomeInput
                            placeholder={item.name}
                            {...field}
                            type="text"
                          />
                          {form.formState.errors[item.name] && (
                        <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                          {form.formState.errors[item.name]?.message}
                        </Text>
                      )}
                          {/* <FormMessage /> */}
                        </Box>
                      )}
                    />
                  )}

                {item.type == "date" && (
                  <Controller
                    control={form.control}
                    name={item.name}
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
                            base: { fontWeight: 500, fontSize: "15px" },
                          }}
                        >
                          {_.startCase(item.label)}
                        </Text>

                        {/* <DateTimePicker
                              granularity="second"
                              hourCycle={12}
                              jsDate={field.value}
                              onJsDateChange={field.onChange}
                            /> */}
                        <CustomeInput
                          placeholder={item.name}
                          {...field}
                          type="datetime-local"
                        />
                        {form.formState.errors[item.name] && (
                        <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                          {form.formState.errors[item.name]?.message}
                        </Text>
                      )}
                        {/* <FormMessage /> */}
                      </Box>
                    )}
                  />
                )}

                {["string", "number", "boolean"].includes(item.type) &&
                  item.many && (
                    <Controller
                      control={form.control}
                      name={item.name}
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
                              base: { fontWeight: 500, fontSize: "15px" },
                            }}
                          >
                            {_.startCase(item.label)}
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
                                  if (item.type === "number") {
                                    return isNaN(Number(trimmedValue))
                                      ? null
                                      : trimmedValue;
                                  } else if (item.type === "boolean") {
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
                                  if (item.type === "number") {
                                    return value !== null;
                                  } else if (item.type === "boolean") {
                                    return value !== null;
                                  }
                                  return true;
                                });

                              field.onChange(arrayValues);
                            }}
                          />
                          {form.formState.errors[item.name] && (
                        <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                          {form.formState.errors[item.name]?.message}
                        </Text>
                      )}
                          {/* </FormControl> */}
                          {/* <FormMessage /> */}
                        </Box>
                      )}
                    />
                  )}

                {item.type == "relationship" && !item.many && (
                  <Controller
                    control={form.control}
                    name={item.name}
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
                            base: { fontWeight: 500, fontSize: "15px" },
                          }}
                        >
                          {_.startCase(item.ref)}s
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
                         {...field} // Use field props directly
                         onValueChange={(value) => {
                           console.log(value, "enum value");
                           field.onChange(value); // Correct way to update value
                         }}
                         value={field.value}
                            styles={Clx({
                              base: {
                                height: 46,
                                width: "100%", // Inherit width from parent
                                border: "1.05px solid #E5E5E5",
                                borderRadius: "10.51px",
                                paddingLeft: 10,
                                paddingRight: 35, // Leave space for the icon
                                backgroundColor: "#fff",
                                cursor: "pointer",
                                appearance: "none",
                              },
                            })}
                          >
                            <Option disabled>
                              Select a {_.startCase(item.ref)}
                            </Option>
                            <GenerateRelationshipValues
                              fieldData={item}
                              form={form}
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
                        {form.formState.errors[item.name] && (
                        <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                          {form.formState.errors[item.name]?.message}
                        </Text>
                      )}
                      </Box>
                    )}
                  />
                )}

                {item.type == "relationship" && item.many && (
                  <Controller
                    control={form.control}
                    name={item.name}
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
                            base: { fontWeight: 500, fontSize: "15px" },
                          }}
                        >
                          {_.startCase(item.label)}
                        </Text>
                        <GenerateMultiRelationshipItems
                          fieldData={item}
                          form={form}
                          {...field}
                        />
                        {form.formState.errors[item.name] && (
                        <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                          {form.formState.errors[item.name]?.message}
                        </Text>
                      )}

                      </Box>
                    )}
                  />
                )}
                {["number", "float"].includes(item.type) && !item.many && (
                  <Controller
                    control={form.control}
                    name={item.name}
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
                            base: { fontWeight: 500, fontSize: "15px" },
                          }}
                        >
                          {_.startCase(item.label)}
                        </Text>
                        <CustomeInput
                          placeholder={item.name}
                          {...field}
                          type="number"
                        />
                        {form.formState.errors[item.name] && (
                        <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                          {form.formState.errors[item.name]?.message}
                        </Text>
                      )}
                        {/* <FormMessage /> */}
                      </Box>
                    )}
                  />
                )}

                {item.type === "boolean" && !item.many && (
                  <Controller
                    control={form.control}
                    name={item.name}
                    render={({ field }) => (
                      <Box  styles={{
                        base: {
                          display: "flex",
                          flexDirection: "column",
                          gap: 5,
                        },
                      }}>

                        <Box
                          styles={{
                            base: {
                              display: "flex",
                              flexDirection: "row",
                              gap: 5,
                            },
                          }}
                        >
                          <CustomeInput
                            checked={field.value}
                            onChange={field.onChange}
                          />
                          <div className="space-y-1 leading-none">
                            <Text
                              styles={{
                                base: { fontWeight: 500, fontSize: "15px" },
                              }}
                            >
                              {_.startCase(item.label)}
                            </Text>
                          </div>
                        </Box>
                        {form.formState.errors[item.name] && (
                          <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                            {form.formState.errors[item.name]?.message}
                          </Text>
                        )}
                      </Box>
                    )}
                  />
                )}
                {item.type === "enum" && (
                  <Controller
                    control={form.control}
                    name={item.name}
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
                            base: { fontWeight: 500, fontSize: "15px" },
                          }}
                        >
                          {_.startCase(item.label)}
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
                              form.setValue(item.name, value);
                            }}
                            value={form.watch(item.name)}
                            styles={Clx({
                              base: {
                                height: 46,
                                width: "100%", // Inherit width from parent
                                border: "1.05px solid #E5E5E5",
                                borderRadius: "10.51px",
                                paddingLeft: 10,
                                paddingRight: 35, // Leave space for the icon
                                backgroundColor: "#fff",
                                cursor: "pointer",
                                appearance: "none",
                              },
                            })}
                          >
                            <Option disabled>
                              Select {_.startCase(item.label)}
                            </Option>
                            {item?.enumValues.map((option) => (
                              <Option key={option} value={option}>
                                {option}
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
                        {form.formState.errors[item.name] && (
                          <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                            {form.formState.errors[item.name]?.message}
                          </Text>
                        )}
                      </Box>
                    )}
                  />
                )}
                {item.type === "textarea" && (
                  <Controller
                    control={form.control}
                    name={item.name}
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
                            base: { fontWeight: 500, fontSize: "15px" },
                          }}
                        >
                          {_.startCase(item.label)}
                        </Text>
                        <textarea
                          {...field}
                          placeholder={item.label}
                          className="border border-gray-300 rounded-md p-2 w-full h-24"
                        />
                          {form.formState.errors[item.name] && (
                          <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                            {form.formState.errors[item.name]?.message}
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
        <div className="flex justify-center items-center">
          <CustomeButton
            type="submit"
            children={loading ? "loading..." : "Submit"}
          />
        </div>{" "}
      </form>
    </div>
  );
};

export default DynamicForm;
