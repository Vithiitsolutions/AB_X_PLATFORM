import mongoose from "mongoose";
import mercury from "@mercury-js/core";
interface AboutPostCountFilter {
  year?: number;
  startDate?: string;
  endDate?: string;
}

export interface MonthlyRolePostStats {
  month: string;
  totalPosts: number;
  leaderPosts: number;
  publicPosts: number;
}

export type AboutPostCountResult = MonthlyRolePostStats[];

export const supportTrendstats = async (
  filter: AboutPostCountFilter = {} // Set a default empty object
): Promise<AboutPostCountResult> => {
  try {
    const selectedYear = filter.year || new Date().getUTCFullYear();
    const yearStart = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));
    const dateRange: any = {};
    if (filter.startDate) {
      dateRange.$gte = new Date(`${filter.startDate}T00:00:00.000Z`);
    }
    if (filter.endDate) {
      dateRange.$lte = new Date(`${filter.endDate}T23:59:59.999Z`);
    }
    const pipeline: any[] = [
      {
        $match: {
          createdOn: Object.keys(dateRange).length > 0
            ? dateRange
            : {
              $gte: yearStart,
              $lte: yearEnd,
            },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
    ];
    pipeline.push(
      {
        $addFields: {
          month: { $month: "$createdOn" },
          role: "$userDetails.role",
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          roles: {
            $push: {
              role: "$_id.role",
              count: "$count",
            },
          },
          totalPosts: { $sum: "$count" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalPosts: 1,
          leaderPosts: {
            $let: {
              vars: {
                match: {
                  $first: {
                    $filter: {
                      input: "$roles",
                      as: "r",
                      cond: { $eq: ["$$r.role", "LEADER"] },
                    },
                  },
                },
              },
              in: { $ifNull: ["$$match.count", 0] },
            },
          },
          publicPosts: {
            $let: {
              vars: {
                match: {
                  $first: {
                    $filter: {
                      input: "$roles",
                      as: "r",
                      cond: { $eq: ["$$r.role", "PUBLIC"] },
                    },
                  },
                },
              },
              in: { $ifNull: ["$$match.count", 0] },
            },
          },
        },
      },
      { $sort: { month: 1 } }
    );
    const results = await mercury.db.About.mongoModel.aggregate(pipeline);

    const monthlyStats: AboutPostCountResult = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(Date.UTC(selectedYear, i)).toLocaleString("default", {
        month: "short",
      }),
      totalPosts: 0,
      leaderPosts: 0,
      publicPosts: 0,
    }));
    for (const result of results) {
      const index = result.month - 1;
      if (index >= 0 && index < 12) {
        monthlyStats[index].totalPosts = result.totalPosts || 0;
        monthlyStats[index].leaderPosts = result.leaderPosts || 0;
        monthlyStats[index].publicPosts = result.publicPosts || 0;
      }
    }
    return monthlyStats;
  } catch (error) {
    console.error("Aggregation Error:", error);
    throw new Error("Failed to fetch about post count by role");
  }
};