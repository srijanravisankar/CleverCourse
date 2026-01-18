import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Create the Turso/libSQL client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create the Drizzle ORM instance with schema
export const db = drizzle(client, { schema });

// Export the raw client for advanced operations if needed
export { client };

// Export schema for type inference
export * from "./schema";
