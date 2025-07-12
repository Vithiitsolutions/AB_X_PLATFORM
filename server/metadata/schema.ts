export const typeDefs = `
    type Query {
        signIn(value: String!, password: String!, validateBy: String!): LoginResponse
        getFormMetadataRecordCreate(formId: String): JSON 
        getPostStats(filter: CombinedStatsFilter): CombinedStatsResponse
        getActivityStats(filter: ActivityDashboardFilter): ActivityDashboardStats
        getManifestoSurveyStats(filter: DashboardFilter): DashboardStats
        getUrgeApplicationStats(filter: ApplicationStatsFilter): ApplicationStats 
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
    type ManifestoStats {
       totalManifestos: Int     
       manifestoPercentage: Float
    }
    type SurveyStats {
       totalSurveys: Int    
       totalEndedSurveys: Int     
       surveyPercentage: Float
    }
    type DashboardStats {
      manifestoStats: ManifestoStats
      surveyStats: SurveyStats
    }
   input DashboardFilter {
       state: ID
       district: ID
       constituency: ID
       startDate: String
       endDate: String
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
  input ActivityDashboardFilter {
      state: ID
      district: ID
      constituency: ID
      startDate:String
      endDate:String
   } 
   type LeaderStats {
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
   type SupportSufferStats {
         supportCount: Int
         sufferCount: Int
         totalCount: Int
         supportRate: Float
         sufferRate: Float
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
   type CombinedStatsResponse {
       postStats: PostStats
       supportSufferStats: SupportSufferStats
   }  
   input ApplicationStatsFilter {
        state: ID
        district: ID
        constituency: ID
        leaderId: ID
        startDate: String
        endDate: String
    }
    type ApplicationStats {
       totalApplications: Int   
       acceptedCount: Int
       resolvedCount: Int
       rejectedCount: Int
    }
 

 
  
`;
