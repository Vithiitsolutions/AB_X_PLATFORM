import mercury from "@mercury-js/core";

export const form = mercury.createModel("Form", {
    name: {
        type: "string"
    },
    label: {
        type: "string"
    },
    description: {
        type: "string"
    },
    fields: {
        type: "virtual",
        ref: "FormField",
        localField: "_id",
        foreignField: "form",
        many: true
    }
})