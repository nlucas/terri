import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// ─── Connection ───────────────────────────────────────────────────
// Uses Supabase's connection pooler (Transaction mode, port 6543).
// In production this goes in DATABASE_URL as an environment variable.

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local');
}

// Disable prefetch for transaction pooler compatibility
const client = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });
