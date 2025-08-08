import { TRPCError } from '@trpc/server';

import {
  QuotaExceededError,
  ApiKeyExpiredError,
  ApiKeyInactiveError,
  ApiKeyNotFoundError,
  ApiKeyInvalidError,
  MissingApiKeyError,
  InvalidApiKeyError,
  ExpiredApiKeyError,
  InactiveApiKeyError,
  ApiKeyRateLimitExceededError,
  UnexpectedApiKeyValidationError,
} from '../errors';
import { logger } from '../logger';
import { realIp } from '../utils/functions';

import { sessionMiddleware, isAuthed } from './session.middleware';

/**
 * @deprecated
 */
export const requireAuth = sessionMiddleware.unstable_pipe(async ({ ctx, next }) => {
  const key = ctx.apiKey?.trim();
  if (!key) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      cause: new MissingApiKeyError(),
    });
  }

  let record;
  try {
    record = await ctx.services.apiKeyService.validateKey(key);
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        cause: new ApiKeyRateLimitExceededError(),
      });
    }
    if (err instanceof ApiKeyExpiredError) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        cause: new ExpiredApiKeyError(),
      });
    }
    if (err instanceof ApiKeyInactiveError) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        cause: new InactiveApiKeyError(),
      });
    }
    if (err instanceof ApiKeyNotFoundError || err instanceof ApiKeyInvalidError) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        cause: new InvalidApiKeyError(),
      });
    }

    logger().error({ err, key }, '🚫 Invalid API key attempt');
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      cause: new UnexpectedApiKeyValidationError(),
    });
  }

  logger().info({ key, ip: ctx.req.ip }, '✅ Valid API key');
  const ip = realIp(ctx.req);
  await ctx.services.apiKeyService.markKeyUsed({ id: record.id, ip });

  return next({ ctx: { ...ctx, apiKeyRecord: record } });
});

export const requireApiKey = isAuthed.unstable_pipe(async ({ ctx, next }) => {
  const key = ctx.apiKey?.trim();
  if (!key) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      cause: new MissingApiKeyError(),
    });
  }

  let record;
  try {
    record = await ctx.services.newApiKeyService.verifyKey(key);
  } catch (err) {
    logger().error({ err, key }, '🚫 Invalid API key attempt');
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      cause: new UnexpectedApiKeyValidationError(),
    });
  }

  logger().info({ key, ip: ctx.req.ip }, '✅ Valid API key');
  await ctx.services.newUserService.updateQuota(record.userId);

  return next({ ctx: { ...ctx, apiKeyRecord: record } });
});
