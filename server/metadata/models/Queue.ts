import mercury from "@mercury-js/core";
import Queue from "bull";

abstract class TQueue {
  constructor(name: string) {
    this.name = name;
  }
  name: string;
  abstract addJob(job: any, options?: any): void;
  abstract processJob(): void;
}
class BullQ extends TQueue {
  instance: any;
  constructor(name: string, queueInstance: any) {
    super(name);
    this.instance = queueInstance;
  }

  addJob(job: any, options?: any): void {
    this.instance.add(job, options);
  }

  processJob(): void {
    this.instance.process(async (job: any) => {
      // get function for this queue and execute ?
      const queue: any = await mercury.db.Queue.get({ name: this.name }, { id: "1", profile: "SystemAdmin" });
      const jobFun: any = await mercury.db.Function.get({ _id: queue.job }, { id: "1", profile: "SystemAdmin" });
      const fnSource = Buffer.from(jobFun.code, "base64").toString();
      let compiledFn = eval(`(${fnSource})`);
      await compiledFn.call(this, job.data);
      // await eval(global[fun.name](job));
    })
  }
}

export class QueueService {
  // Making it singleton across the application
  private static instance: QueueService;
  private queues: TQueue[];
  private constructor() {
    this.queues = [];
  }

  static getInstance() {
    if (QueueService.instance == null) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  listQueues() {
    return this.queues;
  }

  getQueue(qname: string) {
    return this.queues.find((queue: TQueue) => queue.name == qname);
  }

  createQueue(name: string, options?: any) {
    const queueInstance = this.createQueueInstance(options?.type);
    // Factory design pattern can be used to create different types of queues - implement in future
    const queue: TQueue = new BullQ(name, queueInstance);
    queue.processJob();
    this.queues.push(queue);
  }

  addJobToQueue(qname: string, job: any) {
    const queue = this.queues.find((queue: TQueue) => queue.name == qname);
    if (queue) {
      queue.addJob(job);
    }
  }

  createQueueInstance(type: string) {
    switch (type) {
      case "bullq":
        return new Queue("email-queue", {
          redis: {
            host: process.env.REDIS_HOST || "localhost",
            port: 6379,
          },
        });
      default:
        return new Queue("email-queue", {
          redis: {
            host: process.env.REDIS_HOST || "localhost",
            port: 6379,
          },
        });
    }
  }

  async setUpQueues() {
    const queues = await mercury.db.Queue.list({}, { id: "1", profile: "SystemAdmin" });
    queues.map((queue: any) => {
      this.createQueue(queue.name);
    })
  }
}

// queue record - after create, a queue instance needs to be created and it should be added to queues
// queue.add job and it should be processed

export const QueueModel = mercury.createModel(
  "Queue",
  {
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    job: {
      type: "relationship",
      ref: "Function",
      required: true
    }
  }
)


