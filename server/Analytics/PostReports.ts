import mongoose from "mongoose";
import mercury from "@mercury-js/core";
export interface PostCountFilter {
  year: number;
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
    const toObjectId = (val?: string) =>
      val ? new mongoose.Types.ObjectId(val) : undefined;
    const selectedYear = filter.year || new Date().getUTCFullYear();
    const yearStart = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));
    const pipeline: any[] = [
      {
        $match: {
          action: "Report",
          createdOn: {
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
    const postFilters: any = {};
    if (Object.keys(postFilters).length > 0) {
      pipeline.push({ $match: postFilters });
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
      }
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