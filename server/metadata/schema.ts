export const typeDefs = `
    type Query {
        hello: String,
        getFormMetadataRecordCreate(formId: String, update: Boolean): JSON
    }
`