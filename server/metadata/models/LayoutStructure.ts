import mercury from "@mercury-js/core";

export const layoutStructure = mercury.createModel(
  "LayoutStructure",
  {
    layout: {
      type: "relationship",
      ref: "Layout",
      required: true,
    },
    component: {
      type: "relationship",
      ref: "Component",
      required: true,
    },
    order: {
      type: "number",
      required: true,
    },
    row: {
      type: "number",
    },
    col: {
      type: "number",
    },
    visible: {
      type: "boolean",
      default: true,
    },
  },
  {
    historyTracking: false,
    indexes: [
      {
        fields: {
          layout: 1,
          order: 1,
        },
        options: {
          unique: true,
        },
      },
    ],
  }
);
