import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from '../../schema';

export const authTokens = pgTable('auth_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  token: text('token').notNull(),
  type: text('type').default('login_code'),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export type AuthToken = typeof authTokens.$inferSelect;
export type NewAuthToken = typeof authTokens.$inferInsert;
