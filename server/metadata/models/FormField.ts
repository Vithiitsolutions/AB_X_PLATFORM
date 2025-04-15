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
  refModel: {
    type: "relationship",
    ref: "Model",
    required: true,
  },
  refField: {
    type: "relationship",
    ref: "ModelField",
    required: true,
  },
  regexp: {
    type: "string"
  },
  regExpError: {
    type: "string"
  }
});
