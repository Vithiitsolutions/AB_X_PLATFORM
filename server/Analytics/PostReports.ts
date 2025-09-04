import mongoose from "mongoose";
import mercury from "@mercury-js/core";
export interface PostCountFilter {
  year?: number;
  startDate?: string;
  endDate?: string;
  state?: string;
  district?: string;
  constituency?: string;
}
export interface MonthlyPostStats {
  month: string;
  totalPosts: number;
}
export type PostCountResult = MonthlyPostStats[];
export const getReportedPostCount = async (
  filter: PostCountFilter
): Promise<PostCountResult> => {
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
    const postFilters: any = {};
    if (filter.state) {
      postFilters['postInfo.state'] = new mongoose.Types.ObjectId(filter.state);
    }
    if (filter.district) {
      postFilters['postInfo.district'] = new mongoose.Types.ObjectId(filter.district);
    }
    if (filter.constituency) {
      postFilters['postInfo.constituency'] = new mongoose.Types.ObjectId(filter.constituency);
    }
    const pipeline: any[] = [
      {
        $match: {
          action: "Report",
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
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "postInfo",
        },
      },
      { $unwind: "$postInfo" },
    ];
    if (Object.keys(postFilters).length > 0) {
      pipeline.push({
        $match: postFilters,
      });
    }
    pipeline.push(
      {
        $group: {
          _id: { $month: "$createdOn" },
          totalPosts: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          totalPosts: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } }
    );
    const results = await mercury.db.PostAction.mongoModel.aggregate(pipeline);
    const monthlyStats: MonthlyPostStats[] = Array.from(
      { length: 12 },
      (_, i) => ({
        month: new Date(Date.UTC(selectedYear, i)).toLocaleString("default", {
          month: "short",
        }),
        totalPosts: 0,
      })
    );
    for (const result of results) {
      const index = result.month - 1;
      if (index >= 0 && index < 12) {
        monthlyStats[index].totalPosts = result.totalPosts;
      }
    }
    return monthlyStats;
  } catch (error) {
    console.error("Aggregation Error:", error);
    throw new Error("Failed to fetch reported post count");
  }
};