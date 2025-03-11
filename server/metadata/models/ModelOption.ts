import mercury from "@mercury-js/core";

mercury.createModel(
  'ModelOption',
  {
    model: {
      type: 'relationship',
      ref: 'Model',
      required: true,
    },
    modelName: {
      type: 'string',
      required: true,
    },
    managed: {
      type: 'boolean',
      required: true,
      default: true,
    },
    keyName: {
      type: 'string',
      required: true,
    },
    value: {
      type: 'string',
      required: true,
    },
    type: {
      type: 'enum',
      enum: ['number', 'string', 'boolean'],
      enumType: 'string',
      required: true,
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