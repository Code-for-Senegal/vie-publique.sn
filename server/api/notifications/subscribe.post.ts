import type { SubscribeRequest, SubscribeResponse } from '~/types/notification';

export default defineEventHandler(async (event): Promise<SubscribeResponse> => {
  try {
    const body = await readBody<SubscribeRequest>(event);

    if (!body.token || typeof body.token !== 'string') {
      return { success: false, error: 'Token is required' };
    }

    if (!body.topic || typeof body.topic !== 'string') {
      return { success: false, error: 'Topic is required' };
    }

    const allowedTopics = ['news'];
    if (!allowedTopics.includes(body.topic)) {
      return { success: false, error: 'Invalid topic' };
    }

    await subscribeToTopic(body.token, body.topic);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to subscribe',
    };
  }
});
