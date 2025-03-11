import mercury from "@mercury-js/core";

export const permission = mercury.createModel(
    'Permission',
    {
      profile: {
        type: 'relationship',
        ref: 'Profile',
        required: true,
      },
      profileName: {
        type: 'string',
      },
      model: {
        type: 'relationship',
        ref: 'Model',
        required: true,
      },
      modelName: {
        type: 'string',
      },
      create: {
        type: 'boolean',
        required: true,
      },
      update: {
        type: 'boolean',
        required: true,
      },
      delete: {
        type: 'boolean',
        required: true,
      },
      read: {
        type: 'boolean',
        required: true,
      },
      fieldLevelAccess: {
        type: 'boolean',
        required: true,
        default: false,
      },
    },
    {
      historyTracking: false,
    }
  );