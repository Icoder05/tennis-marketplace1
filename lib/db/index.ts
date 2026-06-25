import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy singleton. We do NOT create the connection at module load — that would
// require DATABASE_URL to exist at build time. It's created on first query and
// reused after, with a clear error if the env var is missing.
let _db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.local.");
  }
  _db = drizzle(neon(url), { schema });
  return _db;
}
