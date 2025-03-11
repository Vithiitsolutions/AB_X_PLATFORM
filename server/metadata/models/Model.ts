import mercury from "@mercury-js/core";

// Model
mercury.createModel("Model", {
  name: {
    type: "string",
    unique: true
  },
  label: {
    type: "string",
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
    localField: "id",
    foreignField: "model",
    many: true,
  },
  options: {
    type: "virtual",
    ref: "ModelOption",
    localField: "id",
    foreignField: "field",
    many: true,
  },
});
