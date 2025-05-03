import mercury from "@mercury-js/core";

export const functionModel = mercury.createModel("Function", {
    name: {
        type: "string",
        required: true,
    },
    code: {
        type: "string",
        required: true,
    },
    description: {
        type: "string",
        required: true
    }
});
