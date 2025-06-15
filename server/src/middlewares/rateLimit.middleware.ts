// import { TRPCError } from '@trpc/server';
// import { requireAuth } from './auth.middleware';
// const requestCounts = new Map<string, { count: number; lastReset: number }>();

// const WINDOW_MS = 60 * 1000; // 1 minute

// export const resetRateLimit = () => {
//   requestCounts.clear();
// };

// export const rateLimit = requireAuth.unstable_pipe(({ ctx, next }) => {
//   const apiKey = ctx.apiKeyRecord?.id;
//   if (!apiKey) {
//     return next();
//   }

//   const limit = 1;
//   const now = Date.now();
//   const record = requestCounts.get(apiKey);

//   if (!record || now - record.lastReset > WINDOW_MS) {
//     requestCounts.set(apiKey, { count: 1, lastReset: now });
//     return next();
//   }

//   if (record.count >= limit) {
//     throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' });
//   }

//   record.count += 1;
//   requestCounts.set(apiKey, record);

//   return next();
// });
