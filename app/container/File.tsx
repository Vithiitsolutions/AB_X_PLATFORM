import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useLazyQuery } from "../utils/hook";
import { serverFetch } from "../utils/action";
import {
  ErrorOption,
  FieldArray,
  FieldArrayPath,
  FieldError,
  FieldErrors,
  FieldName,
  FieldValues,
  FormState,
  InternalFieldName,
  ReadFormState,
  RegisterOptions,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
  UseFormRegisterReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Text } from "@mercury-js/mess";
import FileForm from "../components/FileForm";
import { CREATE_FILE, GET_FILE, UPDATE_FILE } from "../utils/query";

const formSchema = z.object({
  description: z.string().optional(),
  name: z.string().optional(),
  file: z
    .object({
      raw: z.any().optional(),
      base64: z.string().optional(),
    })
    .optional(),
  extension: z.string().optional(),
});

const File = ({
  edit = false,
  handleClose,
}: {
  edit?: boolean;
  handleClose?: (value: string) => void;
}) => {
  const navigate = useNavigate();
  const recordId = useParams()?.recordId;
  const [base64URL, setBase64URL] = useState<string>("");
  const [uploadFile, { data, loading, error }] = useLazyQuery(serverFetch);
  const [updateFile, updateFileResponse] = useLazyQuery(serverFetch);
  const [getFile, getFileResponse] = useLazyQuery(serverFetch);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  // Function to convert file to base64
  const getBase64 = (file: File) => {
    return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
      let reader = new FileReader();

      // Convert the file to base64
      reader.readAsDataURL(file);

      // on reader load
      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;
    });
  };

  // Handle file input change
  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      try {
        // Convert the file to base64
        const base64 = await getBase64(selectedFile);

        // Set the file and base64 in the form values using form.setValue
        form.setValue("file", {
          raw: selectedFile,
          base64: base64 as string,
        });
      } catch (error) {
        console.log("Error converting file:", error);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    let where;
    if (edit == true && values?.file) {
      where = {
        description: values?.description,
        name: values?.name,
        id: recordId,
        base64: values?.file?.base64,
        extension: values?.file?.raw?.name.split(".").pop(),
      };
    } else if (edit == true && !values?.file) {
      where = {
        description: values?.description,
        name: values?.name,
        id: recordId,
      };
    }
    if (edit == true) {
      updateFile(
        UPDATE_FILE,
        { input: where },
        {
          cache: "no-store",
        }
      );
    } else {
      uploadFile(
        CREATE_FILE,
        {
          input: {
            base64: values.file?.base64,
            name: values?.name,
            description: values?.description,
            extension: values?.file?.raw?.name.split(".").pop(),
          },
        },
        {
          cache: "no-store",
        }
      );
    }
    // if (values.file) {
    //     console.log("File with base64:", values.file?.base64)
    // }

    // Handle other form data submission logic here
  }

  useEffect(() => {
    if (edit) {
      getFile(
        GET_FILE,
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
  }, []);
  useEffect(() => {
    if (getFileResponse?.data) {
      console.log(getFileResponse?.data, "getfile data");
      form.setValue("description", getFileResponse?.data?.getFile?.description);
      form.setValue("name", getFileResponse?.data?.getFile?.name);
    } else if (getFileResponse?.error) {
      console.log(getFileResponse?.error, "file error");
    }
    console.log(getFileResponse, "getFileResponse");
  }, [getFileResponse?.data, getFileResponse?.loading, getFileResponse?.error]);
  useEffect(() => {
    if (data) {
      if (typeof handleClose == "function") {
        handleClose(data?.createFile?.id);
      } else {
        console.log("File created successfully");
        navigate("/dashboard/o/File/list");
      }
    } else if (error) {
      console.log(error, "file error");
    }
  }, [data, loading, error]);

  useEffect(() => {
    if (updateFileResponse?.data) {
      console.log(updateFileResponse?.data, "update file data");
      navigate("/dashboard/o/File/list");
    } else if (updateFileResponse?.error) {
      console.log(updateFileResponse?.error, "file error");
    }
  }, [
    updateFileResponse?.data,
    updateFileResponse?.loading,
    updateFileResponse?.error,
  ]);
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
        styles={{
          base: {
            fontSize: "20px",
            fontWeight: 500,
          },
        }}
      >
        {recordId ? `Update File` : `Create File`}
      </Text>
      <FileForm
        form={form}
        loading={loading || updateFileResponse.loading}
        onSubmit={onSubmit}
        handleFileInputChange={handleFileInputChange}
        handleClose={handleClose}
      />
    </Box>
  );
};

export default File;
