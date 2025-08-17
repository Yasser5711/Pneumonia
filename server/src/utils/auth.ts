import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { apiKey, customSession, haveIBeenPwned } from 'better-auth/plugins';
import { emailHarmony } from 'better-auth-harmony';
import { eq } from 'drizzle-orm';

import { db, schemas } from '../db';
import { env } from '../env';
import { logger } from '../logger';
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
  trustedOrigins: (request) => {
    const origins = [env.FRONTEND_ORIGIN];

    const incoming = request.headers.get('origin') || request.headers.get('referer');
    if (incoming && /^https:\/\/deploy-preview-\d+--penumoniacnn\.netlify\.app$/.test(incoming)) {
      origins.push(incoming);
    }

    return origins;
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      mapProfileToUser(profile) {
        const nameParts = (profile.name || '').trim().split(/\s+/);
        return {
          firstName: nameParts[0] || '',
          lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
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
                  image: `https://ui-avatars.com/api/?name=${user.name.replace(/ /g, '+')}&background=random`,
                })
                .where(eq(schemas.users.id, user.id));
            } catch (error) {
              logger().error(`Failed to update image:, ${error}`);
            }
          }
        },
      },
      update: {
        after: async (user) => {
          if (!user.image) {
            try {
              await db
                .update(schemas.users)
                .set({
                  image: `https://ui-avatars.com/api/?name=${user.name.replace(/ /g, '+')}&background=random`,
                })
                .where(eq(schemas.users.id, user.id));
            } catch (error) {
              logger().error(`Failed to update image:, ${error}`);
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
              logger().error(`Failed to update last login info:, ${error}`);
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
    useSecureCookies: env.NODE_ENV !== 'development',
    ipAddress: {
      ipAddressHeaders: ['x-client-ip', 'x-forwarded-for'],
      disableIpTracking: false,
    },
    cookies: {
      session_token: {
        attributes: {
          path: '/',
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        },
      },
      session_data: {
        attributes: {
          path: '/',
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        },
      },
      dont_remember: {
        attributes: {
          path: '/',
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        },
      },
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
    haveIBeenPwned({
      customPasswordCompromisedMessage: 'Please choose a more secure password.',
    }),
    emailHarmony(),
  ],
});
export type Auth = typeof auth;
