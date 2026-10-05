import { Pool } from "pg";

let pool: Pool | null = null;
let schemaReady = false;

export function getDatabaseUrl() {
  return process.env.DATABASE_URL || "";
}

export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl());
}

export function getPool() {
  if (!isDatabaseConfigured()) {
    throw new Error("Database connection unavailable.");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: getDatabaseUrl().includes("sslmode=require") ? { rejectUnauthorized: false } : false,
      max: 8,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
) {
  await ensureSchema();
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export async function queryOne<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  number_of_people INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL,
  service_name TEXT NOT NULL DEFAULT '',
  pickup_location TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  commission NUMERIC NOT NULL DEFAULT 0,
  profit NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'MAD',
  status TEXT NOT NULL DEFAULT 'Confirmed',
  payment_status TEXT NOT NULL DEFAULT 'Unpaid',
  description TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT '',
  driver TEXT NOT NULL DEFAULT '',
  driver_id TEXT REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle TEXT NOT NULL DEFAULT '',
  flight_number TEXT NOT NULL DEFAULT '',
  booking_source TEXT NOT NULL DEFAULT 'APP',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  total_reservations INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  last_reservation TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  default_price NUMERIC NOT NULL DEFAULT 0,
  default_cost NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  business_name TEXT NOT NULL,
  currency TEXT NOT NULL,
  timezone TEXT NOT NULL,
  default_currency TEXT NOT NULL,
  whatsapp_country_code TEXT NOT NULL,
  driver_whatsapp TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS reservations_date_idx ON reservations(date);
CREATE INDEX IF NOT EXISTS reservations_driver_idx ON reservations(driver_id);

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS commission NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS driver_id TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS driver TEXT NOT NULL DEFAULT '';
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS pickup_location TEXT NOT NULL DEFAULT '';
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS destination TEXT NOT NULL DEFAULT '';
`

export async function ensureSchema() {
  if (schemaReady) return { created: [] as string[] };
  const client = getPool();
  await client.query(SCHEMA_SQL);
  await client.query(
    `INSERT INTO settings (id, business_name, currency, timezone, default_currency, whatsapp_country_code, driver_whatsapp)
     VALUES (1, 'Atlas Coast Travel', 'MAD', 'Africa/Casablanca', 'MAD', '212', '')
     ON CONFLICT (id) DO NOTHING`,
  );
  schemaReady = true;
  return { created: ["database tables"] };
}

export function dbStatus() {
  return {
    configured: isDatabaseConfigured(),
    missing: !process.env.DATABASE_URL ? ["DATABASE_URL"] : [],
  };
}
