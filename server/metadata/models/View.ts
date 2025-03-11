import mercury from "@mercury-js/core";

export const view = mercury.createModel("View", {
    name: {
        type: "string",
        required: true,
    },
    description: {
        type: "string",
        required: false,
    },
    profiles: {
        type: "relationship",
        ref: "Profile",
        many: true,
    },
    model: {
        type: "relationship",
        ref: "Model",
        required: true,
    },
    fields: {
        type: "virtual",
        ref: "ViewField",
        many: true,
        localField: "_id",
        foreignField: "view",
    },
}, {
    historyTracking: false,
    indexes: [
        {
            fields: {
                model: 1,
                profiles: 1
            },
            options: {
                unique: true,
            },
        },
    ],
});