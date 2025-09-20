"use server";

import { Pool } from "pg";
import { readFileSync } from "fs";
import path from "path";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function resetDatabase() {
  const client = await pool.connect();
  try {
    const schemaSQL = readFileSync(path.join(process.cwd(), "database", "schema.sql"), "utf-8");
    const seedSQL = readFileSync(path.join(process.cwd(), "database", "seed.sql"), "utf-8");

    await client.query(schemaSQL);
    await client.query(seedSQL);
  } finally {
    client.release();
  }
}

