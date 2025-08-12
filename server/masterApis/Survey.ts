import _ from "lodash";
import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import mercury from "@mercury-js/core";
export const SurveyQuery = {
  getSurveyDetails: async (
    root: any,
    { surveyId }: { surveyId: string },
    ctx: any,
    resolverInfo: any
  ) => {
    try {
      const user = ctx.user
      console.log(user);
      const survey: any = await mercury.db.Survey.get(
        { _id: surveyId },
        { id: "1", profile: "SystemAdmin" },
        {
          populate: [
            {
              path: "questions",
              populate: [
                { path: "options", select: "optionText order" }
              ],
              select: "questionText order options"
            },
            {
              path: "createdBy",
              populate: [
                { path: "profilePic", select: "location" },
                {
                  path: "userAttributes",
                  populate: [
                    {
                      path: "politicalParty",
                      populate: [
                        { path: "logo", select: "location" },
                        { path: "banner", select: "location" }
                      ]
                    }
                  ]
                }
              ],
              select: "name email profilePic userAttributes"
            }
          ]
        }
      );

      if (_.isEmpty(survey)) throw new GraphQLError("Survey not found");
      const userResponse = await mercury.db.SurveyResponse.list(
        { survey: surveyId },
        { id: "1", profile: "SystemAdmin" }
      );
      const currentDate = new Date();
      const isExpired = currentDate > survey.endDate;
      const userAttribute = await mercury.db.UserAttribute.get(
        { user: survey.createdBy.id },
        { id: "1", profile: "SystemAdmin" },
        {
          populate: [
            {
              path: "politicalParty",
              populate: [
                { path: "logo", select: "location" },
                { path: "banner", select: "location" }
              ]
            }
          ]
        }
      );
      const politicalParty = userAttribute?.politicalParty;
      const response: { [x: string]: any } = {
        survey: {
          id: survey.id,
          title: survey.title,
          description: survey.description,
          endDate: survey.endDate,
          surveyType:survey.surveyType,
          createdBy: {
            id: survey.createdBy.id,
            name: survey.createdBy.name,
            email: survey.createdBy.email,
            profilePic: survey.createdBy?.profilePic?.location
          },
          politicalParty: politicalParty ? {
            id: politicalParty._id,
            name: politicalParty.name,
            label: politicalParty.label,
            description: politicalParty.description,
            nationalParty: politicalParty.nationalParty,
            regionalParty: politicalParty.regionalParty,
            logo: {
              location: politicalParty.logo?.location || `https://assets.mercuryx.cloud/sandbox/signed/52d067fb-11b2-44e5-88a9-93205d700690`
            },
            banner: {
              location: politicalParty.banner?.location || `https://assets.mercuryx.cloud/sandbox/signed/52d067fb-11b2-44e5-88a9-93205d700690`
            }
          } : null,
          createdOn: survey.createdOn,
          isResultPublished: survey.isResultPublished,
          questions: survey.questions.map((question: any) => {
            return {
              id: question._id,
              questionText: question.questionText,
              order: question.order,
              options: question.options,
              userSelection: userResponse?.find(
                (response: any) => response.question.toString() == question.id.toString()
              )?.selectedOption
            }
          })
        },
        // userAccess: {
        //   canRespond: !isExpired && _.isEmpty(userResponse),
        //   hasResponded: !_.isEmpty(userResponse),
        //   isCreator: user.role === 'LEADER' && survey.createdBy.id.toString() == user.id.toString()
        // },
      }
      let results = null;
      if ((user.role == "LEADER" && survey.createdBy.id.toString() == user.id.toString()) || survey.isResultPublished) {
        results = await calculateSurveyResults(surveyId);
        response['results'] = {
          ...results
        }
      }
      return response;
    } catch (error: any) {
      throw new GraphQLError(error);
    }
  },
}
export async function calculateSurveyResults(survedId: string) {
  const responses = await mercury.db.SurveyResponse.mongoModel.find({ survey: survedId }).distinct('user');
  const totalResponses = responses.length;
  const questionResults = await mercury.db.SurveyResponse.mongoModel.aggregate(
    [
      {
        $match: {
          survey: new mongoose.Types.ObjectId(survedId)
        }
      },
      {
        $group: {
          _id: {
            question: '$question',
            option: '$selectedOption'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.question",
          options: {
            $push: {
              option: "$_id.option",
              count: "$count",
              percentage: {
                $multiply: [{ $divide: ['$count', totalResponses] }, 100]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          question: "$_id",
          options: "$options"
        }
      }
    ]
  )
  return {
    totalResponses,
    questionResults
  }
}
