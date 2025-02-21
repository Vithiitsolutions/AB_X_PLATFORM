import mercury from "@mercury-js/core";

const rules = [
  {
    modelName: "Model",
    access: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
  },
  {
    modelName: "ModelField",
    access: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
  },
];

mercury.access.createProfile("System Admin", rules);
