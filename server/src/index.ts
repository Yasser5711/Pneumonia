import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import * as dotenv from 'dotenv';
import Fastify from 'fastify';
import { appRouter } from './router/_app';
import { createContext } from './trpc';
// eslint-disable-next-line no-unused-vars
const _isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV !== 'production';
dotenv.config();

const fastify = Fastify({
  logger: isDev
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : true, // raw JSON logs in prod
  bodyLimit: 10 * 1024 * 1024, // 10 MB
});

async function main() {
  await fastify.register(cors, {
    origin: (origin, cb) => {
      //   const allowedOrigin = isProd
      //     ? process.env.FRONTEND_ORIGIN // e.g. https://app.myfrontend.com
      //     : "http://localhost:5173"; // or whatever your local port is
      const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

      if (!origin || origin === allowedOrigin) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed'), false);
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

  fastify.get('/', async () => ({ status: '🚀 Server is running' }));

  await fastify.listen({ port: 3000 });
  console.log('✅ Fastify + tRPC server running on http://localhost:3000');
  console.log('🧩 tRPC router keys:', Object.keys(appRouter._def.procedures));
}

main();
