import { sql } from 'drizzle-orm';
import { pgTable, index } from 'drizzle-orm/pg-core';
export const users = pgTable(
  'users',
  (t) => ({
    id: t.uuid('id').defaultRandom().primaryKey(),
    name: t.text('name').generatedAlwaysAs(sql`concat(first_name, ' ', last_name)`),
    firstName: t.text('first_name').notNull(),
    lastName: t.text('last_name').notNull(),
    email: t.text('email').notNull().unique(),
    emailVerified: t
      .boolean('email_verified')
      .$defaultFn(() => false)
      .notNull(),
    image: t
      .text('image')
      .$defaultFn(() => `https://ui-avatars.com/api/?name=${sql`name`}&background=random`),
    createdAt: t
      .timestamp('created_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: t
      .timestamp('updated_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  }),
  (table) => [index('email_idx').on(table.email)],
);

export const sessions = pgTable(
  'sessions',
  (t) => ({
    id: t.uuid('id').defaultRandom().primaryKey(),
    expiresAt: t.timestamp('expires_at').notNull(),
    token: t.text('token').notNull().unique(),
    createdAt: t.timestamp('created_at').notNull(),
    updatedAt: t.timestamp('updated_at').notNull(),
    ipAddress: t.text('ip_address'),
    userAgent: t.text('user_agent'),
    userId: t
      .uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  }),
  (table) => [index('session_user_id_idx').on(table.userId), index('token_idx').on(table.token)],
);

export const accounts = pgTable(
  'accounts',
  (t) => ({
    id: t.uuid('id').defaultRandom().primaryKey(),
    accountId: t.text('account_id').notNull(),
    providerId: t.text('provider_id').notNull(),
    userId: t
      .uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: t.text('access_token'),
    refreshToken: t.text('refresh_token'),
    idToken: t.text('id_token'),
    accessTokenExpiresAt: t.timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: t.timestamp('refresh_token_expires_at'),
    scope: t.text('scope'),
    password: t.text('password'),
    createdAt: t.timestamp('created_at').notNull(),
    updatedAt: t.timestamp('updated_at').notNull(),
  }),
  (table) => [index('account_user_id_idx').on(table.userId)],
);

export const verifications = pgTable(
  'verifications',
  (t) => ({
    id: t.uuid('id').defaultRandom().primaryKey(),
    identifier: t.text('identifier').notNull(),
    value: t.text('value').notNull(),
    expiresAt: t.timestamp('expires_at').notNull(),
    createdAt: t.timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: t.timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()),
  }),
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);
