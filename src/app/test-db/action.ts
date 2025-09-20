import { Pool } from "pg";
import { readFileSync } from "fs";
import path from "path";

// Adjust connection string for your Neon/Postgres setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // put DATABASE_URL in .env.local
});

export async function resetDatabase() {
  const client = await pool.connect();
  try {
    // Load schema + seed files
    const schemaPath = path.join(process.cwd(), "database", "schema.sql");
    const seedPath = path.join(process.cwd(),"database", "seed.sql");

    const schemaSQL = readFileSync(schemaPath, "utf-8");
    const seedSQL = readFileSync(seedPath, "utf-8");

    console.log("🔄 Resetting database...");

    // Run schema first (drops + recreates)
    await client.query(schemaSQL);
    console.log("✅ Schema applied");

    // Run seed data
    await client.query(seedSQL);
    console.log("✅ Seed data inserted");

  } catch (err) {
    console.error("❌ Error resetting database:", err);
  } finally {
    client.release();
  }
}

// Allow running from CLI with: `ts-node action.ts`
if (require.main === module) {
  resetDatabase().then(() => {
    console.log("🎉 Database reset complete");
    process.exit(0);
  });
}
