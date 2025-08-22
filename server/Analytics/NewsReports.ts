import mercury from "@mercury-js/core";
export const CategoryStatsCount = async () => {
  try {
    const pipeline = [   
      {
        $lookup: {
          from: "postactions",
          let: { categoryId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$action", "Report"] } } },
            {
              $lookup: {
                from: "posts",
                localField: "post",
                foreignField: "_id",
                as: "postInfo"
              }
            },
            { $unwind: "$postInfo" },
            {
              $match: {
                $expr: {
                  $eq: ["$postInfo.category", "$$categoryId"]
                }
              }
            }
          ],
          as: "postReports"
        }
      },  
      {
        $lookup: {
          from: "newsactions",
          let: { categoryId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$action", "Report"] } } },
            {
              $lookup: {
                from: "news",
                localField: "news",
                foreignField: "_id",
                as: "newsInfo"
              }
            },
            { $unwind: "$newsInfo" },
            {
              $match: {
                $expr: {
                  $eq: ["$newsInfo.category", "$$categoryId"]
                }
              }
            }
          ],
          as: "newsReports"
        }
      },   
      {
        $addFields: {
          postReportCount: { $size: "$postReports" },
          newsReportCount: { $size: "$newsReports" }
        }
      },  
      {
        $project: {
          _id: 0,
          name: 1,
          postReportCount: 1,
          newsReportCount: 1
        }
      }
    ];
    return await mercury.db.Category.mongoModel.aggregate(pipeline);
  } catch (error) {
    console.error("Aggregation Error:", error);
    throw new Error("Failed to fetch category-wise report stats");
  }
};