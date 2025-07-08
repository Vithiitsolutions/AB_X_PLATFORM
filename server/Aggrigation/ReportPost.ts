import mercury from "@mercury-js/core";
import mongoose from "mongoose";

export const getPostReportsSummary = async (filter = {}) => {
  try {
    const { stateId, districtId, constituencyId, startDate, endDate }: any = filter;

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    console.log("Date Filter:", dateFilter);

    const locationFilter: any = {};
    if (stateId) locationFilter.state = new mongoose.Types.ObjectId(stateId);
    if (districtId) locationFilter.district = new mongoose.Types.ObjectId(districtId);
    if (constituencyId) locationFilter.constituency = new mongoose.Types.ObjectId(constituencyId);

    console.log("Location Filter:", locationFilter);

    const matchStage: any = { action: "Report" };
    if (Object.keys(dateFilter).length) matchStage.createdOn = dateFilter;

    console.log("matchStage:", matchStage);

    const [publicUsers, leaderUsers] = await Promise.all([
      mercury.db.User.mongoModel.get({ role: "PUBLIC" }, { _id: 1 }).lean(),
      mercury.db.User.mongoModel.get({ role: "LEADER" }, { _id: 1 }).lean(),
    ]);

    const publicUserIds = publicUsers.map((u: any) => u._id);
    const leaderUserIds = leaderUsers.map((u: any) => u._id);

    console.log("PUBLIC User IDs:", publicUserIds.length);
    console.log("LEADER User IDs:", leaderUserIds.length);

    const postLookups = [
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "postDetails",
        },
      },
      { $unwind: "$postDetails" },
      {
        $lookup: {
          from: "states",
          localField: "postDetails.state",
          foreignField: "_id",
          as: "stateDetails",
        },
      },
      { $unwind: "$stateDetails" },
      {
        $lookup: {
          from: "districts",
          localField: "postDetails.district",
          foreignField: "_id",
          as: "districtDetails",
        },
      },
      { $unwind: "$districtDetails" },
      {
        $lookup: {
          from: "constituencies",
          localField: "postDetails.constituency",
          foreignField: "_id",
          as: "constituencyDetails",
        },
      },
      { $unwind: "$constituencyDetails" },
    ];

    const listProject = (extraFields = {}) => ({
      $project: {
        _id: 1,
        user: 1,
        createdOn: 1,
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdOn" } },
        state: "$stateDetails.name",
        district: "$districtDetails.name",
        constituency: "$constituencyDetails.name",
        ...extraFields,
      },
    });

    const safeChange = (curr: number, prev: number) => {
      if (prev === 0) return curr === 0 ? 0 : 100;
      const result = ((curr - prev) / prev) * 100;
      return +result.toFixed(2);
    };

    const getCountWithChange = async (userIds?: any[]) => {
      const currentMatch = {
        ...matchStage,
        ...(userIds ? { user: { $in: userIds } } : {}),
      };

      const previousMatch = {
        ...currentMatch,
        createdOn: {},
      };

      if (startDate && endDate) {
        const currentStart = new Date(startDate);
        const currentEnd = new Date(endDate);
        const diff = currentEnd.getTime() - currentStart.getTime();

        previousMatch.createdOn = {
          $gte: new Date(currentStart.getTime() - diff - 1),
          $lte: new Date(currentStart.getTime() - 1),
        };
      }

      console.log("currentMatch:", currentMatch);
      console.log("previousMatch:", previousMatch);

      const [currentAgg, previousAgg] = await Promise.all([
        mercury.db.PostAction.mongoModel.aggregate([
          { $match: currentMatch },
          ...postLookups,
          { $count: "count" },
        ]),
        mercury.db.PostAction.mongoModel.aggregate([
          { $match: previousMatch },
          ...postLookups,
          { $count: "count" },
        ]),
      ]);

      const current = currentAgg[0]?.count || 0;
      const previous = previousAgg[0]?.count || 0;

      console.log("current:", current, " | previous:", previous);

      return {
        count: current,
        percentageChange: safeChange(current, previous),
      };
    };

    const getReportList = async (userIds: any[]) => {
      const list = await mercury.db.PostAction.mongoModel.aggregate([
        {
          $match: {
            ...matchStage,
            user: { $in: userIds },
          },
        },
        ...postLookups,
        listProject({
          postId: "$postDetails._id",
          postTitle: "$postDetails.title",
        }),
      ]);
      console.log("List length for", userIds.length, "users:", list.length);
      return list;
    };

    const [
      totalReports,
      reportsByCategory,
      commonManFeedback,
      leaderFeedback,
      commonManFeedbackList,
      leaderFeedbackList,
    ] = await Promise.all([
      getCountWithChange(),
      getCountWithChange(),
      getCountWithChange(publicUserIds),
      getCountWithChange(leaderUserIds),
      getReportList(publicUserIds),
      getReportList(leaderUserIds),
    ]);

    console.log("Final Summary:");
    console.log({
      totalReports,
      reportsByCategory,
      commonManFeedback,
      leaderFeedback,
    });

    return {
      reportSummary: {
        totalReports,
        reportsByCategory,
        commonManFeedback,
        leaderFeedback,
      },
      commonManFeedbackList,
      leaderFeedbackList,
    };
  } catch (error) {
    console.error("Error in getPostReportsSummary:", error);
    throw error;
  }
};
