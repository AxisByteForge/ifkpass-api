import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  index,
  uniqueIndex,
  jsonb
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    // Primary Key
    id: uuid('id').primaryKey().defaultRandom(),

    // Auth & Login Data
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    cpf: varchar('cpf', { length: 20 }),
    phone: varchar('phone', { length: 20 }),

    // Profile Data
    birthDate: timestamp('birth_date'),
    city: varchar('city', { length: 255 }),
    dojo: varchar('dojo', { length: 255 }),
    rank: varchar('rank', { length: 255 }),
    sensei: varchar('sensei', { length: 255 }),
    photoUrl: varchar('photo_url', { length: 500 }),

    // Payment Data
    cardId: varchar('card_id', { length: 255 }),
    paymentDetails: jsonb('payment_details'),

    // Status & Control
    status: varchar('status', { length: 50 }).notNull().default('pending'), // pending | approved | rejected

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
    index('users_status_idx').on(table.status),
    index('users_created_at_idx').on(table.createdAt)
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
