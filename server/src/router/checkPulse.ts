import { z } from 'zod';

import { publicProcedure, router } from '../middlewares';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const healthRouter = router({
  checkPulse: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/check-pulse',
        summary: 'Check Pulse',
        description: 'Returns a 200 OK response if the server is alive.',
        protect: false,
      },
    })
    .input(z.object({}))
    .output(z.object({ message: z.string() }))
    .query(() => ({ message: 'Server is alive' })),

  pulse: publicProcedure
    .input(
      z
        .object({
          mode: z.enum(['presence', 'beats']).default('beats'),
          bpm: z.number().min(40).max(180).default(72),
          presenceIntervalMs: z.number().min(1_000).max(60_000).default(30_000),
          jitterMs: z.number().min(0).max(120).default(20),
        })
        .default({
          mode: 'beats',
          bpm: 72,
          presenceIntervalMs: 30_000,
          jitterMs: 20,
        }),
    )
    .subscription(async function* ({ input, signal }) {
      const now = () => Date.now();

      yield { type: 'presence', ts: now(), message: 'Server is alive' };

      let nextPresence = now() + input.presenceIntervalMs;
      let nextBeat = now() + 60_000 / input.bpm;

      while (!signal?.aborted) {
        const t = now();

        if (t >= nextPresence) {
          yield { type: 'presence', ts: t, message: 'Server is alive' };
          nextPresence = t + input.presenceIntervalMs;
        }

        if (input.mode === 'beats' && t >= nextBeat) {
          yield { type: 'beat', ts: t };
          const base = 60_000 / input.bpm;
          const jitter = input.jitterMs ? (Math.random() * 2 - 1) * input.jitterMs : 0;
          nextBeat = t + Math.max(300, base + jitter);
        }

        const sleepMs = Math.max(10, Math.min(nextPresence, nextBeat) - now());
        await sleep(sleepMs);
      }
    }),
});
