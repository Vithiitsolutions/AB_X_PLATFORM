import mongoose from "mongoose";
import mercury from "@mercury-js/core";
interface ActivityDashboardFilter {
  state?: string;
  district?: string;
  constituency?: string;
  startDate?: string;
  endDate?: string;
}
export const getActivityStats = async (filter: ActivityDashboardFilter = {}) => {
  const filteredMatch: Record<string, any> = {};
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
  if (filter.state) filteredMatch.state = new mongoose.Types.ObjectId(filter.state);
  if (filter.district) filteredMatch.district = new mongoose.Types.ObjectId(filter.district);
  if (filter.constituency) filteredMatch.constituency = new mongoose.Types.ObjectId(filter.constituency);
  const createdAgg = await mercury.db.Activity.mongoModel.aggregate([
    { $match: filteredMatch },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        totalSocialActivities: {
          $sum: { $cond: [{ $eq: ["$_id", "SOCIAL"] }, "$count", 0] },
        },
        totalPoliticalActivities: {
          $sum: { $cond: [{ $eq: ["$_id", "POLITICAL"] }, "$count", 0] },
        },
        totalPrivateActivities: {
          $sum: { $cond: [{ $eq: ["$_id", "PRIVATE"] }, "$count", 0] },
        },
      },
    },
    {
      $addFields: {
        totalActivities: {
          $add: ["$totalSocialActivities", "$totalPoliticalActivities", "$totalPrivateActivities"]
        }
      }
    }
  ]);
  const attendMatch: Record<string, any> = {
    action: "Attend",
    ...(filteredMatch.createdOn && { createdOn: filteredMatch.createdOn }),
  };
  const attendAgg = await mercury.db.ActivityAction.mongoModel.aggregate([
    { $match: attendMatch },
    {
      $lookup: {
        from: "activities",
        localField: "activity",
        foreignField: "_id",
        as: "activity",
      },
    },
    { $unwind: "$activity" },
    {
      $match: {
        $expr: {
          $and: Object.entries(filteredMatch).map(([key, val]) => ({
            $eq: [`$activity.${key}`, val],
          })),
        },
      },
    },
    {
      $group: {
        _id: "$activity.type",
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        socialAttendCount: {
          $sum: { $cond: [{ $eq: ["$_id", "SOCIAL"] }, "$count", 0] },
        },
        politicalAttendCount: {
          $sum: { $cond: [{ $eq: ["$_id", "POLITICAL"] }, "$count", 0] },
        }
      },
    },
    {
      $addFields: {
        totalAttendCount: {
          $add: ["$socialAttendCount", "$politicalAttendCount"]
        }
      }
    }
  ]);
  const created = createdAgg[0] || {};
  const attended = attendAgg[0] || {};
  const socialMetricsRate = attended.totalAttendCount > 0
    ? parseFloat(((attended.socialAttendCount / attended.totalAttendCount) * 100).toFixed(2))
    : 0;
  const politicalMetricsRate = attended.totalAttendCount > 0
    ? parseFloat(((attended.politicalAttendCount / attended.totalAttendCount) * 100).toFixed(2))
    : 0;
  return {
    totalActivities: created.totalActivities || 0,
    totalSocialActivities: created.totalSocialActivities || 0,
    totalPoliticalActivities: created.totalPoliticalActivities || 0,
    totalPrivateActivities: created.totalPrivateActivities || 0,
    totalAttendCount: attended.totalAttendCount || 0,
    socialAttendCount: attended.socialAttendCount || 0,
    politicalAttendCount: attended.politicalAttendCount || 0,
    politicalMetricsRate,
    socialMetricsRate,
  };
};
