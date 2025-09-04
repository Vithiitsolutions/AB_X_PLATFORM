import mercury from "@mercury-js/core";

export const form = mercury.createModel("Form", {
    createLabel: {
        type: "string"
    },
    updateLabel: {
        type: "string"
    },
    fields: {
        type: "virtual",
        ref: "FormField",
        localField: "_id",
        foreignField: "form",
        many: true
    },
    profiles: {
        type: "relationship",
        ref: "Profile",
        many: true
    },
    model: {
        type: "relationship",
        ref: "Model"
    },
    modelName: {
        type: "string"
    }
})