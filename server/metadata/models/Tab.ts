import mercury from "@mercury-js/core";

mercury.createModel(
    "Tab",
    {
      icon: {
        type: 'string',
        required: true,
      },
      model: {
        type: 'relationship',
        ref: 'Model',
        required: true,
        unique: true
      },
      label: {
        type: 'string',
        required: true,
      },
      order: {
        type: 'number',
        required: true,
      },
      parent: {
        type: 'relationship',
        ref: 'Tab',
        many: false,
      },
      profiles: {
        type: "relationship",
        ref: "Profile",
        many: true
      },
      childTabs: {
        type: 'virtual',
        ref: 'Tab',
        many: true,
        localField: "_id",
        foreignField: "parent"
      },
      createdBy: {
        type: 'relationship',
        ref: 'User',
      },
      updatedBy: {
        type: 'relationship',
        ref: 'User'
      },
    },
    {
      historyTracking: false,
    }
  )