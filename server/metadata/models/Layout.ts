import mercury from "@mercury-js/core";

mercury.createModel(
    'Layout',
    {
      model: {
        type: 'relationship',
        ref: 'Model',
        required: true,
      },
      profiles: {
        type: 'relationship',
        ref: 'Profile',
        many: true
      },
      name: {
        type: 'string',
        required: true,
      },
      label: {
        type: 'string',
        required: true,
      },
      structures: {
        type: 'virtual',
        ref: 'LayoutStructure',
        localField: "_id",
        foreignField: "layout",
        many: true
      },

    },
    {
      historyTracking: false,
      indexes: [
        {
          fields: {
            profiles: 1,
            model: 1,
          },
          options: {
            unique: true,
          },
        },
      ]
    }
  );