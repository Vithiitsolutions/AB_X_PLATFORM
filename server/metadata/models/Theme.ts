import mercury from "@mercury-js/core";

export const theme = mercury.createModel(
  "Theme",
  {
    label: {
      type: "string",
      required: true,
    },

    isActive: {
      type: "boolean",
      default: false,
    },
    config: {
      type: "string",
      required: true,
    },
  },
  {
    historyTracking: true,
  }
);
