import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const apiKeysTable = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  hashedKey: text('hashed_key').notNull().unique(), // hashed API key
  name: text('name').notNull(), // e.g., "Admin Panel" or "CLI Token"
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // optional expiration
  active: boolean('active').default(true),
  description: text('description'), // optional description for the API key
  lastUsedAt: timestamp('last_used_at'), // optional last used timestamp
  lastUsedIp: text('last_used_ip'), // optional last used IP address
});
