import mercury from "@mercury-js/core";

export const getNewsPostTrends = async (year?: number) => {
  const selectedYear = year || new Date().getFullYear();

  const startOfYear = new Date(`${selectedYear}-01-01T00:00:00Z`);
  const endOfYear = new Date(`${selectedYear}-12-31T23:59:59Z`);

  const pipeline = [
    {
      $match: {
        createdOn: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
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
