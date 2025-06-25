import mercury from "@mercury-js/core";
import mongoose from "mongoose";

export async function getUserAnalytics({
    date,
    stateId,
    districtId,
    constituencyId,
}: {
    date?: string;
    stateId?: string;
    districtId?: string;
    constituencyId?: string;
}) {
    const filters: any = {
        state: { $exists: true, $ne: null },
        district: { $exists: true, $ne: null },
        constituency: { $exists: true, $ne: null },
    };
    if (stateId) filters.state = new mongoose.Types.ObjectId(stateId);
    if (districtId) filters.district = new mongoose.Types.ObjectId(districtId);
    if (constituencyId) filters.constituency = new mongoose.Types.ObjectId(constituencyId);
    if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
        filters.createdOn = {
            $gte: start,
            $lt: end,
        };
    }
    // if (startDate && endDate) {
    //     filters.createdOn = {
    //         $gte: new Date(startDate),
    //         $lte: new Date(endDate),
    //     };
    // } else if (startDate) {
    //     const start = new Date(startDate);
    //     const end = new Date(start);
    //     end.setDate(start.getDate() + 1);
    //     filters.createdOn = {
    //         $gte: start,
    //         $lt: end,
    //     };
    // }
    const UserData = mercury.db.User;
    const totalCount = await UserData.mongoModel.countDocuments(filters);
    const commonCount = await UserData.mongoModel.countDocuments({
        ...filters,
        role: "PUBLIC",
    });
    const leaderCount = await UserData.mongoModel.countDocuments({
        ...filters,
        role: "LEADER",
    });
    const maleCount = await UserData.mongoModel.countDocuments({
        ...filters,
        gender: "Male"
    })
    const femaleCount = await UserData.mongoModel.countDocuments({
        ...filters,
        gender: "Female"
    })
    return {
        totalCount,
        commonCount,
        leaderCount,
        maleCount,
        femaleCount,
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

