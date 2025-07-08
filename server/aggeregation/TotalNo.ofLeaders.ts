import mercury from "@mercury-js/core";
import mongoose from "mongoose";
interface LeaderStatsFilter {
  state?: string;
  district?: string;
  constituency?: string;
  positionStatusId?: string;
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
  if (filter.constituency)  filterMatch.constituency = toObjectId(filter.constituency);   
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
  const hasFilters = Object.keys(filterMatch).some((key) => key !== "role");
  const pipeline = [
    { $match: baseMatch },
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
        totalLeaders: [{ $match: baseMatch }, { $count: "count" }],
        filteredLeaders: hasFilters
          ? [{ $match: filterMatch }, { $count: "count" }]
          : [{ $match: { _id: null } }, { $count: "count" }],
        positionStatusCount: filter.positionStatusId
          ? [
              {
                $match: {
                  ...baseMatch,
                  ...(filter.startDate || filter.endDate
                    ? { createdOn: filterMatch.createdOn }
                    : {}),
                  "attribute.positionStatus": toObjectId(
                    filter.positionStatusId
                  ),
                },
              },
              { $count: "count" },
            ]
          : [{ $match: { _id: null } }, { $count: "count" }],
      },
    },
  ];
  const [result] = await mercury.db.User.mongoModel.aggregate(pipeline);
  return {
    totalLeaders: result.totalLeaders[0]?.count || 0,
    filteredLeaders: result.filteredLeaders[0]?.count || 0,
    positionStatusCount: result.positionStatusCount[0]?.count || 0,
  };
};
                 