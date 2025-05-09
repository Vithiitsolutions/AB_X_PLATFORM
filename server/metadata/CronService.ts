import cron from "node-cron";
import { CronExpressionParser } from "cron-parser";
import { executeCronFunction } from "./utility";
import mercury from "@mercury-js/core";

export class CronService {
  jobs: Map<string, any>;
  user: {
    id: string;
    profile: string;
  };
  constructor(ctxUser: { id: string; profile: string }) {
    this.user = ctxUser;
    this.jobs = new Map(); // Map<jobId, cron.Task>
  }

  async start() {
    console.log("🚀 Starting CronService...");
    const activeJobs = await mercury.db.CronJob.list(
      { isActive: true },
      this.user,
      { populate: [{ path: "function" }] }
    );

    for (const cronJob of activeJobs) {
      this.scheduleJob(cronJob);
    }
  }

  async stop() {
    console.log("🛑 Stopping all scheduled jobs...");
    for (const [id, task] of this.jobs.entries()) {
      task.stop();
      this.jobs.delete(id);
    }
  }

  async reload() {
    await this.stop();
    await this.start();
  }

  scheduleJob(cronJob) {
    if (this.jobs.has(cronJob.id)) {
      console.warn(`⚠ Job ${cronJob.name} is already scheduled.`);
      return;
    }

    const task = cron.schedule(
      cronJob.schedule,
      async () => {
        await this.runJob(cronJob);
      },
      { timezone: cronJob.timezone || "UTC" }
    );

    this.jobs.set(cronJob.id, task);
    console.log(`✅ Scheduled job: ${cronJob.name} (${cronJob.schedule})`);
  }

  async runJob(cronJob) {
    console.log(`🚀 Running job: ${cronJob.name}`);
    cronJob.lastRunAt = new Date();
    cronJob.retryCount = 0;
    const funcRecord = cronJob?.function;
    if (!funcRecord) {
      console.warn(`⚠ Function not found for job ${cronJob.name}`);
      return;
    }

    const decodedCode = Buffer.from(funcRecord.code, "base64").toString(
      "utf-8"
    );
    const result = await this.executeWithRetries(cronJob, decodedCode);

    cronJob.nextRunAt = this.calculateNextRun(
      cronJob.schedule,
      cronJob.timezone
    );
    await mercury.db.CronJob.update(
      cronJob.id,
      {
        lastRunAt: cronJob.lastRunAt,
        nextRunAt: cronJob.nextRunAt,
        runCount: cronJob.runCount,
        lastErrorAt: cronJob.lastErrorAt,
        lastErrorMessage: cronJob.lastErrorMessage,
      },
      this.user,
      {
        skipHook: true
      }
    );
  }

  async executeWithRetries(cronJob, functionCode) {
    let attempt = 0;
    let success = false;

    while (attempt <= cronJob.maxRetries && !success) {
      const result = await executeCronFunction(cronJob, functionCode);
      if (result.success) {
        cronJob.runCount += 1;
        cronJob.lastErrorAt = null;
        cronJob.lastErrorMessage = null;
        success = true;
      } else {
        cronJob.lastErrorAt = new Date();
        cronJob.lastErrorMessage = result.error.message;
        cronJob.retryCount = attempt + 1;

        if (cronJob.retryCount <= cronJob.maxRetries) {
          console.log(
            `🔄 Retrying ${cronJob.name} (${cronJob.retryCount}/${cronJob.maxRetries})`
          );
        } else {
          console.warn(`⚠ Max retries reached for ${cronJob.name}.`);
        }
      }

      attempt++;
    }

    return success;
  }

  calculateNextRun(cronExpression, timezone = "UTC") {
    try {
      const interval = CronExpressionParser.parse(cronExpression, {
        tz: timezone,
      });
      return interval.next().toDate();
    } catch (err) {
      console.error(`❌ Failed to calculate next run:`, err);
      return null;
    }
  }
}
