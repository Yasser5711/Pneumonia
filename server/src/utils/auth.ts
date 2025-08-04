import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { apiKey, customSession } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { logger } from 'src/logger';

import { db, schemas } from '../db';
import { env } from '../env';

export const auth = betterAuth({
  appName: 'Pneumonia',
  basePath: '/api/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      users: schemas.users,
      sessions: schemas.sessions,
      accounts: schemas.accounts,
      verifications: schemas.verifications,
      apikeys: schemas.apiKeys,
    },
    usePlural: true,
    debugLogs: env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
  }),
  user: {
    additionalFields: {
      firstName: { type: 'string', required: true },
      lastName: { type: 'string', required: true },
      requestsQuota: { type: 'number', default: 10, input: false },
      requestsUsed: { type: 'number', default: 0, input: false },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [env.FRONTEND_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      mapProfileToUser(profile) {
        return {
          firstName: profile.name?.split(' ')[0] || '',
          lastName: profile.name?.split(' ')[1] || '',
          image: profile.avatar_url,
        };
      },
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: (profile) => ({
        firstName: profile.given_name,
        lastName: profile.family_name,
        image: profile.picture,
      }),
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (!user.image) {
            try {
              await db
                .update(schemas.users)
                .set({
                  image: `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`,
                })
                .where(eq(schemas.users.id, user.id));
            } catch (error) {
              logger().error('Failed to update image:', error);
            }
          }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          if (session.userId) {
            try {
              await db
                .update(schemas.users)
                .set({
                  lastLoginAt: new Date(),
                })
                .where(eq(schemas.users.id, session.userId));
            } catch (error) {
              logger().error('Failed to update last login info:', error);
            }
          }
        },
      },
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
    useSecureCookies: env.NODE_ENV === 'production',
    ipAddress: {
      ipAddressHeaders: ['x-client-ip', 'x-forwarded-for'],
      disableIpTracking: false,
    },
  },
  plugins: [
    apiKey({
      apiKeyHeaders: ['x-api-key'],
      defaultKeyLength: 43,
      disableKeyHashing: true,
      rateLimit: {
        enabled: false,
      },
    }),
    // eslint-disable-next-line require-await
    customSession(async ({ session }) => ({
      isAuthenticated: !!session,
      userId: session?.userId,
    })),
  ],
});
export type Auth = typeof auth;
