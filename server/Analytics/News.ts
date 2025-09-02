import mongoose from "mongoose";
import mercury from "@mercury-js/core";

interface NewsTrendsFilter {
  startDate?: string;
  endDate?: string;
  state?: string;
  district?: string;
  constituency?: string;
}

const toObjectId = (id?: string): mongoose.Types.ObjectId | undefined =>
  id ? new mongoose.Types.ObjectId(id) : undefined;

export const getNewsPostTrends = async (filter: NewsTrendsFilter = {}) => {
  const { startDate, endDate, state, district, constituency } = filter;

  const now = new Date();
  const selectedYear = now.getFullYear();

  let startOfPeriod: Date;
  let endOfPeriod: Date;

  if (startDate && endDate) {
    startOfPeriod = new Date(`${startDate}T00:00:00Z`);
    endOfPeriod = new Date(`${endDate}T23:59:59Z`);
  } else {
    startOfPeriod = new Date(`${selectedYear}-01-01T00:00:00Z`);
    endOfPeriod = new Date(`${selectedYear}-12-31T23:59:59Z`);
  }
  const initialMatch: Record<string, any> = {
    createdOn: {
      $gte: startOfPeriod,
      $lte: endOfPeriod,
    },
  };
  if (state) initialMatch.state = toObjectId(state);
  if (district) initialMatch.district = toObjectId(district);
  if (constituency) initialMatch.constituency = toObjectId(constituency);
  const pipeline = [
    {
      $match: initialMatch,
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $group: {
        _id: {
          month: { $month: "$createdOn" },
          role: "$userInfo.role",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        role: "$_id.role",
        count: 1,
      },
    },
  ];

  const raw = await mercury.db.News.mongoModel.aggregate(pipeline);

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];

  const monthMap: Record<number, { month: string; commonMan: number; leaders: number }> = {};
  for (let i = 1; i <= 12; i++) {
    monthMap[i] = {
      month: months[i - 1],
      commonMan: 0,
      leaders: 0,
    };
  }

  for (const entry of raw) {
    const record = monthMap[entry.month];
    if (!record) continue;

    if (entry.role === "LEADER") {
      record.leaders = entry.count;
    } else if (entry.role === "PUBLIC") {
      record.commonMan = entry.count;
    }
  }
  return Object.values(monthMap);
};