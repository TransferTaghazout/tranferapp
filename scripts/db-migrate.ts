import { config } from "dotenv";
import { ensureSchema, getConnectedPool, getDatabaseUrl } from "../src/lib/db/client";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = new URL(getDatabaseUrl());
  console.log(`Connecting to ${url.hostname}:${url.port || "5432"} / ${url.pathname.replace("/", "")}`);
  await ensureSchema();
  const pool = await getConnectedPool();
  const tables = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`,
  );
  const counts = await pool.query(`
    SELECT
      (SELECT count(*) FROM drivers) AS drivers,
      (SELECT count(*) FROM reservations) AS reservations,
      (SELECT count(*) FROM customers) AS customers,
      (SELECT count(*) FROM services) AS services
  `);
  console.log("Tables:", tables.rows.map((row) => row.table_name).join(", "));
  console.log("Counts:", counts.rows[0]);
  console.log("PostgreSQL is ready.");
  await pool.end();
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Migration failed.";
  console.error(message);
  if (String(message).includes("ENOTFOUND") || String(message).includes("getaddrinfo")) {
    console.error(
      "Host transfer_mytransferapp is a Docker name. Run this on the server, or set DATABASE_URL to the published host/IP.",
    );
  }
  process.exit(1);
});
