import { TRPCError } from '@trpc/server';
import {
  ApiKeyExpiredError,
  ApiKeyInactiveError,
  ApiKeyInvalidError,
  ApiKeyNotFoundError,
  QuotaExceededError,
} from '../errors/apiKey.errors';
import { logger } from '../logger';
import { t } from '../trpc';
export const requireAuth = t.middleware(async ({ ctx, next }) => {
  const key = ctx.apiKey?.trim();
  if (!key) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing API key' });

  let record;
  try {
    record = await ctx.services.apiKeyService.validateKey(key);
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' });
    }
    if (err instanceof ApiKeyExpiredError) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'API key expired' });
    }
    if (err instanceof ApiKeyInactiveError) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'API key inactive' });
    }
    if (err instanceof ApiKeyNotFoundError || err instanceof ApiKeyInvalidError) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid API key' });
    }
    logger().error({ err, key }, '🚫 Invalid API key attempt');
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Invalid or expired API key',
    });
  }

  logger().info({ key, ip: ctx.req.ip }, '✅ Valid API key');

  await ctx.services.apiKeyService.markKeyUsed({ id: record.id, ip: ctx.req.ip });
  return next({
    ctx: { ...ctx, apiKeyRecord: record },
  });
});
