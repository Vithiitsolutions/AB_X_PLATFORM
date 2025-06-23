import mercury from "@mercury-js/core";

export const AnonymousRules = [
  {
    modelName: "Setting",
    access: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
  },
  {
    modelName: "Page",
    access: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
  },
  {
    modelName: "Component",
    access: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
  },
];

mercury.access.createProfile("Anonymous", AnonymousRules);
