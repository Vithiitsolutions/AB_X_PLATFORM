export const GET_MODEL = `
query GetModel($where: whereModelInput!) {
    getModel(where: $where) {
      id
      name
      label
      managed
      recordKey {
            id
            name
            label
          }

      createdOn
      updatedOn
    }
  }
`;

export const GET_LIST_MODEL_FIELDS = `
query ListModelFields($where: whereModelFieldInput, $limit: Int!) {
                listModelFields(where: $where, limit: $limit) {
                    docs {
                        id
                        name
                        enumValues
                       
                        label
                        managed
                        required
                        enumType
                        ref
                        many
                        unique
                        type
                        model {
                            id
                            name
                            label
                            recordKey {
            id
            name
            label
          }
                            
                        }
                        
                    }
                    limit
                }
            }`;

export const LIST_LAYOUTS = `
query Docs($where: whereLayoutInput, $limit: Int!) {
  listLayouts(where: $where, limit: $limit) {
    docs {
      id
      model {
        id
        label
        name
      }
      profiles {
        id
        label
        name
      }
      buttons {
        id
        icon
        href
        disabled
        type
        variant
        text
        iconPosition
        profiles {
          id

          }
        buttonFn{
          code
          id
        }
      }
      name
      label
      createdOn
      updatedOn
    }
  }
}`;

export const LIST_LAYOUT_STRUCTURES = `query Docs($sort: sortLayoutStructureInput, $where: whereLayoutStructureInput) {
    listLayoutStructures(sort: $sort, where: $where) {
      docs {
        id
        visible
        component {
        managed
          id
          name
          label
          description
          code
          modules
          createdOn
          updatedOn
        }
        order
        row
        col
        createdOn
        updatedOn
      }
    }
  }`;

export const GET_VIEW = `
  query GetView($where: whereViewInput!) {
  getView(where: $where) {
    id
    description
    name
    filters
    buttons {
      id
      icon
      href
      disabled
      type
      variant
      text
      iconPosition
      profiles {
        id
      }
      buttonFn{
        code
        id
      }
    }
  }
}`;

export const LIST_VIEW = `
query Docs($sort: sortViewFieldInput, $where: whereViewFieldInput, $limit: Int!) {
  listViewFields(sort: $sort, where: $where, limit: $limit) {
  totalDocs
    docs {
      id
      order
      valueField
      label
      field {
        id
        enumValues
        label
        managed
        required
        enumType
        ref
        many
        unique
        type
        model {
          id
          name
          label
          recordKey {
            id
            name
            label
          }
        }
        name
        localField
        modelName
        foreignField
      }
    }
    limit
  }
}`;

export const GET_FORM = `
query GetForm($where: whereFormInput!) {
  getForm(where: $where) {
    id
    label
    name
    description
    fields {
      id
      label
      placeholder
      refField {
        id
        enumType
        enumValues
        foreignField
        immutable
        label
        localField
       
        many
        model {
          id
          label
        }
        modelName
        name
        ref
        required
        type
        unique
        default
      }
      refModel {
        id
        label
        name
        recordKey {
          id
          label
        }
      }
      regExpError
      regexp
    }
  }
}`;

export const CREATE_RECORD_FORM = `
mutation CreateRecordsUsingForm($formId: String, $formData: JSON) {
  createRecordsUsingForm(formId: $formId, formData: $formData)
}`;

export const GET_META_DATA_RECORD_CREATE = `
query Query($formId: String) {
  getFormMetadataRecordCreate(formId: $formId)
}`;


export const GET_FILE = `query GetFile($where: whereFileInput!) {
  getFile(where: $where) {
    id
    name
    description
    extension
  }
}`

export const GET_TAB=`query Docs($where: whereTabInput) {
  listTabs(where: $where) {
    docs {
      id
      model {
        id
        name
      }
      type
      recordId
    }
  }
}`


export const CREATE_FILE = `mutation CreateFile($input: FileInput!) {
  createFile(input: $input) {
    id
  }
}`


export const UPDATE_FILE=`mutation UpdateFile($input: updateFileInput!) {
  updateFile(input: $input) {
    id
  }
}`


export const GET_PAGES =`
query GetPage($where: wherePageInput!) {
  getPage(where: $where) {
    id
    component {
      id
      code
      name
      label
      managed
    }
    description
    isPublished
    metaDescription
    metaKeywords
    metaTitle
    name
    slug
  }
}`