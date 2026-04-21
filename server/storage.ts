import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

// Use /tmp for Railway/cloud environments (writable), fallback to local
const dbPath = process.env.NODE_ENV === "production" ? "/tmp/mlb-analytics.db" : "mlb-analytics.db";
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations inline
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS weather_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_pk INTEGER NOT NULL,
    fetched_at TEXT NOT NULL,
    temp_f REAL,
    wind_mph REAL,
    wind_dir_deg REAL,
    wind_dir_relative TEXT,
    humidity_pct REAL,
    precip_pct REAL,
    conditions TEXT,
    is_dome_closed INTEGER NOT NULL DEFAULT 0
  );
`);

export interface IStorage {
  // placeholder for future persistence
}

export class Storage implements IStorage {}
export const storage = new Storage();
