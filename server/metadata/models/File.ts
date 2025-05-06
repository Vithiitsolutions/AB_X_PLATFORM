import mercury from "@mercury-js/core";

export const file = mercury.createModel(
  "File",
  {
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    mimeType: {
      type: "string",
    },
    extension: {
      type: "string",
    },
    size: {
      type: "float",
    },
    location: {
      type: "string",
    },
    mediaId: {
      type: "string",
    },
    base64: {
      type: "string"
    }
  },
  {
    historyTracking: false,
  }
);
