import mercury from "@mercury-js/core";

mercury.createModel(
  "User",
  {
    firstName: {
      type: 'string',
      required: true,
    },
    lastName: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
    },
    profile: {
      type: 'relationship',
      ref: 'Profile'
    },
    password: {
      type: 'string'
    },
  },
  {
    historyTracking: true,
  }
)