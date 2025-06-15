/* eslint-disable no-console */
import { db } from '../src/db';

void (async () => {
  try {
    const result = await db.execute(
      `UPDATE api_keys SET active = false WHERE active = true AND expires_at IS NOT NULL AND expires_at < NOW() RETURNING id`,
    );
    console.log(`✅ Deactivated ${result.length ?? 0} expired keys`);
  } catch (err) {
    console.error('❌ Failed to deactivate expired keys:', err);
    process.exit(1);
  }
})();
