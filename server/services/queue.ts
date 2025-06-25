import { Queue, Worker } from 'bullmq';
import { Expo } from 'expo-server-sdk';
import mercury from '@mercury-js/core';
const expo = new Expo();
const redisConnection = {
    host: Deno.env.get("REDIS_HOST"),
    port: Number(Deno.env.get("REDIS_PORT")),
    username: Deno.env.get("REDIS_USERNAME"),
    password:Deno.env.get("REDIS_PASSWORD"),
}
export const notificationQueue = new Queue('{notifications}', {
    connection: redisConnection
}
);
export const worker = new Worker('{notifications}', async (job) => {
    try {
        const { token, title, body, data } = job.data;
        if (!Expo.isExpoPushToken(token)) {
            throw new Error('Invalid Expo Push Token');
        }
        const message = {
            to: token,
            sound: 'default',
            title,
            body,
            data,
        };
        const chunks = expo.chunkPushNotifications([message]);
        for (let chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
        }
        await mercury.db.Notification.create(
            { title, user: data.userId, message: body },
            { id: "1", profile: "ADMIN" }
        );
    } catch (error) {
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 3
});
worker.on('completed', async (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});
worker.on('failed', async (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
    console.log(`Retrying job (${job?.attemptsMade}/${job?.opts.attempts})`);
});
