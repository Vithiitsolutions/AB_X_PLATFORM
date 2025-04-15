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
    type: "string",
  },
  refField: {
    type: "string",
  },
  regexp: {
    type: "string"
  },
  regExpError: {
    type: "string"
  }
});
