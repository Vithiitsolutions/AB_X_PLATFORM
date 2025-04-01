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

export const LIST_LAYOUTS=`
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
      name
      label
      createdOn
      updatedOn
    }
  }
}`


export const LIST_LAYOUT_STRUCTURES = `query Docs($sort: sortLayoutStructureInput, $where: whereLayoutStructureInput) {
    listLayoutStructures(sort: $sort, where: $where) {
      docs {
        id
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
  }`
