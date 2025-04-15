import mercury from "@mercury-js/core";
import { GraphQLError } from "graphql";
import _ from "lodash";
export class Form {
  formId: string;
  user: any;
  constructor(formId: string, user: any) {
    this.user = user;
    this.formId = formId;
  }
  async getFormMetadata() {
    const form: any = await mercury.db.Form.get(
      { _id: this.formId },
      this.user,
      {
        populate: [
          {
            path: "fields",
            populate: [
              {
                path: "refField",
              },
              {
                path: "refModel",
              },
            ],
          },
        ],
      }
    );
    if (_.isEmpty(form)) {
      throw new GraphQLError("Form not found");
    }
    const modelsData = form.fields?.map((field: any) => ({
      name: field?.refModel.name,
      label: field?.refModel.name,
    }));
    const formConfig = {
      formId: form.id,
      name: form.name,
      description: form.description,
      models: modelsData.map((model: any) => {
        return {
          ...model,
          many: form?.fields?.some(
            (formField: any) =>
              formField.refField?.type === "relationship" &&
              formField.refField?.ref == model?.name &&
              formField.refField?.many
          ),
          fields: form?.fields
            ?.filter(
              (formField: any) => formField.refField.modelName === model.name
            )
            .map((formField: any) => {
              const fieldTemp = formField;
              delete fieldTemp.refField;
              delete fieldTemp.refModel;
              return {
                placeholder: formField?.placeholder,
                ...formField.refField,
                ...fieldTemp,
                hidden: ["virtual", "relationship"].includes(
                  formField.refField.type
                ),
              };
            }),
        };
      }),
    };
    return formConfig;
  }
}
