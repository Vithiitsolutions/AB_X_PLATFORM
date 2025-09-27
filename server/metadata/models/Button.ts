import mercury from "@mercury-js/core";

export const button = mercury.createModel(
  "Button",
  {
    type: {
      type: "enum",
      enum: ["submit", "reset", "link", "action", "custom"],
      enumType: "string",
      required: true,
    },
    label: {
      type: "string",
    },
    href: {
      type: "string",
    },
    text: {
      type: "string",
      required: true,
    },
    iconPosition: {
      type: "enum",
      enumType: "string",
      enum: ["left", "right"],
      default: "left",
    },

    variant: {
      type: "enum",
      enum: ["primary", "secondary", "cancel", "outline", "text", "danger"],
      enumType: "string",
      default: "primary",
    },

    icon: {
      type: "string",
    },

    tooltip: {
      type: "string",
    },

    disabled: {
      type: "boolean",
      default: false,
    },

    loading: {
      type: "boolean",
      default: false,
    },

    profiles: {
      type: "relationship",
      ref: "Profile",
      many: true,
    },
    buttonFn: {
      type: "relationship",
      ref: "Function",
    },
    className: {
      type: "string",
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
    historyTracking: true,
  }
);
