import mercury from "@mercury-js/core";
import mongoose from "mongoose";

interface LeaderStatsFilter {
  state?: string;
  district?: string;
  constituency?: string;
  partyId?: string;
  positionName?: string;
  startDate?: string;
  endDate?: string;
}

export const getLeaderStats = async (filter: LeaderStatsFilter = {}) => {
  const toObjectId = (val?: string) =>
    val ? new mongoose.Types.ObjectId(val) : undefined;

  const baseMatch = { role: "LEADER" };
  const filterMatch: any = { ...baseMatch };

  if (filter.state) filterMatch.state = toObjectId(filter.state);
  if (filter.district) filterMatch.district = toObjectId(filter.district);
  if (filter.constituency) filterMatch.constituency = toObjectId(filter.constituency);

  if (filter.startDate || filter.endDate) {
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
    filterMatch.createdOn = dateRange;
  }

  // Fetch all possible position statuses first
  const positionStatuses = await mercury.db.PositionStatus.mongoModel.find({}, '_id value');
  const allStatusIds = positionStatuses.map(status => status._id);

  const pipeline = [
    { $match: filterMatch },
    {
      $lookup: {
        from: "userattributes",
        localField: "_id",
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
        totalLeaders: [{ $count: "count" }],
        positionStatusBreakdown: [
          ...(filter.partyId
            ? [
                {
                  $match: {
                    "attribute.politicalParty": toObjectId(filter.partyId),
                  },
                },
              ]
            : []),
          ...(filter.positionName
            ? [
                {
                  $match: {
                    "attribute.positionName": toObjectId(filter.positionName),
                  },
                },
              ]
            : []),
          {
            $group: {
              _id: "$attribute.positionStatus",
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ];

  const [result] = await mercury.db.User.mongoModel.aggregate(pipeline);
  const processedBreakdown = positionStatuses.map((status: { _id: any; value: any; }) => {
    const foundStatus = result.positionStatusBreakdown.find(
      (item: any) => item._id && item._id.equals(status._id)
    );

    return {
      name: status.value,
      count: foundStatus?.count || 0,
    };
  });

  return {
    totalLeaders: result.totalLeaders[0]?.count || 0,
    positionStatusBreakdown: processedBreakdown,
  };
};