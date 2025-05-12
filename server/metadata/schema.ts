export const typeDefs = `
    type Query {
        signIn(value: String!, password: String!, validateBy: String!): LoginResponse
        getFormMetadataRecordCreate(formId: String): JSON
    }
    type Mutation {
        createRecordsUsingForm(formId: String, formData: JSON): String
    }
    type LoginResponse {
        token: String
        user: User
    }
`;
