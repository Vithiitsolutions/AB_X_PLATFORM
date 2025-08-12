import { notificationQueue } from "./queue";
export const sendNotification = async function (
    tokens: string[] | string,
    title: string,
    body: string,
    data: Record<string, any> = {}
): Promise<{ success: boolean; jobCount?: number; error?: string }> {
    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
    if (!tokenArray || tokenArray.length === 0) {
        return { success: false, error: 'No valid tokens provided' };
    }

    try {
        const responses = await Promise.all(
            tokenArray.map(token =>
                notificationQueue.add('{notifications}', {
                    token,
                    title,
                    body,
                    data
                }, {
                    attempts: 5,
                    backoff: {
                        type: 'exponential',
                        delay: 1000
                    },
                    removeOnComplete: true,
                    removeOnFail: false
                })
            )
        );
        return { success: true, jobCount: responses.length };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
