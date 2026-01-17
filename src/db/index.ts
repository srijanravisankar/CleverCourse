import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

// Database file path - stored in data directory
const DB_PATH = path.join(process.cwd(), "data", "clevercourse.db");

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
