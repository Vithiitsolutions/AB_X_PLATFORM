import mercury from "@mercury-js/core";
import mongoose from "mongoose";

export function calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    const growth = ((current - previous) / previous) * 100;
    return Math.min(growth, 100);
}

export function getPreviousMonthRange(referenceDate: Date): { start: Date; end: Date } {
    const year = referenceDate.getUTCFullYear();
    const month = referenceDate.getUTCMonth();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    const start = new Date(Date.UTC(prevYear, prevMonth, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(prevYear, prevMonth + 1, 0, 23, 59, 59, 999));

    return { start, end };
}

export async function getUserAnalytics({
    date,
    startDate,
    endDate,
    stateId,
    districtId,
    constituencyId,
    year,
}: {
    date?: string;
    startDate?: string;
    endDate?: string;
    stateId?: string;
    districtId?: string;
    constituencyId?: string;
    year?: number;
}) {
    const filters: any = {
        state: { $exists: true, $ne: null },
        district: { $exists: true, $ne: null },
        constituency: { $exists: true, $ne: null },
    };
    if (stateId) filters.state = new mongoose.Types.ObjectId(stateId);
    if (districtId) filters.district = new mongoose.Types.ObjectId(districtId);
    if (constituencyId) filters.constituency = new mongoose.Types.ObjectId(constituencyId);
    const currentStart = startDate ? new Date(startDate) : undefined;
    const currentEnd = endDate ? new Date(endDate) : undefined;
    if (currentStart) currentStart.setUTCHours(0, 0, 0, 0);
    if (currentEnd) currentEnd.setUTCHours(23, 59, 59, 999);
    const { start: prevStart, end: prevEnd } = currentStart
        ? getPreviousMonthRange(currentStart)
        : { start: undefined, end: undefined };
    const currentFilters = { ...filters };
    const previousFilters = { ...filters };
    if (currentStart && currentEnd) {
        currentFilters.createdOn = { $gte: currentStart, $lte: currentEnd };
    }
    if (prevStart && prevEnd) {
        previousFilters.createdOn = { $gte: prevStart, $lte: prevEnd };
    }
    console.log(currentFilters, "kjhgcx");
    const UserData = mercury.db.User;
    const [totalCount, commonCount, leaderCount, maleCount, femaleCount] = await Promise.all([
        UserData.mongoModel.countDocuments(currentFilters),
        UserData.mongoModel.countDocuments({ ...currentFilters, role: "PUBLIC" }),
        UserData.mongoModel.countDocuments({ ...currentFilters, role: "LEADER" }),
        UserData.mongoModel.countDocuments({ ...currentFilters, gender: "Male" }),
        UserData.mongoModel.countDocuments({ ...currentFilters, gender: "Female" }),
    ]);
    const [prevTotal, prevCommon, prevLeader, prevMale, prevFemale] = await Promise.all([
        UserData.mongoModel.countDocuments(previousFilters),
        UserData.mongoModel.countDocuments({ ...previousFilters, role: "PUBLIC" }),
        UserData.mongoModel.countDocuments({ ...previousFilters, role: "LEADER" }),
        UserData.mongoModel.countDocuments({ ...previousFilters, gender: "Male" }),
        UserData.mongoModel.countDocuments({ ...previousFilters, gender: "Female" }),
    ]);
    const selectedYear = year || new Date().getUTCFullYear();
    const yearStart = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));
    const monthlyPipeline = [
        {
            $match: {
                ...filters,
                createdOn: {
                    $gte: yearStart,
                    $lte: yearEnd,
                },
            },
        },
        {
            $project: {
                role: 1,
                month: { $month: "$createdOn" },
            },
        },
        {
            $group: {
                _id: {
                    month: "$month",
                    role: "$role",
                },
                count: { $sum: 1 },
            },
        },
    ];
    const monthlyRaw = await UserData.mongoModel.aggregate(monthlyPipeline);
    const monthlyMap: Record<number, { commonMan: number; leaders: number; total: number }> = {};
    for (let i = 1; i <= 12; i++) {
        monthlyMap[i] = { commonMan: 0, leaders: 0, total: 0 };
    }
    for (const entry of monthlyRaw) {
        const month = entry._id.month;
        const role = entry._id.role;
        const count = entry.count;
        if (role === "PUBLIC") {
            monthlyMap[month].commonMan += count;
        } else if (role === "LEADER") {
            monthlyMap[month].leaders += count;
        }
        monthlyMap[month].total += count;
    }
    const monthlySignupTrend = Object.entries(monthlyMap).map(([monthNum, data]) => {
        const month = new Date(Date.UTC(2024, parseInt(monthNum) - 1)).toLocaleString("default", {
            month: "short",
        });

        return {
            month,
            commonMan: data.commonMan,
            leaders: data.leaders,
            total: data.total,
        };
    });
    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const currentMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    const previous30DaysStart = new Date(currentMonthStart);
    previous30DaysStart.setUTCDate(previous30DaysStart.getUTCDate() - 30);
    const previous30DaysEnd = new Date(currentMonthStart);
    previous30DaysEnd.setUTCHours(23, 59, 59, 999);
    const newUserCount = await UserData.mongoModel.countDocuments({
        ...filters,
        createdOn: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });
    const previousNewUserCount = await UserData.mongoModel.countDocuments({
        ...filters,
        createdOn: { $gte: previous30DaysStart, $lte: previous30DaysEnd },
    });
    const newUserGrowth = calculateGrowth(newUserCount, previousNewUserCount);

    return {
        totalCount,
        totalGrowth: calculateGrowth(totalCount, prevTotal),
        commonCount,
        commonGrowth: calculateGrowth(commonCount, prevCommon),
        leaderCount,
        leaderGrowth: calculateGrowth(leaderCount, prevLeader),
        maleCount,
        // maleGrowth: calculateGrowth(maleCount, prevMale),
        maleGrowth: totalCount > 0 ? Math.round((maleCount / totalCount) * 100) : 0,
        femaleCount,
        // femaleGrowth: calculateGrowth(femaleCount, prevFemale),
        femaleGrowth:totalCount > 0 ? Math.round((femaleCount / totalCount) * 100) : 0,
        monthlySignupTrend,
        newUserCount,
        newUserGrowth,

    };
}

