/* eslint-disable no-console */
import { config } from 'dotenv';
import { apiKeysRepo } from '../src/db/repositories/apiKey.repository';
import { hashApiKey } from '../src/utils/hash';

config();

async function seedDevApiKey() {
  const rawKey = 'dev-1234567890abcdef';
  const prefix = rawKey.slice(0, 12);
  const secretPart = rawKey.slice(12);

  const hashed = await hashApiKey(secretPart);

  const existing = await apiKeysRepo.findByPrefix(prefix);
  if (existing && existing.length > 0) {
    console.log(`✅ Dev API key already exists (prefix: ${prefix})`);
    return;
  }

  await apiKeysRepo.create({
    name: 'Dev CLI Key',
    description: 'Used in local development',
    keyPrefix: prefix,
    hashedKey: hashed,
    active: true,
  });

  console.log(`✅ Dev API key seeded:\n➡️  ${rawKey}`);
}

seedDevApiKey()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
