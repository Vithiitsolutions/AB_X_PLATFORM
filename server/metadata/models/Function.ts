import mercury from "@mercury-js/core";

mercury.createModel("Function", {
    name: {
        type: "string",
        required: true,
    },
    code: {
        type: "string",
        required: true,
    },
});
