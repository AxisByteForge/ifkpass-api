import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/infra/database/schemas/index';

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create the connection
const client = postgres(databaseUrl);

// Create the Drizzle instance with schema
export const db = drizzle(client, { schema });

export type Database = typeof db;
