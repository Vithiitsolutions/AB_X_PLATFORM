export const typeDefs = `
    type Query {
        signIn(username: String, password: String): User
        getFormMetadataRecordCreate(formId: String): JSON
    }
    type Mutation {
        createRecordsUsingForm(formId: String, formData: JSON): String
    }
`;
