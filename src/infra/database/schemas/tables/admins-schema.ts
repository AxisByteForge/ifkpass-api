import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';

export const admins = pgTable(
  'admins',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    cpf: varchar('cpf', { length: 20 }),
    phone: varchar('phone', { length: 20 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    uniqueIndex('admins_email_idx').on(table.email),
    index('admins_created_at_idx').on(table.createdAt)
  ]
);

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
