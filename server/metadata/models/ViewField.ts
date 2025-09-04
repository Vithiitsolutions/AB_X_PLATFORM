import mercury from "@mercury-js/core";

export const viewField = mercury.createModel(
  "ViewField",
  {
    view: {
      type: "relationship",
      ref: "View",
      required: true,
    },
    field: {
      type: "relationship",
      ref: "ModelField",
      required: true,
    },
    order: {
      type: "number",
      required: true,
    },
    visible: {
      type: "boolean",
      required: true,
    },
    valueField: {
      type: "string"
    },
    label: {
      type: "string"
    },
    isNavigatable: {
      type: "boolean",
      default: true
    }
  },
  {
    historyTracking: false,
    indexes: [
      {
        fields: {
          view: 1,
          order: 1,
          field: 1,
        },
        options: {
          unique: true,
        },
      },
    ],
    recordOwner: false
  }
);


// Platform Views

// In viewFields need a scope to configure these things
// Filter On(Custom User filter)
//   - Date Type(from to To Selector)
//     - Enum(select using enumValues)
//     - Relationship / Virtual(Search inside the ref model fields)
//     - Boolean(need a checkbox)
//     - string, number, float - can be handled by free search


// System Filter based on user context: View Query


// For enumvalues, need to figure out a way to store labels also for enumValues.


// View Filter:

// viewId:
// label:  
// description: 
// fieldName: '',
// modelName: '
// fieldValues: '',
// fieldValueType: ''
// filterConditions: ?

// 4,9,11,12,17
// 6,7 - Optional
