import mercury from "@mercury-js/core";

export const cronJob = mercury.createModel(
  "CronJob",
  {
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    description: {
        type: "string"
    },
    schedule: {
      type: 'string',
      required: true,  // e.g., cron format: "0 0 * * *"
    },
    timezone: {
      type: 'string',
      default: 'UTC'
    },
    function: {
      type: 'relationship',
      ref: 'Function',   
      required: true
    },
    isActive: {
      type: 'boolean',
      default: true
    },
    maxRetries: {
      type: 'number',
      default: 3
    },
    runCount: {
      type: 'number',
      default: 0
    },
    lastRunAt: {
      type: 'date'
    },
    nextRunAt: {
      type: 'date'
    },
    lastErrorAt: {
      type: 'date'
    },
    lastErrorMessage: {
      type: 'string'
    },
    createdBy: {
      type: 'relationship',
      ref: 'User'
    },
    updatedBy: {
      type: 'relationship',
      ref: 'User'
    }
  },
  {
    historyTracking: false,
  }
);
