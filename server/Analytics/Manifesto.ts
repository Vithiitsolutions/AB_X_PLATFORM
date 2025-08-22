import mercury from "@mercury-js/core";
import mongoose from "mongoose";

interface ManifestoDetails {
    _id: string;
    manifestoType: "myState" | "myDistrict" | "myConstituency";
    title: string;
    images: string[];
    manifesto: string[];
    state?: string;
    district?: string;
    constituency?: string;
    likesCount: number;
    dislikesCount: number;
}
export const getManifestoDetails = async (
    manifestoId: string
): Promise<ManifestoDetails | null> => {
    if (!manifestoId) {
        return null;
    }
    const manifestoObjectId = new mongoose.Types.ObjectId(manifestoId);
    try {
        const pipeline = [
            {
                $match: {
                    _id: manifestoObjectId,
                },
            },
            {
                $lookup: {
                    from: "states",
                    localField: "state",
                    foreignField: "_id",
                    as: "state",
                },
            },
            {
                $unwind: {
                    path: "$state",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "districts",
                    localField: "district",
                    foreignField: "_id",
                    as: "district",
                },
            },
            {
                $unwind: {
                    path: "$district",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "constituencies",
                    localField: "constituency",
                    foreignField: "_id",
                    as: "constituency",
                },
            },
            {
                $unwind: {
                    path: "$constituency",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "files",
                    localField: "images",
                    foreignField: "_id",
                    as: "images",
                },
            },
            {
                $lookup: {
                    from: "manifestoactions",
                    localField: "_id",
                    foreignField: "manifesto",
                    as: "actions",
                },
            },
            {
                $unwind: {
                    path: "$actions",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: "$_id",
                    manifestoType: { $first: "$manifestoType" },
                    title: { $first: "$title" },
                    manifesto: { $first: "$manifesto" },
                    images: { $first: "$images" },
                    state: { $first: "$state.name" },
                    district: { $first: "$district.name" },
                    constituency: { $first: "$constituency.name" },
                    likesCount: {
                        $sum: { $cond: [{ $eq: ["$actions.action", "LIKE"] }, 1, 0] },
                    },
                    dislikesCount: {
                        $sum: { $cond: [{ $eq: ["$actions.action", "DISLIKE"] }, 1, 0] },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    manifestoType: 1,
                    title: 1,
                    manifesto: 1,
                    images: { $map: { input: "$images", as: "image", in: "$$image.location" } },
                    state: 1,
                    district: 1,
                    constituency: 1,
                    likesCount: 1,
                    dislikesCount: 1,
                },
            },
        ];
        const [result] = await mercury.db.Manifesto.mongoModel.aggregate(pipeline);
        if (!result) {
            return null;
        }
        return result as ManifestoDetails;
    } catch (error) {
        console.error("Error fetching manifesto details:", error);
        return null;
    }
};