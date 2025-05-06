export const typeDefs = `
    type Query {
        signIn(username: String, password: String): String
        getFormMetadataRecordCreate(formId: String): JSON
    }
    type Mutation {
        createRecordsUsingForm(formId: String, formData: JSON): String
    }
`;
