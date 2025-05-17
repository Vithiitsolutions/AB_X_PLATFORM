import mercury from "@mercury-js/core";

export const hook = mercury.createModel(
    'HookM',
    {
      model: {
        type: 'relationship',
        ref: 'Model',
        unique: true
      },
      modelName: {
        type: 'string',
      },
      enableBeforeCreate: {
        type: 'boolean',
        default: false,
      },
      beforeCreate: {
        type: 'relationship',
        ref: "Function"
      },
      enableAfterCreate: {
        type: 'boolean',
        default: false,
      },
      afterCreate: {
       type: 'relationship',
        ref: "Function"
      },
      enableBeforeUpdate: {
        type: 'boolean',
        default: false,
      },
      beforeUpdate: {
        type: 'relationship',
        ref: "Function"
      },
      enableAfterUpdate: {
        type: 'boolean',
        default: false,
      },
      afterUpdate: {
        type: 'relationship',
        ref: "Function"
      },
      enableBeforeDelete: {
        type: 'boolean',
        default: false,
      },
      beforeDelete: {
        type: 'relationship',
        ref: "Function"
      },
      enableAfterDelete: {
        type: 'boolean',
        default: false,
      },
      afterDelete: {
        type: 'relationship',
        ref: "Function"
      },
      enableBeforeGet: {
        type: 'boolean',
        default: false,
      },
      beforeGet: {
        type: 'relationship',
        ref: "Function"
      },
      enableAfterGet: {
        type: 'boolean',
        default: false,
      },
      afterGet: {
        type: 'relationship',
        ref: "Function"
      },
      enableBeforeList: {
        type: 'boolean',
        default: false,
      },
      beforeList: {
        type: 'relationship',
        ref: "Function"
      },
      enableAfterList: {
        type: 'boolean',
        default: false,
      },
      afterList: {
        type: 'relationship',
        ref: "Function"
      },
      enableBeforePaginate: {
        type: 'boolean',
        default: false,
      },
      beforePaginate: {
        type: 'relationship',
        ref: "Function"
      },
      enableAfterPaginate: {
        type: 'boolean',
        default: false,
      },
      afterPaginate: {
        type: 'relationship',
        ref: "Function"
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