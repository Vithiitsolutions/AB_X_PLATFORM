import mercury from "@mercury-js/core";
import mongoose from "mongoose";
interface ApplicationStatsFilter {
  state?: string;
  district?: string;
  constituency?: string;
  leaderId?: string;
  positionStatusId?: string;
  startDate?: string;
  endDate?: string;
}
export const getUrgeApplicationStats = async (
  filter: ApplicationStatsFilter = {}
) => {
  const toObjectId = (id?: string) =>
    id ? new mongoose.Types.ObjectId(id) : undefined;
  const filteredMatch: Record<string, any> = {
    ...(filter.leaderId && { leader: toObjectId(filter.leaderId) }),
  };
  if (filter.startDate || filter.endDate) {
    const dateRange: Record<string, any> = {};
    if (filter.startDate) {
      const start = new Date(filter.startDate);
      start.setHours(0, 0, 0, 0);
      dateRange.$gte = start;
    }
    if (filter.endDate) {
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      dateRange.$lte = end;
    }
    filteredMatch.createdOn = dateRange;
  }
  const locationMatch: Record<string, any> = {
    ...(filter.state && { "user.state": toObjectId(filter.state) }),
    ...(filter.district && { "user.district": toObjectId(filter.district) }),
    ...(filter.constituency && {
      "user.constituency": toObjectId(filter.constituency),
    }),
  };
  const pipeline = [
    { $match: filteredMatch },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: locationMatch },
    {
      $lookup: {
        from: "userattributes",
        localField: "user._id",
        foreignField: "user",
        as: "attribute",
      },
    },
    {
      $unwind: {
        path: "$attribute",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $facet: {
        statusCounts: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              acceptedCount: {
                $sum: { $cond: [{ $eq: ["$_id", "ACCEPTED"] }, "$count", 0] },
              },
              resolvedCount: {
                $sum: { $cond: [{ $eq: ["$_id", "RESOLVED"] }, "$count", 0] },
              },
              rejectedCount: {
                $sum: { $cond: [{ $eq: ["$_id", "REJECTED"] }, "$count", 0] },
              },
            },
          },
        ],
        positionStatusCount: filter.positionStatusId
          ? [
              {
                $match: {
                  "attribute.positionStatus": toObjectId(
                    filter.positionStatusId
                  ),
                },
              },
              { $count: "count" },
            ]
          : [{ $match: { _id: null } }, { $count: "count" }],
      },
    },
  ];
  try {
    const [result] = await mercury.db.Application.mongoModel
      .aggregate(pipeline)
      .exec();
    const counts = result.statusCounts?.[0] || {};
    const positionStatusCount = result.positionStatusCount?.[0]?.count || 0;
    const acceptedCount = counts.acceptedCount || 0;
    const resolvedCount = counts.resolvedCount || 0;
    const rejectedCount = counts.rejectedCount || 0;
    const totalApplications = acceptedCount + resolvedCount + rejectedCount;
    return {
      totalApplications,
      acceptedCount,
      resolvedCount,
      rejectedCount,
      positionStatusCount,
    };
  } catch (err) {
    console.error("Aggregation Error:", err);
    throw new Error("Failed to fetch application stats");
  }
};
