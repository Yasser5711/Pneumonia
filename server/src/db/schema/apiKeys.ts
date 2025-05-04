import { boolean, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const apiKeysTable = pgTable(
  'api_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    hashedKey: text('hashed_key').notNull().unique(), // hashed API key
    keyPrefix: varchar('key_prefix', { length: 16 }).notNull().unique(), // first 12 characters of the API key
    name: text('name').notNull(), // e.g., "Admin Panel" or "CLI Token"
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at'), // optional expiration
    active: boolean('active').default(true),
    description: text('description'), // optional description for the API key
    lastUsedAt: timestamp('last_used_at'), // optional last used timestamp
    lastUsedIp: text('last_used_ip'), // optional last used IP address
  },
  (table) => [uniqueIndex('key_prefix_idx').on(table.keyPrefix)],
);
