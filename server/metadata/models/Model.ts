import mercury from "@mercury-js/core";

// Model
export const model = mercury.createModel("Model", {
  name: {
    type: "string",
    unique: true,
    required: true
  },
  label: {
    type: "string",
    required: true
  },
  description: {
    type: "string",
  },
  recordKey: {
    type: "relationship",
    ref: "ModelField",
  },
  managed: {
    type: "boolean",
  },
  // compoundIndex: {
  //   type: "string",
  // },
  fields: {
    type: "virtual",
    ref: "ModelField",
    localField: "_id",
    foreignField: "model",
    many: true,
  },
  options: {
    type: "virtual",
    ref: "ModelOption",
    localField: "_id",
    foreignField: "field",
    many: true,
  },
});
