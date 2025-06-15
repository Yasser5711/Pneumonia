import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
export const apiKeysTable = pgTable(
  'api_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    hashedKey: text('hashed_key').notNull().unique(), // hashed API key
    keyPrefix: varchar('key_prefix', { length: 12 }).notNull().unique(), // first 12 characters of the API key
    name: text('name').notNull(), // e.g., "Admin Panel" or "CLI Token"
    active: boolean('active').default(true),
    freeRequestsQuota: integer('free_requests_quota').notNull().default(10),
    freeRequestsUsed: integer('free_requests_used').notNull().default(0),
    freeQuotaResetAt: timestamp('free_quota_reset_at'),
    description: text('description'), // optional description for the API key
    lastUsedAt: timestamp('last_used_at'), // optional last used timestamp
    lastUsedIp: text('last_used_ip'), // optional last used IP address
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at'), // 10 days from now
    updatedAt: timestamp('last_updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('key_prefix_idx').on(table.keyPrefix)],
);
