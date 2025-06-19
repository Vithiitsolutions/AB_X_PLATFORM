import mercury from "@mercury-js/core";

export const viewFilter = mercury.createModel("ViewFilter", {
  view: {
    type: "relationship",
    ref: "View",
  },
  title: {
    type: "string",
    required: true,
  },
  function: {
    type: "relationship",
    ref: "Function"
  },
  type: {
    type: "enum",
    enum: ["range", "select"],
    enumType: "string"
  }
});