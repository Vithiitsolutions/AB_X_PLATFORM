
import mercury from "@mercury-js/core";
import { GraphQLError } from "graphql";
import { Form } from "./FormService";

export default {
    Query: {
      hello: (root: any, { }, ctx: any) => {
        console.log(ctx);
        const { req } = ctx;
        console.log(req?.cookies, req?.headers);
        return "Hello";
      },
      getFormMetadataRecordCreate: async(root: any, {formId}: {formId: string}, ctx:any)=>{
        const form = new Form(formId, ctx.user);
        return form.getFormMetadata();
      }
    },
    Mutation: {

    }
}