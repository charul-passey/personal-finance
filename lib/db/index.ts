import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "pace.db");

// Singleton in dev to survive hot-reloads
const globalForDb = globalThis as unknown as { _paceDb?: Database.Database };

if (!globalForDb._paceDb) {
  globalForDb._paceDb = new Database(DB_PATH);
  globalForDb._paceDb.pragma("journal_mode = WAL");
  globalForDb._paceDb.pragma("foreign_keys = ON");
}

const sqlite = globalForDb._paceDb;
export const db = drizzle(sqlite, { schema });
