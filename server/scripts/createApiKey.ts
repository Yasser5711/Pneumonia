/* eslint-disable no-console */
import { apiKeyService } from '../src/db/services/';

import { db } from '../src/db';
db;
const [, , name, ...descParts] = process.argv;
const description = descParts.join(' ');

if (!name) {
  console.error('❌ Usage: yarn api-key:create <name> [description]');
  process.exit(1);
}

void (async () => {
  try {
    const key = await apiKeyService.generateKey({ name, description });
    console.log('\n✅ API key created successfully:\n');
    console.log('🔑 Save this key securely — it will not be shown again!\n');
    console.log(`➡️  ${key.key}\n`);
    console.log(`📅 Key created on: ${new Date().toISOString()}\n`);
    console.log(`📝 Name: ${key.meta.name}\n`);
    console.log(`📜 Description: ${key.meta.description || 'No description provided'}\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create API key:', error);
    process.exit(1);
  }
})();
