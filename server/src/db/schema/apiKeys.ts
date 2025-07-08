import { relations } from 'drizzle-orm';
import { pgTable, uniqueIndex } from 'drizzle-orm/pg-core';

import { usersTable } from './users';
export const apiKeysTable = pgTable(
  'api_keys',
  (t) => ({
    id: t.uuid('id').defaultRandom().primaryKey(),
    hashedKey: t.text('hashed_key').notNull().unique(), // hashed API key
    keyPrefix: t.varchar('key_prefix', { length: 12 }).notNull().unique(), // first 12 characters of the API key
    name: t.text('name').notNull(), // e.g., "Admin Panel" or "CLI Token"
    userId: t
      .uuid('user_id')
      .references(() => usersTable.id)
      .notNull(),
    active: t.boolean('active').default(true),
    freeRequestsQuota: t.integer('free_requests_quota').notNull().default(10),
    freeRequestsUsed: t.integer('free_requests_used').notNull().default(0),
    freeQuotaResetAt: t.timestamp('free_quota_reset_at'),
    description: t.text('description'), // optional description for the API key
    lastUsedAt: t.timestamp('last_used_at'), // optional last used timestamp
    lastUsedIp: t.text('last_used_ip'), // optional last used IP address
    createdAt: t.timestamp('created_at').defaultNow(),
    expiresAt: t.timestamp('expires_at'), // 10 days from now
    updatedAt: t
      .timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  }),
  (table) => [uniqueIndex('key_prefix_idx').on(table.keyPrefix)],
);
export const apiKeysRelations = relations(apiKeysTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [apiKeysTable.userId],
    references: [usersTable.id],
  }),
}));