export async function getUserLoginDurationByDate(userId: string, date: string) {
    const pipeline = [
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $addFields: {
                dateOnly: {
                    $dateToString: { format: "%Y-%m-%d", date: "$date" }
                }
            }
        },
        {
            $match: {
                dateOnly: date
            }
        },
        {
            $lookup: {
                from: "loginsessions",
                localField: "logins",
                foreignField: "_id",
                as: "loginRecords"
            }
        },
        {
            $unwind: "$loginRecords"
        },
        {
            $match: {
                "loginRecords.endTime": { $ne: null }
            }
        },
        {
            $addFields: {
                durationHours: {
                    $divide: [
                        { $subtract: ["$loginRecords.endTime", "$loginRecords.startTime"] },
                        1000 * 60 * 60
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                totalDurationHours: { $sum: "$durationHours" },
                logins: {
                    $push: {
                        loginId: "$loginRecords._id",
                        // startTime: "$loginRecords.startTime",
                        // endTime: "$loginRecords.endTime",
                        durationHours: "$durationHours"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalDurationHours: { $round: ["$totalDurationHours", 2] },
                logins: 1
            }
        }
    ];
    const UserScreenTime = mercury.db.UserScreenTime;
    const result = await UserScreenTime.mongoModel.aggregate(pipeline).exec();
    console.log(result, "result");
    return result[0] || { totalDurationHours: 0, logins: [] };
}

export async function getActiveUserCountWithRoles({
    startDate,
    endDate,
    year,
}: {
    startDate?: string;
    endDate?: string;
    year?: number;
}) {
    const UserScreenTime = mercury.db.UserScreenTime;

    // ---------- SUMMARY COUNTS (based on startDate/endDate only) ----------
    const summaryMatch: any = {};
    if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : new Date("1970-01-01");
        const end = endDate ? new Date(endDate) : new Date();
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        summaryMatch.date = { $gte: start, $lte: end };
    }

    const summaryResult = await UserScreenTime.mongoModel.aggregate([
        { $match: summaryMatch },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        { $unwind: "$userDetails" },
        {
            $group: {
                _id: "$userDetails._id",
                role: { $first: "$userDetails.role" },
            },
        },
        {
            $group: {
                _id: null,
                totalActiveUsers: { $sum: 1 },
                publicCount: {
                    $sum: {
                        $cond: [{ $eq: ["$role", "PUBLIC"] }, 1, 0],
                    },
                },
                leaderCount: {
                    $sum: {
                        $cond: [{ $eq: ["$role", "LEADER"] }, 1, 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalActiveUsers: 1,
                publicCount: 1,
                leaderCount: 1,
            },
        },
    ]);

    const summary =
        summaryResult[0] || {
            totalActiveUsers: 0,
            publicCount: 0,
            leaderCount: 0,
        };

    // ---------- MONTHLY TREND (based on year only) ----------
    const selectedYear = year ?? new Date().getUTCFullYear();
    const yearStart = new Date(Date.UTC(selectedYear, 0, 1));
    const yearEnd = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));

    const monthlyPipeline = [
        {
            $match: {
                date: {
                    $gte: yearStart,
                    $lte: yearEnd,
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        { $unwind: "$userDetails" },
        {
            $group: {
                _id: {
                    userId: "$userDetails._id",
                    month: { $month: "$date" },
                    role: "$userDetails.role",
                },
            },
        },
        {
            $group: {
                _id: {
                    month: "$_id.month",
                    role: "$_id.role",
                },
                count: { $sum: 1 },
            },
        },
    ];

    const monthlyRaw = await UserScreenTime.mongoModel.aggregate(monthlyPipeline);
    const monthlyMap: Record<number, { publicCount: number; leaderCount: number; total: number }> = {};
    for (let i = 1; i <= 12; i++) {
        monthlyMap[i] = { publicCount: 0, leaderCount: 0, total: 0 };
    }
    for (const entry of monthlyRaw) {
        const month = entry._id.month;
        const role = entry._id.role;
        const count = entry.count;
        if (role === "PUBLIC") {
            monthlyMap[month].publicCount += count;
        } else if (role === "LEADER") {
            monthlyMap[month].leaderCount += count;
        }
        monthlyMap[month].total += count;
    }

    const monthlyActiveTrend = Object.entries(monthlyMap).map(([monthNum, data]) => {
        const month = new Date(Date.UTC(2024, parseInt(monthNum) - 1)).toLocaleString("default", {
            month: "short",
        });
        return {
            month,
            publicCount: data.publicCount,
            leaderCount: data.leaderCount,
            total: data.total,
        };
    });

    return {
        ...summary,
        monthlyActiveTrend,
    };
}
