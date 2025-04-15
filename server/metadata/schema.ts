export const typeDefs = `
    type Query {
        hello: String,
        getFormMetadataRecordCreate(formId: String): JSON
    }
`