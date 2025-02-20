import mercury from "@mercury-js/core";

mercury.createModel("Package", {
  name: {
    type: "string",
  },
  description: {
    type: "string",
  },
  label: {
    type: "string",
  },
  developedBy: {
    type: "string",
  },
  licenceKey: {
    type: "string",
  },
});
