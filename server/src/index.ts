import { fastifyTRPCOpenApiPlugin, generateOpenApiDocument } from '@9or9/trpc-openapi';
import fastifyBasicAuth from '@fastify/basic-auth';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import oauthPlugin from '@fastify/oauth2';
import rateLimit from '@fastify/rate-limit';
import ScalarApiReference from '@scalar/fastify-api-reference';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';
import { renderTrpcPanel } from 'trpc-ui';
import pkg from '../package.json' assert { type: 'json' };
import { env } from './env';
import { setLogger } from './logger';
import { appRouter } from './router/_app';
import { createContext } from './trpc';
const isDev = env.NODE_ENV === 'development';
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
  bodyLimit: 3 * 1024 * 1024, // 3 MB
});
setLogger(fastify.log);
async function main() {
  await fastify.register(helmet, {
    contentSecurityPolicy:
      isDev || env.NODE_ENV === 'preview'
        ? {
            directives: {
              ...helmet.contentSecurityPolicy.getDefaultDirectives(),
              'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
              // 'connect-src': ["'self'", 'http://localhost:*'],
            },
          }
        : true,
  });
  await fastify.register(cookie, { secret: env.SESSION_SECRET ?? 'secret' });
  await fastify.register(oauthPlugin, {
    name: 'githubOauth',
    scope: ['user:email'],
    credentials: {
      client: { id: env.GITHUB_CLIENT_ID ?? '', secret: env.GITHUB_CLIENT_SECRET ?? '' },
      auth: oauthPlugin.GITHUB_CONFIGURATION,
    },
    startRedirectPath: '/auth/github',
    callbackUri: `${env.BASE_URL}/auth/github/callback`,
  });
  await fastify.register(oauthPlugin, {
    name: 'googleOauth',
    scope: ['openid', 'email', 'profile'],
    credentials: {
      client: { id: env.GOOGLE_CLIENT_ID ?? '', secret: env.GOOGLE_CLIENT_SECRET ?? '' },
      auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/auth/google',
    callbackUri: `${env.BASE_URL}/auth/google/callback`,
  });
  await fastify.register(cors, {
    origin: (origin, cb) => {
      const isPreview = origin?.includes('.netlify.app') && env.NODE_ENV === 'preview';
      if (isDev || isPreview) {
        cb(null, true);
        return;
      }
      const allowedOrigin = env.FRONTEND_ORIGIN;

      if (!origin || origin === allowedOrigin) {
        cb(null, true);
      } else {
        fastify.log.warn(`❌ CORS blocked origin: ${origin}`);
        cb(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
  });
  await fastify.register(rateLimit, {
    max: 10, // 🔥 Allow 3 requests
    timeWindow: '1 minute', // 🕒 per minute
    keyGenerator: (req) => (req.headers['x-api-key'] as string) ?? req.ip,
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
  await fastify.register(fastifyTRPCOpenApiPlugin, {
    router: appRouter,
    prefix: '/api',
    createContext,
  });
  await fastify.register(fastifyBasicAuth, {
    validate: (username, password, req, reply, done) => {
      const USER = env.PANEL_USER;
      const PASS = env.PANEL_PASS;
      if (username === USER && password === PASS) {
        done();
      } else {
        done(new Error('Unauthorized'));
      }
    },
    authenticate: true,
  });

  const allowPanel = isDev || env.NODE_ENV === 'preview';
  if (allowPanel) {
    const baseUrl = env.NODE_ENV !== 'development' ? env.BASE_URL : 'http://localhost:3000';
    fastify.get('/openapi.json', (_req, reply) => {
      const openApiDoc = generateOpenApiDocument(appRouter, {
        title: 'My APIs',
        version: pkg.version,
        baseUrl: baseUrl + '/api',
        securitySchemes: {
          apiKeyHeader: {
            description: 'API key required for access',
            type: 'apiKey',
            name: 'X-API-KEY',
            in: 'header',
          },
        },
      });

      reply.header('Content-Type', 'application/json').send(openApiDoc);
    });
    if (!isDev) {
      await fastify.register(ScalarApiReference, {
        routePrefix: '/reference',
        configuration: {
          url: '/openapi.json',
          title: `${pkg.name} tRPC API`,
          layout: 'modern',
          theme: 'purple',
          darkMode: true,
          authentication: { preferredSecurityScheme: 'apiKeyHeader' },
        },
        hooks: {
          preHandler: fastify.basicAuth,
        },
      });
      fastify.after(() => {
        fastify.route({
          method: 'GET',
          url: '/panel',
          preHandler: fastify.basicAuth,
          handler: (_req, reply) => {
            reply.type('text/html').send(
              renderTrpcPanel(appRouter, {
                url: `/trpc`,
              }),
            );
          },
        });
      });
    } else {
      await fastify.register(ScalarApiReference, {
        routePrefix: '/reference',
        configuration: {
          url: '/openapi.json',
          title: `${pkg.name} tRPC API`,
          layout: 'modern',
          theme: 'purple',
          darkMode: true,
          authentication: { preferredSecurityScheme: 'apiKeyHeader' },
        },
      });
      fastify.get('/panel', (_req, reply) => {
        reply.type('text/html').send(
          renderTrpcPanel(appRouter, {
            url: `/trpc`,
          }),
        );
      });
    }
  }

  fastify.get('/', () => ({ status: '🚀 Server is running' }));

  await fastify.listen({ port: 3000, host: '0.0.0.0' });
  // eslint-disable-next-line no-console
  console.log('✅ Fastify + tRPC server running on http://localhost:3000');
  // eslint-disable-next-line no-console
  console.log(`🧩 tRPC router keys: ${Object.keys(appRouter._def.procedures).join(', ')}`);
}

await main();
