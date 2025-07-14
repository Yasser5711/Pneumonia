import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db, schemas } from '../db';
import { env } from '../env';
export const auth = betterAuth({
  appName: 'Pneumonia',
  basePath: '/api/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schemas,
    usePlural: true,
    debugLogs: env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
  }),
  user: {
    additionalFields: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
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
      redirectURI: `${env.FRONTEND_ORIGIN}/google-callback`,
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ['x-client-ip', 'x-forwarded-for'],
      disableIpTracking: false,
    },
    useSecureCookies: true,
    disableCSRFCheck: false,
    cookies: {
      session_token: {
        name: 'custom_session_token',
        attributes: {
          httpOnly: true,
          secure: true,
        },
      },
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    },
  },
  // logger: logger,
});
