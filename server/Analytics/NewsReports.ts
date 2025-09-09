import mongoose from "mongoose";
import mercury from "@mercury-js/core";

export interface CategoryStatsFilter {
  startDate?: string;
  endDate?: string;
  state?: string;
  district?: string;
  constituency?: string;
}

export interface CategoryStatsResult {
  name: string;
  postReportCount: number;
  newsReportCount: number;
}

export const CategoryStatsCount = async (
  filter: CategoryStatsFilter = {}
): Promise<CategoryStatsResult[]> => {
  try {
    const selectedYear = new Date().getUTCFullYear();
    const yearStart = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));

    const dateRange: any = {};
    if (filter.startDate) {
      dateRange.$gte = new Date(`${filter.startDate}T00:00:00.000Z`);
    }
    if (filter.endDate) {
      dateRange.$lte = new Date(`${filter.endDate}T23:59:59.999Z`);
    }

    const locationFilters: any = {};
    if (filter.state) {
      locationFilters['state'] = new mongoose.Types.ObjectId(filter.state);
    }
    if (filter.district) {
      locationFilters['district'] = new mongoose.Types.ObjectId(filter.district);
    }
    if (filter.constituency) {
      locationFilters['constituency'] = new mongoose.Types.ObjectId(filter.constituency);
    }

    const postMatchConditions: any[] = [{ $eq: ["$postInfo.category", "$$categoryId"] }];
    const newsMatchConditions: any[] = [{ $eq: ["$newsInfo.category", "$$categoryId"] }];

    if (locationFilters.state) {
      postMatchConditions.push({ $eq: ["$postInfo.state", locationFilters.state] });
      newsMatchConditions.push({ $eq: ["$newsInfo.state", locationFilters.state] });
    }
    if (locationFilters.district) {
      postMatchConditions.push({ $eq: ["$postInfo.district", locationFilters.district] });
      newsMatchConditions.push({ $eq: ["$newsInfo.district", locationFilters.district] });
    }
    if (locationFilters.constituency) {
      postMatchConditions.push({ $eq: ["$postInfo.constituency", locationFilters.constituency] });
      newsMatchConditions.push({ $eq: ["$newsInfo.constituency", locationFilters.constituency] });
    }

    const pipeline = [
      {
        $lookup: {
          from: "postactions",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                action: "Report",
                createdOn: Object.keys(dateRange).length > 0 ? dateRange : { $gte: yearStart, $lte: yearEnd },
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
            {
              $match: {
                $expr: {
                  $and: postMatchConditions,
                },
              },
            },
          ],
          as: "postReports",
        },
      },
      {
        $lookup: {
          from: "newsactions",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                action: "Report",
                createdOn: Object.keys(dateRange).length > 0 ? dateRange : { $gte: yearStart, $lte: yearEnd },
              },
            },
            {
              $lookup: {
                from: "news",
                localField: "news",
                foreignField: "_id",
                as: "newsInfo",
              },
            },
            { $unwind: "$newsInfo" },
            {
              $match: {
                $expr: {
                  $and: newsMatchConditions,
                },
              },
            },
          ],
          as: "newsReports",
        },
      },
      {
        $addFields: {
          postReportCount: { $size: "$postReports" },
          newsReportCount: { $size: "$newsReports" },
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          postReportCount: 1,
          newsReportCount: 1,
        },
      },
    ];
    return await mercury.db.Category.mongoModel.aggregate(pipeline);
  } catch (error) {
    console.error("Aggregation Error:", error);
    throw new Error("Failed to fetch category-wise report stats");
  }
};