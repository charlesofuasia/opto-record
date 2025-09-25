// src/lib/db.ts
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is not set. Please create a .env.local file with DATABASE_URL."
  );
}

let pool: InstanceType<typeof Pool>;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} catch (error) {
  console.error("❌ Failed to initialize Postgres Pool:", error);
  throw error;
}

export default pool;
