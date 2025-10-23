import mercury from "@mercury-js/core";
import { GraphQLError } from "graphql";
import { Form } from "./FormService";
import _ from "lodash";
import jwt from "jsonwebtoken";
import {
  getActiveUserCountWithRoles,
  getUserAnalytics,
  getUserLoginDurationByDate,
} from "../Analytics/UserAuth";
import { getManifestoSurveyStats } from "../Analytics/ManifestoSurvey";
import { getPostStats } from "../Analytics/Post";
import { getActivityStats } from "../Analytics/Activity";
import { getLeaderStats } from "../Analytics/Leader";
import {
  getApplicationDetails,
  getMonthlyApplicationStats,
} from "../Analytics/UrgeRequest";
import { getNewsPostTrends } from "../Analytics/News";
import { getReportedPostCount } from "../Analytics/PostReports";
import { supportTrendstats } from "../Analytics/SupportTicket";
import { CategoryStatsCount } from "../Analytics/NewsReports";
import { listLeaders } from "../Analytics/ListLeaders";
import { SurveyQuery } from "../masterApis/Survey";
import mongoose, { Types } from "mongoose";
import { getManifestoDetails } from "../Analytics/Manifesto";
import { getUserPoliticalPartyHistory } from "../masterApis/trackPartyPositionChanges";
import { ObjectId } from "mongodb";
import * as nodemailer from "nodemailer"; // <-- Import nodemailer
export default {
  Query: {
    signIn: async (
      _root: unknown,
      {
        value,
        password,
        validateBy,
      }: { value: string; password: string; validateBy: string },
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
        process.env.JWT_SECRET || "default-secret-key",
        {
          algorithm: "HS256",
          expiresIn: "1d",
        }
      );
      return { token, user };
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
    getUserAnalytics: async (
      root: any,
      { input }: { input: any },
      ctx: any
    ) => {
      const {
        date,
        startDate,
        endDate,
        stateId,
        districtId,
        constituencyId,
        year,
      } = input || {};

      return await getUserAnalytics({
        date,
        startDate,
        endDate,
        stateId,
        districtId,
        constituencyId,
        year,
      });
    },
    getManifestoSurveyStats: async (
      _: any,
      args: { filter?: any },
      context: any
    ) => {
      try {
        const postInfo = await getManifestoSurveyStats(args.filter);
        return postInfo;
      } catch (error: any) {
        console.error("Error in resolver getpostInfo:", error);
        throw new GraphQLError(error.message || "Failed to fetch post info.");
      }
    },
    getPostStats: async (_: any, args: { filter?: any }, context: any) => {
      try {
        const stats = await getPostStats(args.filter || {});
        return stats;
      } catch (error: any) {
        console.error("Error in resolver getSupportAndResolvedStats:", error);
        throw new GraphQLError(
          error.message || "Failed to fetch support and resolved stats."
        );
      }
    },
    getActivityStats: async (_: any, args: { filter?: any }, context: any) => {
      try {
        const stats = await getActivityStats(args.filter || {});
        return stats;
      } catch (error: any) {
        console.error("Error in resolver getActivityDashboardStats:", error);
        throw new GraphQLError(
          error.message || "Failed to fetch activity dashboard stats."
        );
      }
    },
    getLeaderStats: async (_: any, args: { filter?: any }, context: any) => {
      try {
        const stats = await getLeaderStats(args.filter || {});
        return stats;
      } catch (error: any) {
        console.error("Error in resolver getLeaderStats:", error);
        throw new GraphQLError(
          error.message || "Failed to fetch leader stats."
        );
      }
    },
    getUrgeApplicationStats: async (
      _: any,
      args: { filter: any },
      context: any
    ) => {
      try {
        const result = await getMonthlyApplicationStats(args.filter || {});
        return result;
      } catch (error: any) {
        console.log("Graphql Resolver Error :", Error);
        throw new GraphQLError(
          error.message || "Failed to fetch activity summary"
        );
      }
    },
    // getUserScreenDuration: async (root: any, { input }: { input: any }, ctx: any) => {
    //   const ctxUser = ctx.user;
    //   const data = await getUserLoginDurationByDate(ctxUser.id, input.date);
    //   return data;
    // },
    getActiveUsersCount: async (
      root: any,
      {
        startDate,
        endDate,
        year,
      }: { startDate: string; endDate: string; year: number },
      ctx: any
    ) => {
      console.log(startDate, endDate);
      const data = await getActiveUserCountWithRoles({
        startDate,
        endDate,
        year,
      });
      return data;
    },
    getNewsPostTrends: async (_: any, args: { filter?: any }, ctx: any) => {
      return await getNewsPostTrends(args.filter || {});
    },
    getReportedPostCount: async (
      root: any,
      args: { filter?: any },
      ctx: any
    ) => {
      try {
        const stats = await getReportedPostCount(args.filter || {});
        return stats;
      } catch (error: any) {
        console.error("Error in resolver getSupportAndResolvedStats:", error);
        throw new GraphQLError(
          error.message || "Failed to fetch support and resolved stats."
        );
      }
    },
    supportTrendstats: async (root: any, args: { filter?: any }, ctx: any) => {
      try {
        const stats = await supportTrendstats(args.filter || {});
        return stats;
      } catch (error: any) {
        console.error("Error in resolver getSupportAndResolvedStats:", error);
        throw new GraphQLError(
          error.message || "Failed to fetch support and resolved stats."
        );
      }
    },
    CategoryStatsCount: async (root: any, args: { filter?: any }, ctx: any) => {
      try {
        const stats = await CategoryStatsCount(args.filter || {});
        return stats;
      } catch (error: any) {
        console.error("Error in CategoryStatsCount resolver:", error);
        throw new GraphQLError(
          error.message || "Failed to fetch category stats"
        );
      }
    },
    getLeaderProfile: async (
      root: any,
      { userId }: { userId: string },
      ctx: any
    ) => {
      try {
        const IssueData = mercury.db.Post;
        const CommunityActivityData = mercury.db.Activity;
        const userAttributes = mercury.db.UserAttribute;
        const userData: any = await mercury.db.User.get(
          { _id: userId },
          { id: "1", profile: "SystemAdmin" },
          { populate: [{ path: "profilePic" }, { path: "constituency" }] }
        );
        const userAttribute: any = await userAttributes.get(
          { user: userData._id },
          { id: "1", profile: "SystemAdmin" },
          {
            populate: [
              {
                path: "politicalParty",
                populate: [{ path: "banner" }, { path: "logo" }],
              },
              { path: "positionName" },
              { path: "positionStatus" },
            ],
          }
        );
        const leaderTeam: any = await mercury.db.BuildTeam.get(
          { leader: userId },
          { id: "1", profile: "SystemAdmin" }
        );
        const solvedIssuesPromise: any = IssueData.mongoModel.aggregate([
          {
            $match: {
              resolvedBy: new mongoose.Types.ObjectId(userId),
              status: "Resolved",
            },
          },
          { $count: "solvedIssues" },
        ]);
        const communityActivitiesPromise =
          CommunityActivityData.mongoModel.aggregate([
            {
              $match: {
                owner: new mongoose.Types.ObjectId(userId),
                type: { $in: ["SOCIAL", "POLITICAL"] },
              },
            },
            { $count: "communityActivities" },
          ]);
        const [solvedIssues, communityActivities] = await Promise.all([
          solvedIssuesPromise,
          communityActivitiesPromise,
        ]);
        return {
          members: leaderTeam?.team?.length || 0,
          id: userData?._id,
          email: userData?.email,
          name: userData?.name,
          profile: userData?.profilePic?.location || "",
          contactNumber: userData?.mobile,
          location: userData?.constituency?.name,
          solvedIssues:
            solvedIssues.length > 0 ? solvedIssues[0].solvedIssues : 0,
          communityActivities:
            communityActivities.length > 0
              ? communityActivities[0].communityActivities
              : 0,
          politicalParty: {
            name: userAttribute?.politicalParty?.name || "No Party",
            banner:
              userAttribute?.politicalParty?.banner?.location ||
              `https://assets.mercuryx.cloud/sandbox/signed/52d067fb-11b2-44e5-88a9-93205d700690`,
            logo:
              userAttribute?.politicalParty?.logo?.location ||
              `https://assets.mercuryx.cloud/sandbox/signed/52d067fb-11b2-44e5-88a9-93205d700690`,
          },
          positionName:
            userAttribute?.positionName?.value || "No Position Name",
          positionStatus:
            userAttribute?.positionStatus?.value || "No Position Status",
        };
      } catch (error: any) {
        throw new Error(`Failed to fetch leader profile: ${error.message}`);
      }
    },
    getManifestoDetails: async (
      _: any,
      { input }: { input: any },
      ctx: any
    ) => {
      try {
        const manifesto = await getManifestoDetails(input.manifestoId);
        return manifesto;
      } catch (error) {
        console.error("Error in getManifestoDetails resolver:", error);
        throw new Error("Failed to fetch manifesto details.");
      }
    },
    getApplicationDetails: async (
      root: any,
      { applicationId }: { applicationId: string },
      ctx: any
    ) => {
      try {
        const application = await getApplicationDetails(applicationId);
        return application;
      } catch (error) {
        console.error("GraphQL Resolver Error:", error);
        throw new Error("Failed to fetch application details.");
      }
    },
    getSurveyCounts: async (root: any, {}, ctx: any) => {
      try {
        const totalSurveysByMonth =
          await mercury.db.Survey.mongoModel.aggregate([
            {
              $match: {
                createdAt: { $ne: null }, // Exclude documents where createdAt is null
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]);
        // Aggregation pipeline to get monthly response counts
        const responsesByMonth =
          await mercury.db.SurveyResponse.mongoModel.aggregate([
            {
              $lookup: {
                from: "surveys",
                localField: "survey",
                foreignField: "_id",
                as: "surveyDetails",
              },
            },
            { $unwind: "$surveyDetails" },
            {
              $match: {
                "surveyDetails.createdAt": { $ne: null }, // Exclude documents where the linked survey's createdAt is null
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m",
                    date: "$surveyDetails.createdAt",
                  },
                },
                count: { $addToSet: "$survey" },
              },
            },
            {
              $project: {
                _id: 1,
                count: { $size: "$count" },
              },
            },
            { $sort: { _id: 1 } },
          ]); // Combine the results into a single, clean format
        const monthlyData: any = {};

        // Populate monthlyData with total survey counts
        totalSurveysByMonth.forEach(
          (item: { _id: string | number; count: any }) => {
            monthlyData[item._id] = {
              totalSurveys: item.count,
              surveysWithResponses: 0, // Initialize to 0
            };
          }
        );

        // Add response counts to the correct months
        responsesByMonth.forEach(
          (item: { _id: string | number; count: any }) => {
            if (monthlyData[item._id]) {
              monthlyData[item._id].surveysWithResponses = item.count;
            }
          }
        );

        // Convert the object to an array for a cleaner API response
        const result = Object.keys(monthlyData).map((month) => ({
          month,
          ...monthlyData[month],
        }));

        console.log("Monthly Survey and Response Counts:", result);
        return result;
      } catch (error) {
        console.error("Error getting monthly survey counts:", error);
        throw error;
      }
    },
    listLeaders: async (
      root: any,
      {
        filter,
      }: {
        filter?: { state?: string; district?: string; constituency?: string };
      },
      ctx: any
    ) => {
      return await listLeaders(filter);
    },
    trackPoliticalPartyChanges: async (
      root: any,
      { userId }: { userId: string },
      ctx: any
    ) => {
      return await getUserPoliticalPartyHistory(userId);
    },

    ...SurveyQuery,
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
    removeUserFromTeam: async (
      root: any,
      {
        leaderId,
        userId,
        deleteType,
      }: { leaderId: string; userId: string; deleteType: string },
      ctx: any
    ) => {
      try {
        if (deleteType === "myTeam") {
          const teamRequest: any = await mercury.db.TeamRequest.get(
            { sender: leaderId, receiver: userId },
            { id: "1", profile: "SystemAdmin" }
          );
          // FIX 2: Explicitly check for teamRequest and its primary key
          if (teamRequest && teamRequest._id) {
            console.log(teamRequest, "TeamRequest found for myTeam");

            // Use teamRequest properties safely
            const senderId = new ObjectId(teamRequest.sender);
            const receiverId = new ObjectId(teamRequest.receiver);

            // 1. Remove receiver (userId) from the leader's (sender's) 'team' array
            await mercury.db.BuildTeam.mongoModel.findOneAndUpdate(
              { leader: senderId }, // Query by leader (sender) ID
              { $pull: { team: receiverId } },
              // Use a valid options object for Mongoose update
              { new: true, runValidators: true }
            );

            // 2. Remove sender (leaderId) from the user's (receiver's) 'associatedTo' array
            await mercury.db.BuildTeam.mongoModel.findOneAndUpdate(
              { leader: receiverId }, // Query by leader (receiver) ID
              { $pull: { associatedTo: senderId } },
              { new: true, runValidators: true }
            );

            // 3. Delete the TeamRequest document
            await mercury.db.TeamRequest.delete(
              { _id: teamRequest._id },
              { id: "1", profile: "SystemAdmin" }
            );
          } else {
            console.log(
              "TeamRequest not found for myTeam, skipping deletions."
            );
          }
        } else if (deleteType === "associatedTo") {
          const teamRequest: any = await mercury.db.TeamRequest.get(
            { receiver: leaderId, sender: userId },
            { id: "1", profile: "SystemAdmin" }
          );

          // FIX 2: Explicitly check for teamRequest and its primary key
          if (teamRequest && teamRequest._id) {
            console.log(teamRequest, "TeamRequest found for associatedTo");

            // Ensure IDs are ObjectIds for MongoDB operations
            const senderId = new ObjectId(teamRequest.sender);
            const receiverId = new ObjectId(teamRequest.receiver);

            // 1. Remove sender (userId) from the leader's (receiver's) 'associatedTo' array
            await mercury.db.BuildTeam.mongoModel.findOneAndUpdate(
              { leader: receiverId }, // Query by leader (receiver) ID
              { $pull: { associatedTo: senderId } },
              { new: true, runValidators: true }
            );

            // 2. Remove receiver (leaderId) from the user's (sender's) 'team' array
            await mercury.db.BuildTeam.mongoModel.findOneAndUpdate(
              { leader: senderId }, // Query by leader (sender) ID
              { $pull: { team: receiverId } },
              { new: true, runValidators: true }
            );

            // 3. Delete the TeamRequest document
            await mercury.db.TeamRequest.delete(
              { _id: teamRequest._id },
              { id: "1", profile: "SystemAdmin" }
            );
          } else {
            console.log(
              "TeamRequest not found for associatedTo, skipping deletions."
            );
          }
        }
        return { message: "User removal process complete", user: userId };
      } catch (error: any) {
        console.error("Error in removeUserFromTeam:", error);
        throw new Error(`Failed to remove user: An unexpected error occurred.`);
      }
    },
    forgotPassword: async (
      _root: unknown,
      { input }: { input: any },
      _ctx: unknown
    ) => {
      console.log("Forgot password request for:", input.email);

      try {
        // Step 1: Find user
        const user: any = await mercury.db.User.get(
          { email: input.email },
          {
            id: "1",
            profile: "SystemAdmin",
          }
        );

        // Step 2: If user not found, stop and return error
        if (_.isEmpty(user)) {
          console.warn(`No user found with email: ${input.email}`);
          throw new GraphQLError("User not found", {
            extensions: { code: "USER_NOT_FOUND" },
          });
        }

        // Step 3: Generate JWT token
        const resetToken = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            type: "password_reset",
          },
          process.env.JWT_SECRET || "default-secret-key",
          {
            algorithm: "HS256",
            expiresIn: "1h",
          }
        );
        await mercury.db.User.update(
          user._id,
          { token: resetToken }, // 1 hour expiry
          {
            id: "1",
            profile: "SystemAdmin",
          }
        );
        // Step 4: Send reset email (only if user exists)
        try {
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.EMAIL_USER || "shashanksonwane305@gmail.com",
              pass: process.env.EMAIL_PASS || "jfhucooflemoxuya",
            },
          });

          const resetLink = `https://admin-dev.ableader.com/page/change-password?token=${resetToken}`;

          const mailOptions = {
            from: "shashanksonwane305@gmail.com",
            to: user.email,
            subject: "Password Reset Request - Vithi IT Solutions",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #4CAF50;
              color: white !important;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background-color: #45a049;
            }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { color: #ff6b6b; font-weight: bold; margin: 15px 0; }
            .link-box {
              word-break: break-all;
              background-color: #fff;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 3px;
              font-size: 13px;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${user.name || "User"}</strong>,</p>
              <p>We received a request to reset your password .</p>
              <p>Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              <p>Or click on the  link :</p>
              <div class="link-box">
                ${resetLink}
              </div>
              <p class="warning">⚠️ This link will expire in 1 hour.</p>
              <p style="margin-top: 20px;">If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.</p>
              <p style="margin-top: 20px;">Best regards,<br><strong>Vithi IT Solutions Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p style="margin-top: 5px;">© ${new Date().getFullYear()} Vithi IT Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
          };

          await transporter.sendMail(mailOptions);
          console.log(`✅ Reset email sent to ${user.email}`);
        } catch (emailError) {
          console.error("Error sending password reset email:", emailError);
          throw new GraphQLError("Failed to send password reset email", {
            extensions: { code: "EMAIL_SEND_FAILED" },
          });
        }

        // Step 5: Return success response
        return {
          success: true,
          message: "Password reset link has been sent to your email address.",
        };
      } catch (error: any) {
        console.error("Error in forgotPassword:", error);

        // Known error types
        if (error instanceof GraphQLError) throw error;

        // Fallback error
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    changePassword: async (
      root: any,
      {
        token,
        newPassword,
        confirmPassword,
      }: { token: string; newPassword: string; confirmPassword: string },
      ctx: any
    ) => {
      try {
        const decoded: any = jwt.verify(
          token,
          process.env.JWT_SECRET || "default-secret-key"
        );
        const user: any = await mercury.db.User.get(
          { _id: decoded.userId, token: token },
          { id: "1", profile: "SystemAdmin" }
        );

        if (!user || !user.token) {
          throw new GraphQLError("Invalid or expired token", {
            extensions: { code: "INVALID_TOKEN" },
          });
        }
        if (Date.now() > user.token) {
          throw new GraphQLError("Reset token has expired", {
            extensions: { code: "TOKEN_EXPIRED" },
          });
        }
        if (newPassword !== confirmPassword) {
          throw new GraphQLError("Passwords do not match", {
            extensions: { code: "PASSWORD_MISMATCH" },
          });
        }
        await mercury.db.User.update(
          user._id,
          {
            password: newPassword,
            token: null,
          },
          { id: "1", profile: "SystemAdmin" }
        );
        return {
          success: true,
          message: "Password has been successfully updated.",
        };
      } catch (err: any) {
        console.error("Error in changePassword:", err);
        throw new GraphQLError(err.message || "Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    resetPassword: async (
      root: any,
      {
        email,
        oldPassword,
        newPassword,
      }: {
        email: string; // required for both cases
        oldPassword?: string; // required only for self-service
        newPassword: string;
      },
      ctx: any
    ) => {
      try {
        if (!email) {
          throw new GraphQLError("Email is required", {
            extensions: { code: "EMAIL_REQUIRED" },
          });
        }

        // 1️⃣ Fetch the target user by email
        const targetUser: any = await mercury.db.User.get(
          { email },
          {
            id: "1",
            profile: "SystemAdmin",
          }
        );

        if (!targetUser) {
          throw new GraphQLError("User not found", {
            extensions: { code: "USER_NOT_FOUND" },
          });
        }

        // 2️⃣ If oldPassword is provided → self-service password reset
        if (oldPassword) {
          const isOldPasswordCorrect = await targetUser.verifyPassword(
            oldPassword
          );
          if (!isOldPasswordCorrect) {
            throw new GraphQLError("Old password is incorrect", {
              extensions: { code: "INVALID_OLD_PASSWORD" },
            });
          }
        }

        // 3️⃣ Update password (Mercury will hash automatically)
        await mercury.db.User.update(
          targetUser._id,
          { password: newPassword },
          { id: "1", profile: "SystemAdmin" }
        );

        return {
          success: true,
          message: oldPassword
            ? "Your password has been successfully updated."
            : `Password reset successfully for ${targetUser.email}`,
        };
      } catch (err: any) {
        console.error("Error in resetPassword:", err);
        throw new GraphQLError(err.message || "Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
