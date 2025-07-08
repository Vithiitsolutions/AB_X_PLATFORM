export const typeDefs = `
    type Query {
        signIn(value: String!, password: String!, validateBy: String!): LoginResponse
        getFormMetadataRecordCreate(formId: String): JSON
        getSurveyStats(filter: PollStatsFilter): PollStat
        getLeaderStats(filter:LeaderStatsFilter): LeaderStats
        me: User

    }
    type Mutation {
        createRecordsUsingForm(formId: String, formData: JSON): String
    }
    type LoginResponse {
        token: String
        user: User
    }
    type PollStats {
        totalSurveys: Int
        SurveysFiltered: Int 
        SurveyCreatedPercentage:Float
    }
    input PollStatsFilter {
        state: ID
        district: ID
        constituency: ID
        startDate:String
        endDate:String
        leaderId:ID 
    } 
    type LeaderStats {
        filteredLeaders: Int
        totalLeaders: Int
        positionStatusCount:Int
    }
   input LeaderStatsFilter {
        state: ID
        district: ID
        constituency: ID
        positionStatusId:String
        startDate:String
        endDate:String 
    }    


`;
