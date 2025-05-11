import { TRPCError } from '@trpc/server';
import { logger } from '../logger';
import { t } from '../trpc';

export const requireAuth = t.middleware(async ({ ctx, next }) => {
  const key = ctx.apiKey?.trim();
  if (!key) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing API key' });

  const record = await ctx.services.apiKeyService.validateKey(key);
  if (!record) {
    logger().warn({ key, ip: ctx.req.ip }, '🚫 Invalid API key attempt');
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid or expired API key' });
  }

  logger().info({ key, ip: ctx.req.ip }, '✅ Valid API key');

  await ctx.services.apiKeyService.markKeyUsed({ id: record.id, ip: ctx.req.ip });

  return next({
    ctx: { ...ctx, apiKeyRecord: record },
  });
});
