import mercury from "@mercury-js/core";

// Model
mercury.createModel("Model", {
  name: {
    type: "string",
  },
  label: {
    type: "string",
  },
  description: {
    type: "string",
  },
  primaryKey: {
    type: "relationship",
    ref: "ModelField",
  },
  managed: {
    type: "boolean",
  },
  compoundIndex: {
    type: "string",
  },
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

// Model Fields
mercury.createModel("ModelField", {
  model: {
    type: "relationship",
    ref: "Model",
  },
  name: {
    type: "string",
  },
  label: {
    type: "string",
  },
  type: {
    type: "string",
  },
  managed: {
    type: "boolean",
  },
  managedBy: {
    type: "relationship",
    ref: "Package",
  },
  // default: {
  //   type: "mixed",
  // },
  immutable: {
    type: "boolean",
  },
  select: {
    type: "boolean",
  },
  minLength: {
    type: "number",
  },
  maxLength: {
    type: "number",
  },
  match: {
    type: "string", //This is support regex
  },
  required: {
    type: "boolean",
  },
  unique: {
    type: "boolean",
  },
  indexed: {
    type: "boolean",
  },
  virtual: {
    type: "boolean",
  },
  relationship: {
    type: "string",
  },
  enumValues: {
    type: "string",
    many: true,
  },
  options: {
    type: "virtual",
    ref: "FieldOption",
    localField: "id",
    foreignField: "field",
    many: true,
  },
});

// // Model Options
mercury.createModel("ModelOption", {
  model: {
    type: "relationship",
    ref: "Model",
  },
  name: {
    type: "string",
  },
  valueType: {
    type: "enum",
    enumType: "string",
    enum: ["string", "number", "float", "boolean"],
  },
  // value: {
  //   type: "mixed",
  // },
});

// // Field Options
mercury.createModel("FieldOption", {
  field: {
    type: "relationship",
    ref: "ModelField",
  },
  name: {
    type: "string",
  },
  valueType: {
    type: "enum",
    enumType: "string",
    enum: ["string", "number", "float", "boolean"],
  },
  // value: {
  //   type: "mixed",
  // },
});
