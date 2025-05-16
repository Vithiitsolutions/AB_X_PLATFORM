export const typeDefs = `
    type Query {
        signIn(value: String!, password: String!, validateBy: String!): LoginResponse
        getFormMetadataRecordCreate(formId: String): JSON
        me: User
    }
    type Mutation {
        createRecordsUsingForm(formId: String, formData: JSON): String
    }
    type LoginResponse {
        token: String
        user: User
    }
`;
