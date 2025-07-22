import { eq, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

import { db as DB } from '../index';
// Importing the new 'users' table and apiKeys from the 'auth' schema file.
import { users as usersTable, apiKeys as apiKeysTable } from '../schema/auth';

import type * as schema from '../schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Define types for better type safety
type DrizzleDB = PostgresJsDatabase<typeof schema>;
export type User = InferSelectModel<typeof usersTable>;
export type UserInsert = InferInsertModel<typeof usersTable>;

/* istanbul ignore next */
/**
 * Repository for the new 'users' table managed by better-auth.
 */
export const createNewUsersRepo = (db: DrizzleDB = DB) => ({
  /**
   * Finds a user by their ID, optionally including their API keys.
   * @param id - The UUID of the user.
   * @param includeApiKeys - Whether to include the user's API keys in the result.
   */
  findById: async (id: string, includeApiKeys: boolean = false) => {
    return await db.query.users.findFirst({
      where: eq(usersTable.id, id),
      with: {
        // Relations must be defined in the schema (as you provided)
        apiKeys: includeApiKeys ? { where: eq(apiKeysTable.enabled, true) } : undefined,
      },
    });
  },

  /**
   * Finds a user by their email address.
   * @param email - The email of the user.
   */
  findByEmail: async (email: string): Promise<User | undefined> => {
    return await db.query.users.findFirst({
      where: eq(usersTable.email, email),
    });
  },

  /**
   * Updates user details. Note: Authentication details (like email or password hashes)
   * should generally be handled by better-auth functions.
   * @param id - The UUID of the user.
   * @param updates - The fields to update (e.g., firstName, lastName, image).
   */
  update: async ({
    id,
    updates,
  }: {
    id: string;
    updates: Partial<Omit<UserInsert, 'id' | 'email' | 'createdAt'>>;
  }): Promise<User | undefined> => {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        ...updates,
      })
      .where(eq(usersTable.id, id))
      .returning();

    return updatedUser;
  },
});
