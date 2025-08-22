import mongoose from "mongoose";
import mercury from "@mercury-js/core";

interface DashboardFilter {
  state?: string;
  district?: string;
  constituency?: string;
  startDate?: string;
  endDate?: string;
  year?: string;
}

const toObjectId = (id?: string): mongoose.Types.ObjectId | undefined =>
  id ? new mongoose.Types.ObjectId(id) : undefined;

const calculatePercentage = (current: number, previous: number): number => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return +(((current - previous) / previous) * 100).toFixed(2);
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const getManifestoSurveyStats = async (filter: DashboardFilter = {}) => {
  const now = new Date();
  const ManifestoModel = mercury.db.Manifesto.mongoModel;
  const SurveyModel = mercury.db.Survey.mongoModel;

  const locationFilters: Record<string, any> = {};
  if (filter.state) locationFilters.state = toObjectId(filter.state);
  if (filter.district) locationFilters.district = toObjectId(filter.district);
  if (filter.constituency) locationFilters.constituency = toObjectId(filter.constituency);

  let currentStart: Date | undefined;
  let currentEnd: Date | undefined;
  const createdOn: Record<string, any> = {};

  if (filter.startDate) {
    currentStart = new Date(filter.startDate);
    currentStart.setHours(0, 0, 0, 0);
    createdOn.$gte = currentStart;
  }
  if (filter.endDate) {
    currentEnd = new Date(filter.endDate);
    currentEnd.setHours(23, 59, 59, 999);
    createdOn.$lte = currentEnd;
  }

  const hasDateFilter = !!(currentStart && currentEnd);
  const combinedFilter = { ...locationFilters, ...(hasDateFilter ? { createdOn } : {}) };

  const yearForMonthlyStats = filter.year ? parseInt(filter.year) : now.getFullYear();
  const monthlyManifestoAggregationPipeline = [
    {
      $match: {
        ...locationFilters,
        createdOn: {
          $gte: new Date(yearForMonthlyStats, 0, 1),
          $lte: new Date(yearForMonthlyStats, 11, 31, 23, 59, 59, 999),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdOn" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];
  const monthlySurveyAggregationPipeline = [
    {
      $match: {
        ...locationFilters,
        createdOn: {
          $gte: new Date(yearForMonthlyStats, 0, 1),
          $lte: new Date(yearForMonthlyStats, 11, 31, 23, 59, 59, 999),
        },
      },
    },
    {
      $lookup: {
        from: "surveyresponses",
        localField: "_id",
        foreignField: "survey",
        as: "responses",
      },
    },
    {
      $addFields: {
        responses: { $ifNull: ["$responses", []] }, // ✅ ensure array
      },
    },
    {
      $group: {
        _id: { $month: "$createdOn" },
        count: { $sum: 1 },
        respondedCount: {
          $sum: { $cond: [{ $gt: [{ $size: "$responses" }, 0] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const [
    manifestoAgg,
    surveyAgg,
    monthlyManifestosResult,
    monthlySurveysResult
  ] = await Promise.all([
    ManifestoModel.aggregate([
      { $match: combinedFilter },
      { $group: { _id: null, totalManifestos: { $sum: 1 } } }
    ]),
    SurveyModel.aggregate([
      {
        $facet: {
          totalSurveys: [
            { $match: combinedFilter },
            { $count: "count" }
          ],
          totalEndedSurveys: [
            {
              $match: {
                ...combinedFilter,
                endDate: { $lte: now }
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]),
    ManifestoModel.aggregate(monthlyManifestoAggregationPipeline),
    SurveyModel.aggregate(monthlySurveyAggregationPipeline),
  ]);

  const manifestoCount = manifestoAgg[0]?.totalManifestos || 0;
  const surveyCount = surveyAgg[0]?.totalSurveys[0]?.count || 0;
  const endedSurveyCount = surveyAgg[0]?.totalEndedSurveys[0]?.count || 0;

  let manifestoPercentage: number | null = null;
  let surveyPercentage: number | null = null;

  if (hasDateFilter) {
    const duration = currentEnd!.getTime() - currentStart!.getTime();
    const prevEnd = new Date(currentStart!.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setHours(23, 59, 59, 999);

    const previousDateFilter = { createdOn: { $gte: prevStart, $lte: prevEnd } };

    const [previousManifestos, previousSurveys] = await Promise.all([
      ManifestoModel.countDocuments({ ...locationFilters, ...previousDateFilter }),
      SurveyModel.countDocuments({ ...locationFilters, ...previousDateFilter }),
    ]);

    manifestoPercentage = calculatePercentage(manifestoCount, previousManifestos);
    surveyPercentage = calculatePercentage(surveyCount, previousSurveys);
  } else {
    const cmStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cmEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const pmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const pmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [cmManifestos, pmManifestos, cmSurveys, pmSurveys] = await Promise.all([
      ManifestoModel.countDocuments({ ...locationFilters, createdOn: { $gte: cmStart, $lte: cmEnd } }),
      ManifestoModel.countDocuments({ ...locationFilters, createdOn: { $gte: pmStart, $lte: pmEnd } }),
      SurveyModel.countDocuments({ ...locationFilters, createdOn: { $gte: cmStart, $lte: cmEnd } }),
      SurveyModel.countDocuments({ ...locationFilters, createdOn: { $gte: pmStart, $lte: pmEnd } }),
    ]);

    manifestoPercentage = calculatePercentage(cmManifestos, pmManifestos);
    surveyPercentage = calculatePercentage(cmSurveys, pmSurveys);
  }

  const monthlyManifestos = monthNames.map((month, index) => {
    const monthData = monthlyManifestosResult.find(item => item._id === index + 1);
    return {
      month: month,
      count: monthData?.count || 0,
    };
  });

  const monthlySurveys = monthNames.map((month, index) => {
    const monthData = monthlySurveysResult.find(item => item._id === index + 1);
    return {
      month: month,
      count: monthData?.count || 0,
      responseCount: monthData?.respondedCount || 0,
    };
  });

  return {
    manifestoStats: {
      totalManifestos: manifestoCount,
      manifestoPercentage,
      monthlyManifestos: monthlyManifestos,
    },
    surveyStats: {
      totalSurveys: surveyCount,
      totalEndedSurveys: endedSurveyCount,
      surveyPercentage,
      monthlySurveys: monthlySurveys,
    },
  };
};
