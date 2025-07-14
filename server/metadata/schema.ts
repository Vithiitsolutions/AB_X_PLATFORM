export const typeDefs = `
    type Query {
        signIn(value: String!, password: String!, validateBy: String!): LoginResponse
        getFormMetadataRecordCreate(formId: String): JSON
        getUserAnalytics(input: UserAnalyticsInput): UserAnalyticsResult
        getActiveUsersCount(startDate: String, endDate: String,year:Int): ActiveCount
        getManifestoSurveyStats(filter: DashboardFilter): DashboardStats
        getPostStats(filter: CombinedStatsFilter): CombinedStatsResponse
        getActivityStats(filter: ActivityDashboardFilter): ActivityDashboardStats
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
    input LeaderStatsFilter {
       state: ID
       district: ID
       constituency: ID
       positionStatusId:String
       startDate:String
       endDate:String 
    }
    type LeaderStats {
       totalLeaders: Int
       positionStatusCount:Int
    }   
    input ActivityDashboardFilter {
      state: ID
      district: ID
      constituency: ID
      startDate:String
      endDate:String
    } 
    type ActivityDashboardStats {
      totalActivities: Int
      totalSocialActivities: Int
      totalPoliticalActivities: Int
      totalPrivateActivities:Int
      totalAttendCount: Int
      politicalAttendCount: Int
      socialAttendCount: Int
      politicalMetricsRate:Float
      socialMetricsRate:Float
    }
    input CombinedStatsFilter {
         postId: ID
         state: ID
         district: ID
         constituency: ID
         category: ID
         leaderId: ID
         startDate: String
         endDate: String
    }
    type PostStats {
        totalResolved: Int
        publicResolvedCount: Int
         privateResolvedCount: Int
        totalPosts: Int
        commonManIssuesPostedPublic: Int
        commonManIssuesPostedPrivate: Int
        leaderIssuesPostedPublic: Int
        leaderIssuesPostedPrivate: Int
        totalCategory: Int
        categoryPublic: Int
        categoryPrivate: Int
    }
    type SupportSufferStats {
         supportCount: Int
         sufferCount: Int
         totalCount: Int
         supportRate: Float
         sufferRate: Float
    }
    type CombinedStatsResponse {
       postStats: PostStats
       supportSufferStats: SupportSufferStats
    }  

    input DashboardFilter {
       state: ID
       district: ID
       constituency: ID
       startDate: String
       endDate: String
    }    
    type DashboardStats {
      manifestoStats: ManifestoStats
      surveyStats: SurveyStats
    }
    type ManifestoStats {
       totalManifestos: Int     
       manifestoPercentage: Float
    }
    type SurveyStats {
       totalSurveys: Int    
       totalEndedSurveys: Int     
       surveyPercentage: Float
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
`;
