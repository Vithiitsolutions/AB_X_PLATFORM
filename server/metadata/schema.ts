export const typeDefs = `
    type Query {
        signIn(value: String!, password: String!, validateBy: String!): LoginResponse
        getFormMetadataRecordCreate(formId: String): JSON
        getUserAnalytics(input: UserAnalyticsInput): UserAnalyticsResult
        getUserScreenDuration(input:UserscreenInput):UserScreenDurationResponse
        retentionRatemetrics(date:String,stateId:String,districtId:String,constituencyId:String):JSON
        me: User
    }
    type Mutation {
        createRecordsUsingForm(formId: String, formData: JSON): String
        recordUserLoginSession(startTime: String!, endTime: String): UserScreenTimeResponse
    }
    input UserscreenInput{
        date:String
    }
    type LoginResponse {
        token: String
        user: User
    }
    input UserAnalyticsInput {
        date: String
        stateId: ID
        districtId: ID
        constituencyId: ID
    }
    type UserAnalyticsResult {
        totalCount: Int
        commonCount: Int
        leaderCount: Int
        maleCount: Int
        femaleCount: Int
    }
    type UserScreenDurationResponse{
        logins: [LoginDuration]
        totalDurationHours: Float
    }
    type LoginDuration {
        loginId: ID
        durationHours: Float
    }
    type UserScreenTimeResponse {
       message: String!
       session: LoginSession
    }
`;
