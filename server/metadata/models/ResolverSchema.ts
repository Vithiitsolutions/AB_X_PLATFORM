import mercury from "@mercury-js/core";

export const resolverSchema = mercury.createModel("ResolverSchema", {
    schema: {
        type: "string",
        required: true,
    },
    resolverFn: {
        type: "relationship",
        ref: "Function",
        required: true
    },
    type: {
        type: "enum",
        enumType: "string",
        enum: ["Query", "Mutation"]
    },
    name: {
        type: "string",
        required: true,
        unique: true
    }
});
