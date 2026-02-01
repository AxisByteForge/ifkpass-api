import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infra/database/schemas/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || ''
  },
  verbose: true,
  strict: true,
  casing: 'snake_case'
});
