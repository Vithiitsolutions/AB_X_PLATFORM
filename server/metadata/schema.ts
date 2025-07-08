export const typeDefs = `
    type Query {
        signIn(value: String!, password: String!, validateBy: String!): LoginResponse
        getFormMetadataRecordCreate(formId: String): JSON
        getUserAnalytics(input: UserAnalyticsInput): UserAnalyticsResult
        getUserScreenDuration(input:UserscreenInput):UserScreenDurationResponse
        getActiveUsersCount(startDate: String, endDate: String,year:Int): ActiveCount
        retentionRatemetrics(date:String,stateId:String,districtId:String,constituencyId:String):JSON
         getPostReportsSummary(filter: PostReportFilterInput): PostReportSummaryResponse
        me: User
    }
    type Mutation {
        createRecordsUsingForm(formId: String, formData: JSON): String
        recordUserLoginSession(startTime: String!, endTime: String): UserScreenTimeResponse
    }
    input UserscreenInput{
        date:String
    }
     input PostReportFilterInput {
     startDate: String
     endDate: String
     stateId: ID
     districtId: ID
     constituencyId: ID
}
    type LoginResponse {
        token: String
        user: User
    }
    input UserAnalyticsInput {
        date: String
        startDate:String
        endDate:String
        stateId: ID
        districtId: ID
        constituencyId: ID
        year:Int
    }
    type MonthlySignup {
        month: String
        commonMan: Int
        leaders: Int
        total: Int
    }
    type UserAnalyticsResult {
        totalCount: Int
        totalGrowth:Float
        commonCount: Int
        commonGrowth:Float
        leaderCount: Int
        leaderGrowth:Float
        maleCount: Int
        maleGrowth:Float
        femaleCount: Int
        femaleGrowth:Float
        monthlySignupTrend: [MonthlySignup]
    }
    type MonthlyActiveTrend {
        month: String
        publicCount: Int
        leaderCount: Int
        total: Int
    }
    type ActiveCount {
        totalActiveUsers: Int
        publicCount: Int
        leaderCount: Int
        monthlyActiveTrend: [MonthlyActiveTrend!]!
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
    type PostReportSummaryResponse {
    reportSummary: ReportSummary
    commonManFeedbackList: [FeedbackReport]
    leaderFeedbackList: [FeedbackReport]
    }
    type ReportSummary {
    totalReports: CountWithPercentage
    reportsByCategory: CountWithPercentage
    commonManFeedback: CountWithPercentage
    leaderFeedback: CountWithPercentage
}

    type CountWithPercentage {
    count: Int!
    percentageChange: Float!
}

    type FeedbackReport {
    postId: ID
    postTitle: String
    date: String
    state: String
    district: String
    constituency: String
}
`;
