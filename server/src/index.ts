import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';

import { renderTrpcPanel } from 'trpc-ui';
import { env } from './env';
import { setLogger } from './logger';

import { appRouter } from './router/_app';
import { createContext } from './trpc';
const isDev = env.NODE_ENV !== 'production';

const fastify = Fastify({
  logger: isDev
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            colorize: true,
          },
        },
      }
    : true, // raw JSON logs in prod
  bodyLimit: 10 * 1024 * 1024, // 10 MB
});
setLogger(fastify.log);
async function main() {
  await fastify.register(cors, {
    origin: (origin, cb) => {
      const isPreview = origin?.includes('.netlify.app');
      if (isDev || isPreview) {
        cb(null, true);
        return;
      }
      const allowedOrigin = env.FRONTEND_ORIGIN || 'http://localhost:3000';

      if (!origin || origin === allowedOrigin) {
        cb(null, true);
      } else {
        fastify.log.warn(`❌ CORS blocked origin: ${origin}`);
        cb(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
  });
  await fastify.register(rateLimit, {
    max: 10, // 🔥 Allow 10 requests
    timeWindow: '1 minute', // 🕒 per minute
    errorResponseBuilder: () => {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Slow down there, buddy 🚦',
      };
    },
  });
  fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  });
  if (isDev) {
    fastify.get('/panel', (_req, reply) => {
      reply.type('text/html').send(
        renderTrpcPanel(appRouter, {
          url: `/trpc`,
        }),
      );
    });
  }

  fastify.get('/', async () => ({ status: '🚀 Server is running' }));

  await fastify.listen({ port: 3000, host: '0.0.0.0' });
  // eslint-disable-next-line no-console
  console.log('✅ Fastify + tRPC server running on http://localhost:3000');
  // eslint-disable-next-line no-console
  console.log(`🧩 tRPC router keys: ${Object.keys(appRouter._def.procedures).join(', ')}`);
}

main();
