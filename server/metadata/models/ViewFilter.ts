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
  filterJson: {
    type: "string"
  }
});