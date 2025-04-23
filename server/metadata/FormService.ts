import mercury from "@mercury-js/core";
import { GraphQLError } from "graphql";
import _ from "lodash";
import { object } from "zod";
export class Form {
  formId: string;
  user: any;
  constructor(formId: string, user: any) {
    this.user = user;
    this.formId = formId;
  }
  async getFormMetadata() {
    let form: any = await mercury.db.Form.get(
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
    form = form.toObject();
    if (_.isEmpty(form)) {
      throw new GraphQLError("Form not found");
    }
    
    const modelsData = _.uniqBy(
      form.fields?.map((field: any) => ({
      name: field?.refModel.name,
      label: field?.refModel.name,
      })),
      'name'
    );
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
              let fieldTemp = JSON.parse(JSON.stringify(formField));
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
            })
        };
      }),
    };
    
    return formConfig;
  }


  async createRecordsUsingForm(formData: JSON) {
    const formConfig = await this.getFormMetadata();
    await formConfig.models.map((model: any) => {
      return this.modelResolution(model.name, model.fields, formData, formConfig);
    });
  }
  async modelResolution(
    modelName: string,
    fields: any[],
    formData: any,
    formConfig: any
  ) {
    const modelData = formData[modelName];
    const modelFields = fields.filter(
      (field: any) => field.type == "relationship"
    );
    
    if (modelFields.length > 0) {
      await Promise.all(modelFields.map(async (field: any) => {
        const fieldData = formData[field.ref];
        if (fieldData) {
          const record = await this.modelResolution(
            field.ref,
            formConfig.models.find((mod: any) => mod.name === field.ref)
              ?.fields,
            formData,
            formConfig
          );
          if (record) {
            modelData[field.name] = record.id;
          }
        }
      }));
    }
    if (modelData) {
      if (!Array.isArray(modelData))
        return this.createRecordForModel(modelName, modelData);
      else {
        const records = await Promise.all(
          modelData.map(async (data: any) => {
            return this.createRecordForModel(modelName, data);
          })
        );
        return records;
      }
    }
  }
  async createRecordForModel(modelName: string, data: any) {
    const model = await mercury.db[modelName].create(data, this.user);
    return model.id;
  }
}
