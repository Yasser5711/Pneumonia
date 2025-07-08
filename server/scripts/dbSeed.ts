/* eslint-disable no-console */
import { config } from 'dotenv';

import { apiKeysRepo, usersRepo } from '../src/db/repositories/';
import { hashApiKey } from '../src/utils/hash';

config();

async function seedDevApiKey(): Promise<void> {
  const DEV_USER_EMAIL = 'dev-cli@system.local';
  let devUser = await usersRepo.findByProvider({
    provider: 'guest',
    providerId: DEV_USER_EMAIL,
  });
  if (!devUser) {
    console.log(`🔧 System user not found. Creating user: ${DEV_USER_EMAIL}`);
    const newUserResult = await usersRepo.create({
      email: DEV_USER_EMAIL,
      provider: 'guest',
      providerId: DEV_USER_EMAIL,
    });
    devUser = newUserResult[0];
    console.log(`✅ System user created successfully (ID: ${devUser.id})`);
  } else {
    console.log(`✅ System user already exists (ID: ${devUser.id})`);
  }

  const rawKey = process.env.API_KEY;
  if (!rawKey) {
    console.error('❌ API_KEY is not defined');
    process.exit(1);
  }
  const prefix = rawKey.slice(0, 12);
  const secretPart = rawKey.slice(12);

  const hashed = await hashApiKey(secretPart);

  const existing = await apiKeysRepo.findByPrefix(prefix);
  if (existing && existing.length > 0) {
    console.log(`✅ Dev API key already exists (prefix: ${prefix})`);
    await apiKeysRepo.updateExpiration({
      id: existing[0].id,
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    });
    console.log(`✅ Dev API key expiration updated (prefix: ${prefix})`);
    return;
  }

  await apiKeysRepo.create({
    name: 'Dev CLI Key',
    description: 'Used in local development',
    keyPrefix: prefix,
    hashedKey: hashed,
    active: true,
    userId: devUser.id,
  });

  console.log(`✅ Dev API key seeded:\n➡️  ${rawKey}`);
}

seedDevApiKey()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
