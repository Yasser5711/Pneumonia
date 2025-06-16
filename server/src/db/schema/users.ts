import { pgTable } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', (t) => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: t.varchar({ length: 255 }).notNull(),
  age: t.integer().notNull(),
  email: t.varchar({ length: 255 }).notNull().unique(),
  phone: t.varchar({ length: 20 }),
}));
