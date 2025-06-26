import { relations, sql } from 'drizzle-orm';
import { pgEnum, pgTable, uniqueIndex } from 'drizzle-orm/pg-core';
import { apiKeysTable } from './apiKeys';
export const providerEnum = pgEnum('provider', ['github', 'google']);

export const usersTable = pgTable(
  'users',
  (t) => ({
    id: t.uuid('id').defaultRandom().primaryKey(),
    email: t.text('email').unique(),
    provider: providerEnum('provider').notNull(),
    providerId: t.text('provider_id').notNull(),
    createdAt: t.timestamp('created_at').defaultNow(),
    lastLogin: t.timestamp('last_login'),
    updatedAt: t.timestamp('updated_at').$onUpdateFn(() => new Date()),
  }),
  (table) => [
    uniqueIndex('emailUniqueIndex').on(sql`lower(${table.email})`),
    uniqueIndex('providerProviderIdUniqueIndex').on(
      table.provider,
      sql`lower(${table.providerId})`,
    ),
  ],
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  apiKeys: many(apiKeysTable),
}));
