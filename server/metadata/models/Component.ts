import mercury from "@mercury-js/core";

export const component = mercury.createModel(
    'Component',
    {
      name: {
        type: 'string',
        required: true,
      },
      label: {
        type: 'string',
        required: true,
      },
      description: {
        type: 'string',
        required: true,
      },
      code: {
        type: 'string',
        required: true,
      },
      modules: {
        type: 'string',
        many: true,
      },
      managed: {
        type: "boolean",
        default: false
      },
      createdBy: {
        type: 'relationship',
        ref: 'User',
        // required: true,
      },
      updatedBy: {
        type: 'relationship',
        ref: 'User',
        // required: true,
      },
    },
    {
      historyTracking: false,
    }
  );