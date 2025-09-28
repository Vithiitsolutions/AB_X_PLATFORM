import { Box, Button, Text } from "@mercury-js/mess";
import React, { ChangeEventHandler } from "react";
import {
  Controller,
  FieldValues,
  Form,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import { CustomeInput } from "./inputs";
import CustomeButton, { DynamicButton } from "./Button";
import { useNavigate } from "react-router";

const FileForm = ({
  form,
  onSubmit,
  handleFileInputChange,
  loading,
  handleClose
}: {
  form: UseFormReturn;
  onSubmit: SubmitHandler<FieldValues>;
  handleFileInputChange: ChangeEventHandler<HTMLInputElement>;
  loading: boolean;
  handleClose?: (value: string) => void;
}) => {
  const navigate = useNavigate();
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
        <Controller
          control={form.control}
          name={"name"}
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
                Name
              </Text>
              <CustomeInput placeholder="File Name" {...field} />
              {form.formState.errors?.name && (
                <Text
                  styles={{
                    base: { color: "red", fontSize: "12px" },
                  }}
                >
                  {form.formState.errors?.["name"]?.message?.toString()}
                </Text>
              )}
              {/* <FormMessage /> */}
            </Box>
          )}
        />

        <Controller
          control={form.control}
          name={"description"}
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
                Description
              </Text>
              <CustomeInput placeholder="File Description" {...field} />
              {form.formState.errors?.description && (
                <Text
                  styles={{
                    base: { color: "red", fontSize: "12px" },
                  }}
                >
                  {form.formState.errors?.["description"]?.message?.toString()}
                </Text>
              )}
              {/* <FormMessage /> */}
            </Box>
          )}
        />

        <Controller
          control={form.control}
          name={"file"}
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
                File
              </Text>
              <CustomeInput
                placeholder="File"
                onChange={handleFileInputChange}
                type="file"
                addonstyles={{
                  base: {
                    paddingTop: "7px",
                  },
                }}
              />
              {form.formState.errors?.file && (
                <Text
                  styles={{
                    base: { color: "red", fontSize: "12px" },
                  }}
                >
                  {form.formState.errors?.["file"]?.message?.toString()}
                </Text>
              )}
              {/* <FormMessage /> */}
            </Box>
          )}
        />
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
          className="buttons-primaryButton"
        />
        <DynamicButton
          children={"Cancel"}
          variant={"secondary"}
          type={"action"}
          className="buttons-secondaryButton"

          addOnStyles={{
            style: {
              padding: "0px 20px !important",
            },
          }}
          onClick={() => {
            if (typeof handleClose === "function") {
              handleClose("");
            } else navigate(-1);
          }}
        />
      </Box>
    </form>
  );
};

export default FileForm;
