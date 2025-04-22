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
      required: true
    },
    model: {
      type: 'relationship',
      ref: 'Model',
      required: true,
    },
    modelName: {
      type: 'string',
      required: true
    },
    create: {
      type: 'boolean',
      required: true,
      default: false
    },
    update: {
      type: 'boolean',
      required: true,
      default: false
    },
    delete: {
      type: 'boolean',
      required: true,
      default: false
    },
    read: {
      type: 'boolean',
      required: true,
      default: false
    },
    fieldLevelAccess: {
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
        },
        options: {
          unique: true,
        },
      },
    ],
  }
);