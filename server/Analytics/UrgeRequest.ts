import mercury from "@mercury-js/core";
import mongoose from "mongoose";

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
          attachments: { $map: { input: "$attachments", as: "attachment", in: "$$attachment.location" } },
          status: 1,
          comments: 1,
          createdOn: { $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$createdOn" } },
          inProgressAt: { $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$inProgressAt" } },
          acceptedAt: { $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$acceptedAt" } },
          resolvedAt: { $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$resolvedAt" } },
          rejectedAt: { $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$rejectedAt" } },
        },
      },
    ];
    const [result] = await mercury.db.Application.mongoModel.aggregate(pipeline);
    return result as ApplicationDetails | null;
  } catch (error) {
    console.error("Error fetching application details:", error);
    return null;
  }
};