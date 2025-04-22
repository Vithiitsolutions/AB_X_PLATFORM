import mercury from "@mercury-js/core";

export const profile = mercury.createModel(
  "Profile",
  {
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    label: {
      type: 'string',
      required: true,
      unique: true
    },
    permissions: {
      type: 'virtual',
      ref: 'Permission',
      localField: '_id',
      foreignField: 'profile',
      many: true,
    },
    inheritedProfiles: {
      type: 'relationship',
      ref: 'Profile',
      many: true
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
