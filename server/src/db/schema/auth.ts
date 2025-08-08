import { sql, relations } from 'drizzle-orm';
import { pgTable, index } from 'drizzle-orm/pg-core';
export const users = pgTable(
  'users',
  (t) => ({
    id: t.uuid('id').defaultRandom().primaryKey(),
    name: t
      .text('name')
      .generatedAlwaysAs(sql`concat(coalesce(first_name, ''), ' ', coalesce(last_name, ''))`),
    firstName: t.text('first_name').notNull(),
    lastName: t.text('last_name').notNull(),
    email: t.text('email').notNull().unique(),
    emailVerified: t
      .boolean('email_verified')
      .$defaultFn(() => false)
      .notNull(),
    normalizedEmail: t.text('normalized_email').unique(),
    image: t.text('image'),
    requestsQuota: t.integer('requests_quota').notNull().default(10),
    requestsUsed: t.integer('requests_used').notNull().default(0),
    lastLoginAt: t.timestamp('last_login_at'),
    lastLoginIp: t.text('last_login_ip'),
    createdAt: t
      .timestamp('created_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: t.timestamp('updated_at').$onUpdateFn(() => new Date()),
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
    updatedAt: t.timestamp('updated_at').$onUpdateFn(() => new Date()),
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
    updatedAt: t.timestamp('updated_at').$onUpdateFn(() => new Date()),
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
    updatedAt: t.timestamp('updated_at').$onUpdateFn(() => new Date()),
  }),
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);
export const apiKeys = pgTable('api_keys', (t) => ({
  id: t.uuid('id').defaultRandom().primaryKey(),
  name: t.text('name'),
  start: t.text('start'),
  prefix: t.text('prefix'),
  key: t.text('key').notNull(),
  userId: t
    .uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  refillInterval: t.integer('refill_interval'),
  refillAmount: t.integer('refill_amount'),
  lastRefillAt: t.timestamp('last_refill_at'),
  enabled: t.boolean('enabled').default(true),
  rateLimitEnabled: t.boolean('rate_limit_enabled').default(true),
  rateLimitTimeWindow: t.integer('rate_limit_time_window').default(86400000),
  rateLimitMax: t.integer('rate_limit_max').default(10),
  requestCount: t.integer('request_count'),
  remaining: t.integer('remaining'),
  lastRequest: t.timestamp('last_request'),
  expiresAt: t.timestamp('expires_at'),
  createdAt: t.timestamp('created_at').notNull(),
  updatedAt: t.timestamp('updated_at').$onUpdateFn(() => new Date()),
  permissions: t.text('permissions'),
  metadata: t.text('metadata'),
}));
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  apiKeys: many(apiKeys),
}));
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));
