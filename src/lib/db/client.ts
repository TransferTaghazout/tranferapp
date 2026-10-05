import { Pool, type PoolConfig } from "pg";

let pool: Pool | null = null;
let schemaReady = false;
let connecting: Promise<Pool> | null = null;

const DEFAULT_DATABASE_URL =
  "postgres://ahmad:ahmad123@transfer_mytransferapp:5432/transferapp?sslmode=disable";

type DbTarget = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
};

export function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const host = process.env.POSTGRES_HOST || process.env.DB_HOST;
  const user = process.env.POSTGRES_USER || process.env.DB_USER;
  const password = process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD;
  const database = process.env.POSTGRES_DB || process.env.DB_NAME;
  const port = process.env.POSTGRES_PORT || process.env.DB_PORT || "5432";
  if (host && user && password && database) {
    return `postgres://${user}:${password}@${host}:${port}/${database}?sslmode=disable`;
  }
  return DEFAULT_DATABASE_URL;
}

export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl());
}

function parseDatabaseUrl(raw: string): DbTarget {
  const match = raw.match(
    /^postgres(?:ql)?:\/\/([^:/?#]+):([^@/?#]+)@(\[[^\]]+\]|[^:/?#]+):(\d+)\/([^?]+)/i,
  );
  if (match) {
    return {
      user: decodeURIComponent(match[1]),
      password: decodeURIComponent(match[2]),
      host: match[3],
      port: Number(match[4]),
      database: decodeURIComponent(match[5].replace(/\/$/, "")),
      ssl: /sslmode=require/i.test(raw),
    };
  }
  throw new Error("Invalid DATABASE_URL.");
}

function candidateHosts(primary: string) {
  const hosts = [primary, process.env.POSTGRES_HOST, process.env.DB_HOST].filter(
    (host): host is string => Boolean(host),
  );
  return [...new Set(hosts)];
}

function makePool(target: DbTarget): Pool {
  const config: PoolConfig = {
    host: target.host,
    port: target.port,
    user: target.user,
    password: target.password,
    database: target.database,
    ssl: target.ssl ? { rejectUnauthorized: false } : false,
    max: 8,
    connectionTimeoutMillis: 8000,
  };
  return new Pool(config);
}

export async function getConnectedPool() {
  if (pool) return pool;
  if (connecting) return connecting;
  connecting = (async () => {
    const base = parseDatabaseUrl(getDatabaseUrl());
    let lastError: Error | null = null;
    for (const host of candidateHosts(base.host)) {
      const next = makePool({ ...base, host });
      try {
        await next.query("SELECT 1");
        pool = next;
        return next;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        await next.end().catch(() => undefined);
      }
    }
    throw lastError || new Error("Database connection unavailable.");
  })();
  try {
    return await connecting;
  } catch (error) {
    connecting = null;
    throw error;
  }
}

export function getPool() {
  if (pool) return pool;
  pool = makePool(parseDatabaseUrl(getDatabaseUrl()));
  return pool;
}

export function friendlyDbError(error: Error | null) {
  const message = error?.message || "Database connection unavailable.";
  if (message.includes("ENOTFOUND") || message.includes("getaddrinfo")) {
    return "Database host could not be reached. Set DATABASE_URL to the Postgres External host and port.";
  }
  if (message.includes("ECONNREFUSED")) {
    return "Postgres refused the connection. Check that the database service is running.";
  }
  if (message.toLowerCase().includes("password") || message.includes("28P01")) {
    return "Database username or password is incorrect.";
  }
  if (message.includes("timeout")) {
    return "Database connection timed out.";
  }
  if (message.includes("does not exist")) {
    return "Database transferapp does not exist.";
  }
  return "Database connection unavailable.";
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
) {
  await ensureSchema();
  const result = await (await getConnectedPool()).query(text, params);
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
  driver_commission NUMERIC NOT NULL DEFAULT 0,
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
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS driver_commission NUMERIC NOT NULL DEFAULT 0;
`

export async function ensureSchema() {
  if (schemaReady) return { created: [] as string[] };
  const client = await getConnectedPool();
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
    missing: [] as string[],
  };
}
