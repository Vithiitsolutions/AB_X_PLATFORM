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
    year?: number;
}

export const getPostStats = async (filter: CombinedFilter = {}) => {
    const toObjectId = (id?: string) =>
        id ? new mongoose.Types.ObjectId(id) : undefined;

    const baseMatch: any = {};
    const postMatch: Record<string, any> = {};

    if (filter.state) baseMatch.state = toObjectId(filter.state);
    if (filter.district) baseMatch.district = toObjectId(filter.district);
    if (filter.constituency) baseMatch.constituency = toObjectId(filter.constituency);
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

    let postDetails = null;
    if (filter.postId) {
        postDetails = await mercury.db.Post.mongoModel
            .findById(toObjectId(filter.postId))
            .populate('category')
            .populate('images')
            .populate('state')
            .populate('district')
            .populate('constituency')
            .populate('user')
            .populate('assignedTo')
            .populate('acceptedBy')
            .populate('resolvedBy')
            .exec();
    }

    const now = new Date();
    const year = filter.year || now.getFullYear();

    const monthlyMatch: any = {
        ...baseMatch,
        createdOn: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
        },
    };

    const monthlyPipeline = [
        { $match: monthlyMatch },
        {
            $group: {
                _id: {
                    month: { $month: "$createdOn" },
                    access: "$access",
                },
                count: { $sum: 1 },
                resolvedCount: {
                    $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
                },
            },
        },
        {
            $group: {
                _id: "$_id.month",
                totalPosts: { $sum: "$count" },
                totalResolved: { $sum: "$resolvedCount" },
                publicPosts: {
                    $sum: {
                        $cond: [{ $eq: ["$_id.access", "PUBLIC"] }, "$count", 0],
                    },
                },
                privatePosts: {
                    $sum: {
                        $cond: [{ $eq: ["$_id.access", "PRIVATE"] }, "$count", 0],
                    },
                },
                publicResolved: {
                    $sum: {
                        $cond: [{ $eq: ["$_id.access", "PUBLIC"] }, "$resolvedCount", 0],
                    },
                },
                privateResolved: {
                    $sum: {
                        $cond: [{ $eq: ["$_id.access", "PRIVATE"] }, "$resolvedCount", 0],
                    },
                },
            },
        },
        { $sort: { _id: 1 } },
    ];

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
                    $sum: { $cond: [{ $eq: ["$_id", "Supported"] }, "$count", 0] },
                },
                sufferCount: {
                    $sum: { $cond: [{ $eq: ["$_id", "Suffered"] }, "$count", 0] },
                },
            },
        },
    ];

    const [postStatsResult, supportStats, monthlyStatsResult] = await Promise.all([
        mercury.db.Post.mongoModel.aggregate(postPipeline),
        mercury.db.PostAction.mongoModel.aggregate(supportSufferPipeline),
        mercury.db.Post.mongoModel.aggregate(monthlyPipeline),
    ]);

    const getValue = (arr: any[], key: string) => arr?.[0]?.[key] || 0;

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyStats = monthNames.map((month, index) => {
        const monthData = monthlyStatsResult.find(item => item._id === index + 1);
        return {
            month,
            totalPosts: monthData?.totalPosts || 0,
            totalResolved: monthData?.totalResolved || 0,
            publicResolved: monthData?.publicResolved || 0,
            privateResolved: monthData?.privateResolved || 0,
        };
    });

    const publicResolvedCount = getValue(
        postStatsResult[0]?.publicPrivateResolved,
        "publicResolvedCount"
    );
    const privateResolvedCount = getValue(
        postStatsResult[0]?.publicPrivateResolved,
        "privateResolvedCount"
    );
    const totalResolved = getValue(postStatsResult[0]?.totalResolved, "count");

    const commonManIssuesPostedPublic = getValue(
        postStatsResult[0]?.commonManStats,
        "commonManIssuesPostedPublic"
    );
    const commonManIssuesPostedPrivate = getValue(
        postStatsResult[0]?.commonManStats,
        "commonManIssuesPostedPrivate"
    );
    const leaderIssuesPostedPublic = getValue(
        postStatsResult[0]?.leaderStats,
        "leaderIssuesPostedPublic"
    );
    const leaderIssuesPostedPrivate = getValue(
        postStatsResult[0]?.leaderStats,
        "leaderIssuesPostedPrivate"
    );

    const totalPosts = getValue(postStatsResult[0]?.totalPosts, "count");

    const totalCategory = getValue(postStatsResult[0]?.totalCategory, "count");
    const categoryPublic = getValue(
        postStatsResult[0]?.categoryStats,
        "categoryPublic"
    );
    const categoryPrivate = getValue(
        postStatsResult[0]?.categoryStats,
        "categoryPrivate"
    );

    const supportCount = supportStats?.[0]?.supportCount || 0;
    const sufferCount = supportStats?.[0]?.sufferCount || 0;
    const totalSupportSuffer = supportCount + sufferCount;

    const result: any = {
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
        monthlyStats: monthlyStats,
    };

    // Add post details if postId was provided
    if (filter.postId && postDetails) {
        result.postDetails = {
            _id: postDetails._id,
            access: postDetails.access,
            description: postDetails.description,
            category: postDetails.category,
            images: postDetails.images,
            state: postDetails.state,
            district: postDetails.district,
            constituency: postDetails.constituency,
            user: postDetails.user,
            assignedTo: postDetails.assignedTo,
            acceptedBy: postDetails.acceptedBy,
            acceptedAt: postDetails.acceptedAt ? postDetails.acceptedAt.toISOString() : null,
            resolvedBy: postDetails.resolvedBy,
            resolvedAt: postDetails.resolvedAt ? postDetails.resolvedAt.toISOString() : null,
            suffered: postDetails.suffered,
            support: postDetails.support,
            hasUserSuffered: postDetails.hasUserSuffered,
            hasUserSupported: postDetails.hasUserSupported,
            status: postDetails.status,
            tags: postDetails.tags,
            isDeleted: postDetails.isDeleted,
            saved: postDetails.saved,
            createdOn: postDetails.createdOn ? postDetails.createdOn.toISOString() : null,
            updatedOn: postDetails.updatedOn ? postDetails.updatedOn.toISOString() : null,
        };
    }
    return result;
};