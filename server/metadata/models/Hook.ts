import mercury from "@mercury-js/core";

mercury.createModel(
    'HookM',
    {
      model: {
        type: 'relationship',
        ref: 'Model',
      },
      modelName: {
        type: 'string',
      },
      enableBeforeCreate: {
        type: 'boolean',
        default: false,
      },
      beforeCreate: {
        type: 'string',
      },
      enableAfterCreate: {
        type: 'boolean',
        default: false,
      },
      afterCreate: {
        type: 'string',
      },
      enableBeforeUpdate: {
        type: 'boolean',
        default: false,
      },
      beforeUpdate: {
        type: 'string',
      },
      enableAfterUpdate: {
        type: 'boolean',
        default: false,
      },
      afterUpdate: {
        type: 'string',
      },
      enableBeforeDelete: {
        type: 'boolean',
        default: false,
      },
      beforeDelete: {
        type: 'string',
      },
      enableAfterDelete: {
        type: 'boolean',
        default: false,
      },
      afterDelete: {
        type: 'string',
      },
      enableBeforeGet: {
        type: 'boolean',
        default: false,
      },
      beforeGet: {
        type: 'string',
      },
      enableAfterGet: {
        type: 'boolean',
        default: false,
      },
      afterGet: {
        type: 'string',
      },
      enableBeforeList: {
        type: 'boolean',
        default: false,
      },
      beforeList: {
        type: 'string',
      },
      enableAfterList: {
        type: 'boolean',
        default: false,
      },
      afterList: {
        type: 'string',
      },
      createdBy: {
        type: 'relationship',
        ref: 'User',
      },
      updatedBy: {
        type: 'relationship',
        ref: 'User',
      },
    },
    {
      historyTracking: false
    }
  );