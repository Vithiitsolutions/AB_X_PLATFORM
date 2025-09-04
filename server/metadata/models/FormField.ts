import mercury from "@mercury-js/core";

export const formField = mercury.createModel("FormField", {
  form: {
    type: "relationship",
    ref: "Form",
  },
  label: {
    type: "string",
  },
  placeholder: {
    type: "string",
  },
  field: {
    type: "relationship",
    ref: "ModelField",
    required: true,
  },
  regexp: {
    type: "string"
  },
  regExpError: {
    type: "string"
  },
  visible: {
    type: "boolean",
    default: true
  },
  order: {
    type: "number"
  },
  createAllowed: {
    type: "boolean",
    default: true
  }
});
