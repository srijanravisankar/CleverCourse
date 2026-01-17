import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Database file path - stored in data directory
const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "clevercourse.db");

// Ensure the data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Create the SQLite database instance
const sqlite = new Database(DB_PATH);

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

// Create the Drizzle ORM instance with schema
export const db = drizzle(sqlite, { schema });

// Export the raw sqlite instance for advanced operations if needed
export { sqlite };

// Export schema for type inference
export * from "./schema";
