import mercury from "@mercury-js/core";

export const packageM = mercury.createModel("Package", {
  name: {
    type: "string",
    required: true,
    unique: true,
  },
  label: {
    type: "string",
    required: true,
  },
  version: {
    type: "string",
  },
});
