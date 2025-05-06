import mercury from "@mercury-js/core";
import { GraphQLError } from "graphql";
import { Form } from "./FormService";
import { sign } from "node:crypto";

export default {
  Query: {
    signIn: async (
      _root: unknown,
      { username, password }: { username: string; password: string },
      _ctx: unknown
    ) => {
      const user: any = await mercury.db.User.get(
        {
          email: username,
        },
        {
          id: "1",
          profile: "SystemAdmin",
        }
      );
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }
      if (!user.verifyPassword(password)) {
        throw new GraphQLError("Invalid password", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }
      return user;
    },
    getFormMetadataRecordCreate: async (
      root: any,
      { formId }: { formId: string },
      ctx: any
    ) => {
      const form = new Form(formId, ctx.user);
      return form.getFormMetadata();
    },
  },
  Mutation: {
    createRecordsUsingForm: async (
      root: any,
      { formId, formData }: { formId: string; formData: any },
      ctx: any
    ) => {
      const form = new Form(formId, ctx.user);
      const response = await form.createRecordsUsingForm(formData);
      return response;
    },
  },
};
