import mercury from "@mercury-js/core";

// Model Fields
export const modelField = mercury.createModel("ModelField", {
  model: {
    type: "relationship",
    ref: "Model",
    required: true,
  },
  modelName: {
    type: "string",
    required: true,
  },
  name: {
    type: "string",
    required: true,
  },
  label: {
    type: "string",
    required: true,
  },
  type: {
    type: "enum",
    enumType: "string",
    enum: [
      "string",
      "number",
      "float",
      "boolean",
      "relationship",
      "enum",
      "virtual",
      "date",
      // "mixed", future
    ],
    required: true,
  },
  enumType: {
    type: "enum",
    enumType: "string",
    enum: ["string", "number"],
  }, 
  enumValues: {
    type: "string",
    many: true,
  },
  managed: {
    type: "boolean",
  },
  managedBy: {
    type: "relationship",
    ref: "Package",
  },
  immutable: {
    type: "boolean",
  },
//   select: {
//     type: "boolean",
//   },
//   minLength: {
//     type: "number",
//   },
//   maxLength: {
//     type: "number",
//   },
//   match: {
//     type: "string", //This is support regex
//   },
  required: {
    type: "boolean",
  },
  unique: {
    type: "boolean",
  },
//   indexed: {
//     type: "boolean",
//   },
//   virtual: {
//     type: "boolean",
//   },
//   relationship: {
//     type: "string",
//   },
  ref: {
    type:"string"
  },
  localField: {
    type: "string",
  },
  foreignField: {
    type: "string",
  },
  options: {
    type: "virtual",
    ref: "FieldOption",
    localField: "id",
    foreignField: "field",
    many: true,
  },
  many: { 
    type: "boolean",
  },
});