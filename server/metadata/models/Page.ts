import mercury from "@mercury-js/core";

export const page = mercury.createModel(
  "Page",
  {
    name: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    slug: {
      type: "string",
      required: true,
      unique: true,
      pattern: "^[a-z0-9\\-]+$",
    },
    component: {
      type: "relationship",
      ref: "Component",
      required: true,
    },
    isPublished: {
      type: "boolean",
      default: false,
    },
    metaTitle: {
      type: "string",
    },
    metaDescription: {
      type: "string",
    },
    metaKeywords: {
      type: "string",
      many: true,
    },
  },
  {
    historyTracking: true,
  }
);
