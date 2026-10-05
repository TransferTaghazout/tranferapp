import { generateId } from "@/lib/utils";
import { hashPassword, verifyPassword } from "@/lib/db/password";
import { query, queryOne } from "@/lib/db/client";
import { Driver } from "@/lib/types";

type DriverRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  password_hash: string;
  active: boolean;
};

function mapDriver(row: DriverRow): Driver {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    active: row.active,
  };
}

export async function getDrivers(): Promise<Driver[]> {
  const rows = await query<DriverRow>(
    "SELECT id, name, phone, email, password_hash, active FROM drivers ORDER BY name",
  );
  return rows.map(mapDriver);
}

export async function getActiveDrivers() {
  return (await getDrivers()).filter((driver) => driver.active);
}

export async function getDriverById(id: string) {
  const row = await queryOne<DriverRow>(
    "SELECT id, name, phone, email, password_hash, active FROM drivers WHERE id = $1",
    [id],
  );
  return row ? mapDriver(row) : null;
}

export async function findDriverByLogin(login: string) {
  const value = login.trim().toLowerCase();
  const digits = login.replace(/\D/g, "").slice(-9);
  const row = await queryOne<DriverRow>(
    `SELECT id, name, phone, email, password_hash, active FROM drivers
     WHERE lower(email) = $1
        OR regexp_replace(phone, '\\D', '', 'g') LIKE $2
     LIMIT 1`,
    [value, `%${digits || "none"}%`],
  );
  return row;
}

export async function createDriver(input: {
  name: string;
  phone: string;
  email: string;
  password: string;
  active?: boolean;
}) {
  const driver: Driver = {
    id: generateId("DRV"),
    name: input.name,
    phone: input.phone,
    email: input.email,
    active: input.active ?? true,
  };
  const passwordHash = await hashPassword(input.password);
  await query(
    `INSERT INTO drivers (id, name, phone, email, password_hash, active)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [driver.id, driver.name, driver.phone, driver.email, passwordHash, driver.active],
  );
  return driver;
}

export async function updateDriver(
  id: string,
  input: {
    name: string;
    phone: string;
    email: string;
    password?: string;
    active?: boolean;
  },
) {
  if (input.password) {
    const passwordHash = await hashPassword(input.password);
    await query(
      `UPDATE drivers SET name=$2, phone=$3, email=$4, password_hash=$5, active=$6, updated_at=NOW()
       WHERE id=$1`,
      [id, input.name, input.phone, input.email, passwordHash, input.active ?? true],
    );
  } else {
    await query(
      `UPDATE drivers SET name=$2, phone=$3, email=$4, active=$5, updated_at=NOW()
       WHERE id=$1`,
      [id, input.name, input.phone, input.email, input.active ?? true],
    );
  }
  return getDriverById(id);
}

export async function authenticateDriver(login: string, password: string) {
  const row = await findDriverByLogin(login);
  if (!row || !row.active) return null;
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return null;
  return mapDriver(row);
}
