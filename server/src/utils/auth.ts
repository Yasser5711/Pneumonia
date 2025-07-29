import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { apiKey, customSession } from 'better-auth/plugins';

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
    debugLogs: true, // env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
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
      redirectURI: `${env.FRONTEND_ORIGIN}/github-callback`,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: (profile) => ({
        firstName: profile.given_name, // Google provides this
        lastName: profile.family_name, // Google provides this
        // // Fallback for name if you want
        // name: profile.name,
      }),
      // redirectURI: `${env.FRONTEND_ORIGIN}/chat`,
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
    // useSecureCookies: env.NODE_ENV === 'production', // ✅
    // defaultCookieAttributes: {
    //   sameSite: 'none', // ✅ cross‑origin
    //   secure: env.NODE_ENV === 'production', // ✅
    //   domain: undefined, // ✅ pas de .localhost
    // },
    // ipAddress: {
    //   ipAddressHeaders: ['x-client-ip', 'x-forwarded-for'],
    //   disableIpTracking: false,
    // },
    // useSecureCookies: env.NODE_ENV === 'production',
    // disableCSRFCheck: false,
    // cookies: {
    //   session_token: {
    //     name: 'custom_session_token',
    //     attributes: {
    //       httpOnly: true,
    //       secure: env.NODE_ENV === 'production',
    //       sameSite: 'none',
    //     },
    //   },
    // },
    // defaultCookieAttributes: {
    //   httpOnly: true,
    //   secure: env.NODE_ENV === 'production',
    //   sameSite: 'none',
    // },
  },
  plugins: [
    apiKey(),
    // eslint-disable-next-line require-await
    customSession(async ({ session }) => ({
      isAuthenticated: !!session,
      userId: session?.userId,
    })),
  ],
  // logger: logger,
});
export type auth = typeof auth;
