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
      required: true,
    },
    model: {
      type: 'relationship',
      ref: 'Model',
      required: true,
    },
    modelName: {
      type: 'string',
      required: true,
    },
    fieldName: {
      type: 'string',
      required: true,
    },
    modelField: {
      type: 'relationship',
      ref: 'ModelField',
      required: true,
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
  },
  {
    historyTracking: false,
    indexes: [
      {
        fields: {
          profile: 1,
          model: 1,
          modelField: 1
        },
        options: {
          unique: true,
        },
      },
    ],
  }
)