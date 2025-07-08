import mercury from "@mercury-js/core";
import { GraphQLError } from "graphql";
import { Form } from "./FormService";
import { sign } from "node:crypto";
import _ from "lodash";
import jwt from "jsonwebtoken";
import { getSurveyStats } from "../aggeregation/surveyReports";
export default {
  Query: {
    signIn: async (
      _root: unknown,
      { value, password, validateBy }: { value: string; password: string, validateBy: string },
      _ctx: unknown
    ) => {
      const user: any = await mercury.db.User.get(
        {
          [validateBy]: value,
        },
        {
          id: "1",
          profile: "SystemAdmin",
        }
      );
      
      if (_.isEmpty(user)) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        throw new GraphQLError("Invalid password", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }
      const expiresIn: string | number = process.env.JWT_EXPIRATION || "1d";
      const token = await jwt.sign(
        {
          id: user._id,
          profile: user.role,
        },
        process.env.JWT_SECRET || 'default-secret-key',
        {
          algorithm: "HS256",
          expiresIn: "1d"
        }
      );
      return {token, user};
    },
    me: async (_root: unknown, _args: unknown, ctx: any) => {
      const user = await mercury.db.User.get(
        { _id: ctx.user.id },
        {
          id: ctx.user.id,
          profile: ctx.user.profile,
        }
      );
      if (!user) {
        throw new GraphQLError("User not found", {
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

    getSurveyStats :async (_:any, args:{filter?:any},context:any)=>{
  try {
    const result = await getSurveyStats(args.filter|| {});
    return result
  }catch(error:any){
    console.log("Graphql Resolver Error :",Error)
    throw new GraphQLError(error.message || "Failed to fetch activity summary")
  }
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
