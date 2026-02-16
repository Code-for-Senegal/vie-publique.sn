import type { UnsubscribeRequest, UnsubscribeResponse } from '~/types/notification';
import { checkRateLimit } from '~~/server/utils/rate-limit';

const MAX_TOKEN_LENGTH = 500;

export default defineEventHandler(async (event): Promise<UnsubscribeResponse> => {
  try {
    // Rate limit: 5 requests per minute per IP
    checkRateLimit(event, { maxRequests: 5, windowMs: 60_000 });

    const body = await readBody<UnsubscribeRequest>(event);

    if (!body.token || typeof body.token !== 'string' || body.token.length > MAX_TOKEN_LENGTH) {
      return { success: false, error: 'Invalid token' };
    }

    if (!body.topic || typeof body.topic !== 'string') {
      return { success: false, error: 'Topic is required' };
    }

    const allowedTopics = ['news'];
    if (!allowedTopics.includes(body.topic)) {
      return { success: false, error: 'Invalid topic' };
    }

    await unsubscribeFromTopic(body.token, body.topic);

    return { success: true };
  } catch (error) {
    // Re-throw rate limit errors
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 429) {
      throw error;
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unsubscribe',
    };
  }
});
