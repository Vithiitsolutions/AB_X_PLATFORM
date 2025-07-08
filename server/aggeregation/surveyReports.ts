import mongoose from "mongoose";
import mercury from "@mercury-js/core";
interface PollStatsFilter {
  state?: string;
  district?: string;
  constituency?: string;
  date?: string;
  leaderId?: string;
  startDate?: string;
  endDate?: string;
}
export const getSurveyStats = async (filter: PollStatsFilter = {}) => {
  const toObjectId = (id?: string) =>
    id ? new mongoose.Types.ObjectId(id) : undefined;
  const filteredMatch: Record<string, any> = {
    ...(filter.state && { state: toObjectId(filter.state) }),
    ...(filter.district && { district: toObjectId(filter.district) }),
    ...(filter.constituency && {
      constituency: toObjectId(filter.constituency),
    }),
    ...(filter.leaderId && { leader: toObjectId(filter.leaderId) }),
  };
  let currentStart: Date | undefined;
  let currentEnd: Date | undefined;
  if (filter.startDate || filter.endDate) {
    const dateRange: Record<string, any> = {};
    if (filter.startDate) {
      currentStart = new Date(filter.startDate);
      currentStart.setHours(0, 0, 0, 0);
      dateRange.$gte = currentStart;
    }
    if (filter.endDate) {
      currentEnd = new Date(filter.endDate);
      currentEnd.setHours(23, 59, 59, 999);
      dateRange.$lte = currentEnd;
    }
    filteredMatch.createdOn = dateRange;
  }
  const hasFilters = Object.keys(filteredMatch).length > 0;
  const surveyPipeline = [
    {
      $facet: {
        totalSurveys: [{ $count: "count" }],
        SurveysFiltered: hasFilters
          ? [{ $match: filteredMatch }, { $count: "count" }]
          : [{ $match: { _id: null } }, { $count: "count" }],
      },
    },
  ];
  const [surveyStats] = await mercury.db.Survey.mongoModel.aggregate(
    surveyPipeline
  );
  const totalSurveys = surveyStats?.totalSurveys?.[0]?.count || 0;
  const SurveysFiltered = surveyStats?.SurveysFiltered?.[0]?.count || 0;
  let SurveyCreatedPercentage: number | null = null;
  if (currentStart && currentEnd) {
    const duration = currentEnd.getTime() - currentStart.getTime();
    const prevEnd = new Date(currentStart.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setHours(23, 59, 59, 999);
    const previousPollsCreated =
      await mercury.db.Survey.mongoModel.countDocuments({
        ...filteredMatch,
        createdOn: { $gte: prevStart, $lte: prevEnd },
      });  
    SurveyCreatedPercentage =
      previousPollsCreated === 0
        ? SurveysFiltered > 0
          ? 100
          : 0
        : Math.round(
            ((SurveysFiltered - previousPollsCreated) / previousPollsCreated) *
              100
          );
  }
  return {
    totalSurveys,
    SurveysFiltered,
    SurveyCreatedPercentage,
  };
};
