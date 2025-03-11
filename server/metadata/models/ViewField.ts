import mercury from "@mercury-js/core";

mercury.createModel(
  "ViewField",
  {
    view: {
      type: "relationship",
      ref: "View",
      required: true,
    },
    field: {
      type: "relationship",
      ref: "ModelField",
      required: true,
    },
    order: {
      type: "number",
      required: true,
    },
    visible: {
      type: "boolean",
      required: true,
    },
  },
  {
    historyTracking: false,
    indexes: [
      {
        fields: {
          view: 1,
          order: 1,
          field: 1,
        },
        options: {
          unique: true,
        },
      },
    ],
  }
);
