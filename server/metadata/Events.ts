import { EventEmitter } from "node:events";

class MetaEventEmitter extends EventEmitter {}

export const metaEvents = new MetaEventEmitter();
