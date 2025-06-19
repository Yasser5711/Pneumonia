import { pgEnum, pgTable, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
export const providerEnum = pgEnum('provider', ['github', 'google', 'guest']);

export const usersTable = pgTable(
  'users',
  (t) => ({
    id: t.uuid('id').primaryKey().defaultRandom(),
    email: t.text('email').unique(),
    provider: providerEnum('provider').notNull(),
    providerId: t.text('provider_id').notNull(),
    createdAt: t.timestamp('created_at').defaultNow(),
    lastLogin: t.timestamp('last_login'),
    guestLastRequest: t.timestamp('guest_last_request'),
  }),
  (table) => [
    uniqueIndex('emailUniqueIndex').on(sql`lower(${table.email})`),
    uniqueIndex('providerProviderIdUniqueIndex').on(
      sql`lower(${table.provider})`,
      sql`lower(${table.providerId})`,
    ),
  ],
);
