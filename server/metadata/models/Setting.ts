import mercury from "@mercury-js/core";

export const setting = mercury.createModel("Setting", {
    logo: {
        type: "string"
    },
    favicon: {
        type: "string"
    },
    siteName: {
        type: "string",
        default: "Mercury Platform"
    },
    siteDescription: {
        type: "string",
        default: "A powerful platform for building web applications."
    },
    loginSideImage: {
        type: "string"
    },
    forgotPasswordLink: {
        type: "string"
    },
    buttons: {
        type: "relationship",
        many: true,
        ref: "Button"
      }
});