"use client"
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

function DynamicCustomeForm ({
    handleSubmit,
    modelFields,
    form,
    loading,
  }: {
    handleSubmit: Function;
    modelFields: any[];
    form: any;
    loading?: boolean;
  }){
    console.log(handleSubmit,modelFields,form,loading)
    return(
        <div>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8"
          {...form}
        >
          <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
            {modelFields?.map((item) => {

              return (
                <div>
                  {item?.refField?.type === "string" &&
                    (!item.refField?.many || item?.refField?.many == null) && (
                      <Controller
                        control={form.control}
                        name={item?.refField?.name}
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
                              {_.startCase(item.refField.label)}
                            </Text>
                            <CustomeInput
                              placeholder={item?.refField?.name}
                              {...field}
                              type="text"
                            />
                            {form.formState.errors[item.refField.name] && (
                          <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                            {form.formState.errors[item.refField.name]?.message}
                          </Text>
                        )}
                            {/* <FormMessage /> */}
                          </Box>
                        )}
                      />
                    )}
  
                  {item.refField.type == "date" && (
                    <Controller
                      control={form.control}
                      name={item.refField.name}
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
                            {_.startCase(item.refField.label)}
                          </Text>
  
                          {/* <DateTimePicker
                                granularity="second"
                                hourCycle={12}
                                jsDate={field.value}
                                onJsDateChange={field.onChange}
                              /> */}
                          <CustomeInput
                            placeholder={item.refField.name}
                            {...field}
                            type="datetime-local"
                          />
                          {form.formState.errors[item.refField.name] && (
                          <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                            {form.formState.errors[item.refField.name]?.message}
                          </Text>
                        )}
                          {/* <FormMessage /> */}
                        </Box>
                      )}
                    />
                  )}
  
                  {["string", "number", "boolean"].includes(item.refField.type) &&
                    item.refField.many && (
                      <Controller
                        control={form.control}
                        name={item.refField.name}
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
                              {_.startCase(item.refField.label)}
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
                                    if (item.refField.type === "number") {
                                      return isNaN(Number(trimmedValue))
                                        ? null
                                        : trimmedValue;
                                    } else if (item.refField.type === "boolean") {
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
                                    if (item.refField.type === "number") {
                                      return value !== null;
                                    } else if (item.refField.type === "boolean") {
                                      return value !== null;
                                    }
                                    return true;
                                  });
  
                                field.onChange(arrayValues);
                              }}
                            />
                            {form.formState.errors[item.refField.name] && (
                          <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                            {form.formState.errors[item.refField.name]?.message}
                          </Text>
                        )}
                            {/* </FormControl> */}
                            {/* <FormMessage /> */}
                          </Box>
                        )}
                      />
                    )}
  
                  {item.refField.type == "relationship" && !item.refField.many && (
                    <Controller
                      control={form.control}
                      name={item.refField.name}
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
                            {_.startCase(item.refField.ref)}s
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
                              <Option disabled selected>
                                Select a {_.startCase(item.refField.ref)}
                              </Option>
                              <GenerateRelationshipValues
                                fieldData={item.refField}
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
                          {form.formState.errors[item.refField.name] && (
                          <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                            {form.formState.errors[item.refField.name]?.message}
                          </Text>
                        )}
                        </Box>
                      )}
                    />
                  )}
  
                  {item.type == "relationship" && item.refField.many && (
                    <Controller
                      control={form.control}
                      name={item.refField.name}
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
                            {_.startCase(item.refField.label)}
                          </Text>
                          <GenerateMultiRelationshipItems
                            fieldData={item.refField}
                            form={form}
                            {...field}
                          />
                          {form.formState.errors[item.refField.name] && (
                          <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                            {form.formState.errors[item.refField.name]?.message}
                          </Text>
                        )}
  
                        </Box>
                      )}
                    />
                  )}
                  {["number", "float"].includes(item.refField.type) && !item.refField.many && (
                    <Controller
                      control={form.control}
                      name={item.refField.name}
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
                            {_.startCase(item.refField.label)}
                          </Text>
                          <CustomeInput
                            placeholder={item.refField.name}
                            {...field}
                            type="number"
                          />
                          {form.formState.errors[item.refField.name] && (
                          <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                            {form.formState.errors[item.refField.name]?.message}
                          </Text>
                        )}
                          {/* <FormMessage /> */}
                        </Box>
                      )}
                    />
                  )}
  
                  {item.refField.type === "boolean" && !item.refField.many && (
                    <Controller
                      control={form.control}
                      name={item.refField.name}
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
                                {_.startCase(item.refField.label)}
                              </Text>
                            </div>
                          </Box>
                          {form.formState.errors[item.refField.name] && (
                            <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                              {form.formState.errors[item.refField.name]?.message}
                            </Text>
                          )}
                        </Box>
                      )}
                    />
                  )}
                  {item.refField.type === "enum" && (
                    <Controller
                      control={form.control}
                      name={item.refField.name}
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
                            {_.startCase(item.refField.label)}
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
                                form.setValue(item.refField.name, value);
                              }}
                              value={form.watch(item.refField.name)}
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
                                Select {_.startCase(item.refField.label)}
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
                          {form.formState.errors[item.refField.name] && (
                            <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                              {form.formState.errors[item.refField.name]?.message}
                            </Text>
                          )}
                        </Box>
                      )}
                    />
                  )}
                  {item.type === "textarea" && (
                    <Controller
                      control={form.control}
                      name={item.refField.name}
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
                            {_.startCase(item.refField.label)}
                          </Text>
                          <textarea
                            {...field}
                            placeholder={item.refField.label}
                            className="border border-gray-300 rounded-md p-2 w-full h-24"
                          />
                            {form.formState.errors[item.refField.name] && (
                            <Text styles={{ base: { color: "red", fontSize: "12px" } }}>
                              {form.formState.errors[item.refField.name]?.message}
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
      </div>    )
}
export default DynamicCustomeForm