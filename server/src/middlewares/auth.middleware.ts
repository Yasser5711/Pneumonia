import { apiKeyService } from '@services/apiKey.service';
import { TRPCError } from '@trpc/server';
import { logger } from '../logger';
import { t } from '../trpc';

export const requireAuth = t.middleware(async ({ ctx, next }) => {
  const key = ctx.apiKey?.trim();
  if (!key) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing API key' });

  const record = await apiKeyService.validateKey(key);
  if (!record) {
    logger().warn('🚫 Invalid API key attempt:', key);
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired API key' });
  }

  logger().info('✅ Valid API key:', key);

  await apiKeyService.markKeyUsed({ id: record.id, ip: ctx.req.ip });

  return next({
    ctx: { ...ctx, apiKeyRecord: record },
  });
});
