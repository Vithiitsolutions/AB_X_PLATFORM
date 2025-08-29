import mercury from "@mercury-js/core";
import mongoose from "mongoose";

interface LocationFilter {
    state?: string | null;
    district?: string | null;
    constituency?: string | null;
}

export const listLeaders = async (filter: LocationFilter = {}) => {
    try {
        let matchConditions: any = {
            role: "LEADER",
        };

        if (filter.state) {
            matchConditions.state = new mongoose.Types.ObjectId(filter.state);
        }
        if (filter.district) {
            matchConditions.district = new mongoose.Types.ObjectId(filter.district);
        }
        if (filter.constituency) {
            matchConditions.constituency = new mongoose.Types.ObjectId(filter.constituency);
        }

        const pipeline = [
            {
                $match: matchConditions
            },
            {
                $lookup: {
                    from: "userattributes",
                    localField: "_id",
                    foreignField: "user",
                    as: "userAttributes"
                }
            },
            {
                $lookup: {
                    from: "parties",
                    localField: "userAttributes.politicalParty",
                    foreignField: "_id",
                    as: "partiesData"
                }
            },
            {
                $lookup: {
                    from: "positionnames",
                    localField: "userAttributes.positionName",
                    foreignField: "_id",
                    as: "positionNameData"
                }
            },
            {
                $lookup: {
                    from: "positionstatuses",
                    localField: "userAttributes.positionStatus",
                    foreignField: "_id",
                    as: "positionStatusData"
                }
            },
            {
                $lookup: {
                    from: "files",
                    localField: "profilePic",
                    foreignField: "_id",
                    as: "profilePicData"
                }
            },
            {
                $lookup: {
                    from: "files",
                    localField: "partiesData.logo",
                    foreignField: "_id",
                    as: "partyLogoData"
                }
            },
            {
                $lookup: {
                    from: "files",
                    localField: "partiesData.banner",
                    foreignField: "_id",
                    as: "partyBannerData"
                }
            },
            {
                $addFields: {
                    positionName: {
                        $arrayElemAt: ["$positionNameData", 0]
                    },
                    positionStatus: {
                        $arrayElemAt: ["$positionStatusData", 0]
                    },
                    politicalParty: {
                        $mergeObjects: [
                            { $arrayElemAt: ["$partiesData", 0] },
                            { logo: { $arrayElemAt: ["$partyLogoData", 0] } },
                            { banner: { $arrayElemAt: ["$partyBannerData", 0] } }
                        ]
                    },
                    profilePic: {
                        $cond: {
                            if: { $gt: [{ $size: "$profilePicData" }, 0] },
                            then: { $arrayElemAt: ["$profilePicData.location", 0] },
                            else: {
                                $switch: {
                                    branches: [
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$gender", "Male"] },
                                                    { $eq: ["$role", "LEADER"] }
                                                ]
                                            },
                                            then: "https://assets.mercuryx.cloud/sandbox/signed/8467a809-9734-4541-88ad-dc1769c259b9"
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$gender", "Male"] },
                                                    { $eq: ["$role", "PUBLIC"] }
                                                ]
                                            },
                                            then: "https://assets.mercuryx.cloud/sandbox/signed/27975c1d-548e-471f-832c-a6627b8542a4"
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$gender", "Female"] },
                                                    { $eq: ["$role", "LEADER"] }
                                                ]
                                            },
                                            then: "https://assets.mercuryx.cloud/sandbox/signed/c1539dd8-59f1-4411-bf63-1b43d6dee051"
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$gender", "Female"] },
                                                    { $eq: ["$role", "PUBLIC"] }
                                                ]
                                            },
                                            then: "https://assets.mercuryx.cloud/sandbox/signed/3b7cb542-c038-457d-9419-34715643e34b"
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$gender", "Other"] },
                                                    { $eq: ["$role", "LEADER"] }
                                                ]
                                            },
                                            then: "https://assets.mercuryx.cloud/sandbox/signed/d5fead31-785f-4987-aa8b-da6605066d74"
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$gender", "Other"] },
                                                    { $eq: ["$role", "PUBLIC"] }
                                                ]
                                            },
                                            then: "https://assets.mercuryx.cloud/sandbox/signed/d5fead31-785f-4987-aa8b-da6605066d74"
                                        }
                                    ],
                                    default: "https://assets.mercuryx.cloud/sandbox/signed/d5fead31-785f-4987-aa8b-da6605066d74"
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    politicalParty: 1,
                    state: 1,
                    district: 1,
                    constituency: 1,
                    positionStatus: "$positionStatus",
                    positionName: "$positionName",
                    userAttributes: 1,
                    profilePic: 1
                }
            }
        ];

        const UserData = mercury.db.User;
        const leaders = await UserData.mongoModel.aggregate(pipeline).exec();
        return leaders;
    } catch (error: any) {
        console.error("Error in listLeaders:", error);
        throw new Error(`Failed to fetch leaders: ${error.message}`);
    }
};
