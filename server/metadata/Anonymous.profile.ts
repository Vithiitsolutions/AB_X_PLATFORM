import mercury from "@mercury-js/core";

export const AnonymousRules = [
  {
    modelName: "Setting",
    access: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
  },
];

mercury.access.createProfile("Anonymous", AnonymousRules);
