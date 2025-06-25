import mercury from "@mercury-js/core";
export const file = mercury.createModel("File", {
    name: {
        type: 'string',
    },
    description: {
        type: 'string',
    },
    mimeType: {
        type: 'string',
    },
    extension: {
        type: 'string',
    },
    size: {
        type: 'float',
    },
    location: {
        type: 'string',
    },
    type: {
        type: "enum",
        enumType: "string",
        enum: ["image", "video", "pdf"],
        // required: true
    },
    path: {
        type: "string"
    }
})