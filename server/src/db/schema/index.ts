export * from './apiKeys';
export * from './users';
export * from './auth';

import { users, sessions, accounts, verifications, apiKeys } from './auth';
export const authSchemas = {
  users,
  sessions,
  accounts,
  verifications,
  apiKeys,
};
