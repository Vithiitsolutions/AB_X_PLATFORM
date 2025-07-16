import mongoose from "mongoose";
import mercury from "@mercury-js/core";

interface CombinedFilter {
  postId?: string;
  state?: string;
  district?: string;
  constituency?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  leaderId?: string;
}

export const getPostStats = async (filter: CombinedFilter = {}) => {

  const toObjectId = (id?: string) =>
    id ? new mongoose.Types.ObjectId(id) : undefined;

  const baseMatch: any = {};
  const postMatch: Record<string, any> = {};

  if (filter.state) baseMatch.state = toObjectId(filter.state);
  if (filter.district) baseMatch.district = toObjectId(filter.district);
  if (filter.constituency)
    baseMatch.constituency = toObjectId(filter.constituency);
  if (filter.category) baseMatch.category = toObjectId(filter.category);
  if (filter.leaderId) {
    baseMatch.$or = [
      {
        access: "PRIVATE",
        assignedTo: toObjectId(filter.leaderId),
      },
      {
        access: "PUBLIC",
        acceptedBy: toObjectId(filter.leaderId),
      },
    ];
  }
  if (filter.postId) postMatch._id = toObjectId(filter.postId);

  const dateRange: any = {};
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

  if (Object.keys(dateRange).length) {
    baseMatch.createdOn = dateRange;
    postMatch.createdOn = dateRange;
  }

  const resolvedMatch = {
    ...baseMatch,
    status: "Resolved",
    isDeleted: false,
  };

  

  const postPipeline = [
    { $match: baseMatch },
    {
      $facet: {
        totalResolved: [{ $match: resolvedMatch }, { $count: "count" }],
        publicPrivateResolved: [
          { $match: resolvedMatch },
          {
            $group: {
              _id: "$access",
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              publicResolvedCount: {
                $sum: { $cond: [{ $eq: ["$_id", "PUBLIC"] }, "$count", 0] },
              },
              privateResolvedCount: {
                $sum: { $cond: [{ $eq: ["$_id", "PRIVATE"] }, "$count", 0] },
              },
            },
          },
        ],
        totalPosts: [{ $count: "count" }],
        categoryStats: [
          { $match: { category: { $ne: null } } },
          {
            $group: {
              _id: "$access",
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              categoryPublic: {
                $sum: { $cond: [{ $eq: ["$_id", "PUBLIC"] }, "$count", 0] },
              },
              categoryPrivate: {
                $sum: { $cond: [{ $eq: ["$_id", "PRIVATE"] }, "$count", 0] },
              },
            },
          },
        ],
        totalCategory: [
          { $match: { category: { $ne: null } } },
          { $count: "count" },
        ],
        commonManStats: [
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          { $match: { "user.role": "PUBLIC" } },
          {
            $group: {
              _id: "$access",
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              commonManIssuesPostedPublic: {
                $sum: { $cond: [{ $eq: ["$_id", "PUBLIC"] }, "$count", 0] },
              },
              commonManIssuesPostedPrivate: {
                $sum: { $cond: [{ $eq: ["$_id", "PRIVATE"] }, "$count", 0] },
              },
            },
          },
        ],
        leaderStats: [
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          { $match: { "user.role": "LEADER" } },
          {
            $group: {
              _id: "$access",
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              leaderIssuesPostedPublic: {
                $sum: { $cond: [{ $eq: ["$_id", "PUBLIC"] }, "$count", 0] },
              },
              leaderIssuesPostedPrivate: {
                $sum: { $cond: [{ $eq: ["$_id", "PRIVATE"] }, "$count", 0] },
              },
            },
          },
        ],
      },
    },
  ];

  const supportSufferPipeline = [
    {
      $match: {
        action: { $in: ["Supported", "Suffered"] },
        ...(Object.keys(dateRange).length && { createdOn: dateRange }),
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "post",
        foreignField: "_id",
        as: "post",
      },
    },
    { $unwind: "$post" },
    {
      $match: Object.keys(postMatch).length
        ? Object.fromEntries(
            Object.entries(postMatch).map(([key, val]) => [`post.${key}`, val])
          )
        : {},
    },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        supportCount: {
          $sum: { $cond: [{ $eq: ["_id", "Supported"] }, "$count", 0] },
        },
        sufferCount: {
          $sum: { $cond: [{ $eq: ["_id", "Suffered"] }, "$count", 0] },
        },
      },
    },
  ];

  const [postStatsResult] = await mercury.db.Post.mongoModel.aggregate(
    postPipeline
  );
  const [supportStats] = await mercury.db.PostAction.mongoModel.aggregate(
    supportSufferPipeline
  );

  const getValue = (arr: any[], key: string) => arr?.[0]?.[key] || 0;

  const publicResolvedCount = getValue(
    postStatsResult.publicPrivateResolved,
    "publicResolvedCount"
  );
  const privateResolvedCount = getValue(
    postStatsResult.publicPrivateResolved,
    "privateResolvedCount"
  );
  const totalResolved = publicResolvedCount + privateResolvedCount;

  const commonManIssuesPostedPublic = getValue(
    postStatsResult.commonManStats,
    "commonManIssuesPostedPublic"
  );
  const commonManIssuesPostedPrivate = getValue(
    postStatsResult.commonManStats,
    "commonManIssuesPostedPrivate"
  );
  const leaderIssuesPostedPublic = getValue(
    postStatsResult.leaderStats,
    "leaderIssuesPostedPublic"
  );
  const leaderIssuesPostedPrivate = getValue(
    postStatsResult.leaderStats,
    "leaderIssuesPostedPrivate"
  );

  const totalPosts =
    commonManIssuesPostedPublic +
    commonManIssuesPostedPrivate +
    leaderIssuesPostedPublic +
    leaderIssuesPostedPrivate;

  const totalCategory = getValue(postStatsResult.totalCategory, "count");
  const categoryPublic = getValue(
    postStatsResult.categoryStats,
    "categoryPublic"
  );
  const categoryPrivate = getValue(
    postStatsResult.categoryStats,
    "categoryPrivate"
  );

  const supportCount = supportStats?.supportCount || 0;
  const sufferCount = supportStats?.sufferCount || 0;
  const totalSupportSuffer = supportCount + sufferCount;

  return {
    postStats: {
      totalResolved,
      publicResolvedCount,
      privateResolvedCount,
      totalPosts,
      commonManIssuesPostedPublic,
      commonManIssuesPostedPrivate,
      leaderIssuesPostedPublic,
      leaderIssuesPostedPrivate,
      totalCategory,
      categoryPublic,
      categoryPrivate,
    },
    supportSufferStats: {
      supportCount,
      sufferCount,
      totalCount: totalSupportSuffer,
      supportRate:
        totalSupportSuffer > 0
          ? +((supportCount / totalSupportSuffer) * 100).toFixed(2)
          : 0,
      sufferRate:
        totalSupportSuffer > 0
          ? +((sufferCount / totalSupportSuffer) * 100).toFixed(2)
          : 0,
    },
  };
};
