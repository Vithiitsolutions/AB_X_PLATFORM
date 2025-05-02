import mercury from "@mercury-js/core";

export const button = mercury.createModel(
    'Button',
    {
        type: {
            type: "enum",
            enum:["submit" , "reset" , "link" , "action" , "custom"], 
            enumType:"string",
            required: true,
          },
      
          href: {
            type: "string",
          },
          text:{
            type:"string",
            required:true
          },
          iconPosition:{
            type:"string"
          },
      
          variant: {
            type: "enum",
            enum:[ "primary","secondary", "cancel", "outline","text"], 
            enumType:"string",
            default: "primary",
          },
      
          icon: {
            type: "string",
          },
      
          tooltip: {
            type: "string",
          },
      
          disabled: {
            type: "boolean",
            default: false,
          },
      
          loading: {
            type: "boolean",
            default: false,
          },
      
          profiles: {
            type: "relationship",
            ref:"Profile",
            many: true,
          },
      
          createdBy: {
            type: "relationship",
            ref: "User",
          },
      
          updatedBy: {
            type: "relationship",
            ref: "User",
          },
        },
        {
          historyTracking: true,
        }
      );