import mercury from "@mercury-js/core";
import { TFields } from "@mercury-js/core";

const historySchema = (name: string): TFields => {
  return {
    recordId: {
      type: 'relationship',
      ref: name,
    },
    operationType: {
      type: 'enum',
      enum: ['UPDATE', 'DELETE'],
      enumType: 'string',
      required: true,
    },
    instanceId: {
      type: 'string',
      required: true,
    },
    dataType: {
      type: 'string',
      required: true,
    },
    fieldName: {
      type: 'string',
      required: true,
    },
    newValue: {
      type: 'string',
      required: true,
    },
    oldValue: {
      type: 'string', // Consider using 'mixed' if platform supports it
      required: true,
    },
  };
};

export class HistoryTrackingService {
  private static instance: HistoryTrackingService;

  private constructor() { }

  static getInstance(): HistoryTrackingService {
    if (!HistoryTrackingService.instance) {
      HistoryTrackingService.instance = new HistoryTrackingService();
    }
    return HistoryTrackingService.instance;
  }

  async init() {
    console.time("Setting up HistoryTracking Models!!");
    const models = mercury.list.filter(m => m.options?.historyTracking);
    const setupPromises = models.map(async (model) => {
      // get the model and check for permission without returning from here itself
      let modelRecord = await this.getModel(model.name);
      await Promise.all([
        this.createModelFields(model.name, modelRecord._id),
        this.updateSystemAdminAccess(modelRecord.name, modelRecord._id)
      ]);
      this.addHistoryModel(model.name);
    });
    await Promise.all(setupPromises);
    console.timeEnd("Setting up HistoryTracking Models!!");
  }

  async getModel(modelName: string) {
    let record = await mercury.db.Model.mongoModel.findOne({ name: `${modelName}History` });
    if (record) return record;
    return await this.createModel(modelName);
  }

  async createModel(modelName: string) {
    // Create model entry
    const model = await mercury.db.Model.mongoModel.create({
      name: `${modelName}History`,
      label: `${modelName} History`,
      description: `History Tracking for ${modelName}`,
    });
    return model;
  }

  async createModelFields(modelName: string, modelId: any) {
    const existingFields = await mercury.db.ModelField.mongoModel.findOne({ model: modelId, modelName: `${modelName}History` });
    if (existingFields) return;
    const fields = historySchema(modelName);
    const fieldEntries = Object.entries(fields).map(([fieldName, fieldDef]) => {
      return {
        model: modelId,
        modelName: `${modelName}History`,
        name: fieldName,
        label: fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), // Pretty label
        type: fieldDef.type,
        enumType: fieldDef.enumType ?? undefined,
        enumValues: fieldDef.enum ?? undefined,
        required: !!fieldDef.required,
        ref: fieldDef.ref ?? undefined,
      };
    });
    await mercury.db.ModelField.mongoModel.insertMany(fieldEntries);
  }

  async updateSystemAdminAccess(modelName: string, modelId: any) {
    let access = await mercury.db.Permission.mongoModel.findOne({ profileName: 'SystemAdmin', model: modelId, modelName: modelName });
    if (access) return;
    let systemAdminProfile = await mercury.db.Profile.mongoModel.findOne({ name: 'SystemAdmin' });
    await mercury.db.Permission.mongoModel.create({
      profile: systemAdminProfile._id,
      profileName: 'SystemAdmin',
      model: modelId,
      modelName: modelName,
      create: true,
      update: true,
      delete: true,
      read: true
    })
    mercury.access.extendProfile('SystemAdmin', [
      {
        modelName: modelName,
        access: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      },
    ]);
  }

  addHistoryModel(modelName: string) {
    const model = mercury.list.find((model) => model.name === `${modelName}History`);
    if (!model) return;
    mercury.createModel(`${modelName}History`, historySchema(modelName));
  }

}
