import mongoose from "mongoose";
import mercury from "@mercury-js/core";

export const getMonthlyApplicationStats = async (
  filter: { leaderId?: string; year?: string } = {}
) => {
  const toObjectId = (id?: string) =>
    id ? new mongoose.Types.ObjectId(id) : undefined;
  const now = new Date();
  const selectedYear = filter.year ? parseInt(filter.year) : now.getFullYear();
  const startOfYear = new Date(`${selectedYear}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${selectedYear}-12-31T23:59:59.999Z`);
  const matchFilter: Record<string, any> = {
    createdOn: { $gte: startOfYear, $lte: endOfYear },
    ...(filter.leaderId && { leader: toObjectId(filter.leaderId) }),
  };
  const pipeline = [
    { $match: matchFilter },
    {
      $group: {
        _id: { $month: "$createdOn" },
        total: { $sum: 1 },
        acceptedCount: {
          $sum: { $cond: [{ $eq: ["$status", "ACCEPTED"] }, 1, 0] },
        },
        resolvedCount: {
          $sum: { $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0] },
        },
        rejectedCount: {
          $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        month: "$_id",
        count: "$total",
        acceptedCount: 1,
        resolvedCount: 1,
        rejectedCount: 1,
        _id: 0,
      },
    },
    { $sort: { month: 1 } },
  ];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  try {
    const result = await mercury.db.Application.mongoModel
      .aggregate(pipeline)
      .exec();
    const monthlyCounts = Array.from({ length: 12 }, (_, i) => {
      const monthData = result.find((r) => r.month === i + 1);
      return {
        month: monthNames[i],
        count: monthData?.count || 0,
        acceptedCount: monthData?.acceptedCount || 0,
        resolvedCount: monthData?.resolvedCount || 0,
        rejectedCount: monthData?.rejectedCount || 0,
      };
    });

    return {
      year: selectedYear,
      monthlyCounts,
    };
  } catch (err) {
    console.error("Aggregation Error:", err);
    throw new Error("Failed to fetch monthly application stats");
  }
};
