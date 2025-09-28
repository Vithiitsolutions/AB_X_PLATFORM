import mercury from "@mercury-js/core";

export const tab = mercury.createModel(
  "Tab",
  {
    icon: {
      type: "string",
      required: true,
    },
    model: {
      type: "relationship",
      ref: "Model",
      required: false,
      unique: false,
    },
    label: {
      type: "string",
      required: true,
    },
    order: {
      type: "number",
      required: true,
    },
    parent: {
      type: "relationship",
      ref: "Tab",
      many: false,
    },
    profiles: {
      type: "relationship",
      ref: "Profile",
      many: true,
    },
    childTabs: {
      type: "virtual",
      ref: "Tab",
      many: true,
      localField: "_id",
      foreignField: "parent",
    },
    type: {
      type: "enum",
      enumType: "string",
      enum: ["RECORD", "LIST", "PAGE", "VIEW_LIST"],
      default: "LIST",
    },
    view: {
      type: "relationship",
      ref: "View",
    },  
    recordId: {
      type: "string",
    },
    page: {
      type: "relationship",
      ref: "Page",
      many: false,
    },
    createdBy: {
      type: "relationship",
      ref: "User",
    },
    updatedBy: {
      type: "relationship",
      ref: "User",
    },
  },
  {
    historyTracking: false,
  }
);
