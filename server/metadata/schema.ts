export const typeDefs = `
    type Query {
        hello: String,
        getFormMetadataRecordCreate(formId: String): JSON
    }
    type Mutation {
        createRecordsUsingForm(formId: String, formData: JSON): String
    }
`