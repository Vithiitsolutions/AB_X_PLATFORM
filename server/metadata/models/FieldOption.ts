import mercury from "@mercury-js/core";

mercury.createModel(
    'FieldOption',
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
      modelField: {
        type: 'relationship',
        ref: 'ModelField',
        required: true,
      },
      fieldName: {
        type: 'string',
        required: true,
      },
      keyName: {
        type: 'string',
        required: true,
      },
      type: {
        type: 'enum',
        enum: ['number', 'string', 'boolean'],
        enumType: 'string',
        required: true,
      },
      value: {
        type: 'string',
        required: true,
      },
      managed: {
        type: 'boolean',
        required: true,
        default: true,
      },
      prefix: {
        type: 'string',
        default: 'CUSTOM',
      },
    },
    {
      historyTracking: false,
    }
  );