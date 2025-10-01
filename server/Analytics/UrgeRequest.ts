import mongoose from "mongoose";
import mercury from "@mercury-js/core";

export const getMonthlyApplicationStats = async (
  filter: { leaderId?: string; startDate?: string; endDate?: string } = {}
) => {
  const toObjectId = (id?: string) =>
    id ? new mongoose.Types.ObjectId(id) : undefined;
  const now = new Date();
  const selectedYear = now.getFullYear();
  const yearStart = new Date(`${selectedYear}-01-01T00:00:00.000Z`);
  const yearEnd = new Date(`${selectedYear}-12-31T23:59:59.999Z`);
  const dateRange: any = {};
  if (filter.startDate) {
    dateRange.$gte = new Date(`${filter.startDate}T00:00:00.000Z`);
  }
  if (filter.endDate) {
    dateRange.$lte = new Date(`${filter.endDate}T23:59:59.999Z`);
  }

  const matchFilter: Record<string, any> = {
    createdOn:
      Object.keys(dateRange).length > 0
        ? dateRange
        : { $gte: yearStart, $lte: yearEnd },
    ...(filter.leaderId && { leader: toObjectId(filter.leaderId) }),
  };

  const pipeline = [
    { $match: matchFilter },
    {
      $group: {
        _id: { $month: "$createdOn" },
        total: { $sum: 1 },
        acceptedCount: {
          $sum: { $cond: [{ $eq: ["$status", "ACCEPTED"] }, 1, 0] },
        },
        resolvedCount: {
          $sum: { $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0] },
        },
        rejectedCount: {
          $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
        },
        pendingCount: {
          $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        month: "$_id",
        count: "$total",
        acceptedCount: 1,
        resolvedCount: 1,
        rejectedCount: 1,
        pendingCount:1,
        _id: 0,
      },
    },
    { $sort: { month: 1 } },
  ];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  try {
    const result = await mercury.db.Application.mongoModel
      .aggregate(pipeline)
      .exec();
    const monthlyCounts = Array.from({ length: 12 }, (_, i) => {
      const monthData = result.find(
        (r: { month: number }) => r.month === i + 1
      );
      return {
        month: monthNames[i],
        count: monthData?.count || 0,
        acceptedCount: monthData?.acceptedCount || 0,
        resolvedCount: monthData?.resolvedCount || 0,
        rejectedCount: monthData?.rejectedCount || 0,
        pendingCount:monthData?.pendingCount||0
      };
    });

    return {
      year: selectedYear,
      monthlyCounts,
    };
  } catch (err) {
    console.error("Aggregation Error:", err);
    throw new Error("Failed to fetch monthly application stats");
  }
};
interface ApplicationDetails {
  _id: string;
  user: string;
  leader: string;
  category: string;
  title: string;
  description: string;
  attachments: string[];
  status: "PENDING" | "IN_PROGRESS" | "ACCEPTED" | "RESOLVED" | "REJECTED";
  comments: string;
  createdOn: string;
  inProgressAt: string;
  acceptedAt: string;
  resolvedAt: string;
  rejectedAt: string;
}

export const getApplicationDetails = async (
  applicationId: string
): Promise<ApplicationDetails | null> => {
  if (!applicationId) {
    return null;
  }
  const applicationObjectId = new mongoose.Types.ObjectId(applicationId);
  try {
    const pipeline = [
      {
        $match: {
          _id: applicationObjectId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "leader",
          foreignField: "_id",
          as: "leader",
        },
      },
      {
        $unwind: {
          path: "$leader",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "applicationcategories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "files",
          localField: "attachments",
          foreignField: "_id",
          as: "attachments",
        },
      },
      {
        $project: {
          _id: 1,
          user: "$user.name",
          leader: "$leader.name",
          category: "$category.name",
          title: 1,
          description: 1,
          attachments: {
            $map: {
              input: "$attachments",
              as: "attachment",
              in: "$$attachment.location",
            },
          },
          status: 1,
          comments: 1,
          createdOn: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: "$createdOn",
            },
          },
          inProgressAt: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: "$inProgressAt",
            },
          },
          acceptedAt: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: "$acceptedAt",
            },
          },
          resolvedAt: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: "$resolvedAt",
            },
          },
          rejectedAt: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: "$rejectedAt",
            },
          },
        },
      },
    ];
    const [result] = await mercury.db.Application.mongoModel.aggregate(
      pipeline
    );
    return result as ApplicationDetails | null;
  } catch (error) {
    console.error("Error fetching application details:", error);
    return null;
  }
};
