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

    // retentionRatemetrics: async (
    //   root: any,
    //   {
    //     date,
    //     stateId,
    //     districtId,
    //     constituencyId,
    //   }: {
    //     date?: string;
    //     stateId?: string;
    //     districtId?: string;
    //     constituencyId?: string;
    //   },
    //   ctx: any
    // ) => {
    //   const ctxUser = ctx.user
    //   const [year, month, day] = (date || new Date().toISOString().split("T")[0])
    //     .split("-")
    //     .map(Number);
    //   const inputDate = new Date(Date.UTC(year, month - 1, day));
    //   // const inputDate = date ? new Date(date) : new Date();
    //   console.log(inputDate, "inputDate");
    //   const dateStart = new Date(inputDate.setHours(0, 0, 0, 0));
    //   const dateEnd = new Date(inputDate.setHours(23, 59, 59, 999));
    //   const userFilters: any = {
    //     createdOn: { $lte: dateEnd },
    //   };
    //   if (stateId) userFilters.state = stateId;
    //   if (districtId) userFilters.district = districtId;
    //   if (constituencyId) userFilters.constituency = constituencyId;
    //   console.log(userFilters, "afterrrr");
    //   const users = await mercury.db.User.list(userFilters, {
    //     id: ctxUser.id,
    //     profile: ctxUser.profile,
    //   });
    //   console.log(users.length, "no of users");
    //   const userIds = users.map((u: any) => u.id);
    //   const sessions = await mercury.db.UserScreenTime.list(
    //     {
    //       user: { $in: userIds },
    //       date: { $gte: dateStart }
    //     },
    //     {
    //       id: ctxUser.id,
    //       profile: ctxUser.profile,
    //     }
    //   );
    //   console.log(sessions.length, "no of userloginss");
    //   const retainedUserIds = new Set(sessions.map((s: any) => s.user));
    //   const retainedCount = retainedUserIds.size;
    //   const totalUsers = users.length;
    //   const retentionRate =
    //     totalUsers > 0 ? (retainedCount / totalUsers) * 100 : 0;
    //   return {
    //     date: dateStart.toISOString().split("T")[0],
    //     totalUsers,
    //     retainedUsers: retainedCount,
    //     retentionRate: Math.round(retentionRate * 100) / 100,
    //   };
    // },
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
      console.log("hiii");
      try {
        const ctxUser = ctx.user.id;
        if (deleteType === "myTeam") {
          const teamRequest: any = await mercury.db.TeamRequest.get(
            { sender: leaderId, receiver: userId },
            { id: "1", profile: "SystemAdmin" }
          );
          console.log(teamRequest, "TeamRequest");
          if (teamRequest) {
            await mercury.db.BuildTeam.mongoModel.findOneAndUpdate(
              { leader: new ObjectId(teamRequest.sender) },
              { $pull: { team: teamRequest.receiver } },
              { id: "1", profile: "SystemAdmin" }
            );
            await mercury.db.BuildTeam.mongoModel.findOneAndUpdate(
              { leader: new ObjectId(teamRequest.receiver) },
              { $pull: { associatedTo: teamRequest.sender } },
              { id: "1", profile: "SystemAdmin" }
            );
           await mercury.db.TeamRequest.delete(
              { _id: teamRequest._id },
              { id: "1", profile: "SystemAdmin" }
            );
          }
        } else if (deleteType === "associatedTo") {
          const teamRequest: any = await mercury.db.TeamRequest.get(
            { receiver: leaderId, sender: userId },
            {id: "1", profile: "SystemAdmin"}
          );
          console.log(teamRequest, "associteaedTR");

          if (teamRequest) {
            await mercury.db.BuildTeam.mongoModel.findOneAndUpdate(
              { leader: teamRequest.receiver },
              { $pull: { associatedTo: teamRequest.sender } },
              { id: "1", profile: "SystemAdmin" } // Removes receiverId from team array
            );
            await mercury.db.BuildTeam.mongoModel.findOneAndUpdate(
              { leader: teamRequest.sender },
              { $pull: { team: teamRequest.receiver } },
              { id: "1", profile: "SystemAdmin" }
            );
            await mercury.db.TeamRequest.delete(
              { _id: teamRequest._id },
              { id: "1", profile: "SystemAdmin" }
            );
          }
        }
        return { message: "User removed from team successfully", user: userId };
      } catch (error: any) {
        throw new Error(`Failed to remove user: ${error.message}`);
      }
    },

    // recordUserLoginSession: async (
    //   root: any,
    //   { startTime, endTime }: { startTime: string; endTime: string },
    //   ctx: any
    // ) => {
    //   if (!ctx.connect || !ctx.connect.user) {
    //     throw new Error("User not authenticated.");
    //   }
    //   const ctxUser = ctx.user;
    //   console.log(ctxUser, "hgfdf");

    //   const date = new Date(startTime || Date.now());
    //   const year = date.getUTCFullYear();
    //   const month = date.getUTCMonth();
    //   const day = date.getUTCDate();
    //   const isSameDay = (d: Date) =>
    //     d.getUTCFullYear() === year &&
    //     d.getUTCMonth() === month &&
    //     d.getUTCDate() === day;
    //   let loginSession = await mercury.db.LoginSession.mongoModel.findOne({
    //     user: ctxUser.id,
    //     startTime: new Date(startTime),
    //   });
    //   if (loginSession) {
    //     if (!loginSession.endTime && endTime) {
    //       loginSession = await mercury.db.LoginSession.update(
    //         loginSession.id,
    //         { endTime: new Date(endTime) },
    //         { id: ctxUser.id, profile: ctxUser.profile }
    //       );
    //     }
    //     const userScreen = await mercury.db.UserScreenTime.mongoModel.findOne({ user: ctxUser.id });
    //     if (userScreen && isSameDay(new Date(userScreen.date))) {
    //       if (!userScreen.logins.includes(loginSession.id)) {
    //         await mercury.db.UserScreenTime.mongoModel.updateOne(
    //           { _id: userScreen._id },
    //           { $addToSet: { logins: loginSession._id } }
    //         );
    //       }
    //     }
    //     return {
    //       message: loginSession.endTime ? "Session updated with endTime." : "Session already exists.",
    //       session: loginSession,
    //     };
    //   }
    //   const latestActiveSession = await mercury.db.LoginSession.mongoModel.findOne({
    //     user: ctxUser.id,
    //     endTime: null,
    //   });
    //   if (latestActiveSession) {
    //     throw new Error("User already has an active login session.");
    //   }
    //   let todayScreenTime = await mercury.db.UserScreenTime.mongoModel.findOne({ user: ctxUser.id });
    //   if (!todayScreenTime || !isSameDay(new Date(todayScreenTime.date))) {
    //     todayScreenTime = await mercury.db.UserScreenTime.create(
    //       {
    //         user: ctxUser.id,
    //         date,
    //         logins: [],
    //       },
    //       { id: ctxUser.id, profile: ctxUser.profile }
    //     );
    //   }
    //   loginSession = await mercury.db.LoginSession.create(
    //     {
    //       user: ctxUser.id,
    //       startTime: new Date(startTime),
    //       endTime: endTime ? new Date(endTime) : undefined,
    //     },
    //     { id: ctxUser.id, profile: ctxUser.profile }
    //   );
    //   await mercury.db.UserScreenTime.mongoModel.updateOne(
    //     { _id: todayScreenTime._id },
    //     { $addToSet: { logins: loginSession._id } }
    //   );
    //   return { message: "New login session created.", session: loginSession };
    // }
  },
};
