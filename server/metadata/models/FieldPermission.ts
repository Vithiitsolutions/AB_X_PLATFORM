import mercury from "@mercury-js/core";

export const fieldPermission = mercury.createModel(
    "FieldPermission",
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
      fieldName: {
        type: 'string',
      },
      create: {
        type: 'boolean',
        required: true,
        default: false,
      },
      update: {
        type: 'boolean',
        required: true,
        default: false,
      },
      delete: {
        type: 'boolean',
        required: true,
        default: false,
      },
      read: {
        type: 'boolean',
        required: true,
        default: false,
      },
      modelField: {
        type: 'relationship',
        ref: 'ModelField',
        required: true,
      },
    },
    {
      historyTracking: false,
    }
  )