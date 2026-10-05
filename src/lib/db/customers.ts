import { toMoney } from "@/lib/money";
import { generateId } from "@/lib/utils";
import { phoneMatchKey } from "@/lib/phone";
import { Customer, Reservation } from "@/lib/types";
import { CustomerInput } from "@/lib/validations";
import { query, queryOne } from "@/lib/db/client";

type CustomerRow = Record<string, unknown>;

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    phone: String(row.phone || ""),
    whatsapp: String(row.whatsapp || ""),
    country: String(row.country || ""),
    email: String(row.email || ""),
    totalReservations: Number(row.total_reservations || 0),
    totalSpent: toMoney(row.total_spent),
    lastReservation: String(row.last_reservation || ""),
    notes: String(row.notes || ""),
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const rows = await query("SELECT * FROM customers ORDER BY last_reservation DESC");
  return rows.map(mapCustomer);
}

export async function getCustomerById(id: string) {
  const row = await queryOne("SELECT * FROM customers WHERE id = $1", [id]);
  return row ? mapCustomer(row) : null;
}

export async function findCustomerByPhone(phone: string) {
  if (!phone) return null;
  const key = phoneMatchKey(phone);
  const customers = await getCustomers();
  return customers.find((customer) => phoneMatchKey(customer.phone) === key) ?? null;
}

export async function createCustomer(input: CustomerInput) {
  const existing = await findCustomerByPhone(input.phone);
  if (existing) return existing;
  const customer: Customer = {
    id: input.id || generateId("CUS"),
    name: input.name,
    phone: input.phone,
    whatsapp: input.whatsapp || input.phone,
    country: input.country || "",
    email: input.email || "",
    totalReservations: 0,
    totalSpent: 0,
    lastReservation: "",
    notes: input.notes || "",
  };
  await query(
    `INSERT INTO customers (id, name, phone, whatsapp, country, email, total_reservations, total_spent, last_reservation, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      customer.id,
      customer.name,
      customer.phone,
      customer.whatsapp,
      customer.country,
      customer.email,
      customer.totalReservations,
      customer.totalSpent,
      customer.lastReservation,
      customer.notes,
    ],
  );
  return customer;
}

export async function updateCustomer(id: string, input: Partial<Customer>) {
  const current = await getCustomerById(id);
  if (!current) throw new Error("Customer not found.");
  const customer = { ...current, ...input, id };
  await query(
    `UPDATE customers SET name=$2, phone=$3, whatsapp=$4, country=$5, email=$6,
      total_reservations=$7, total_spent=$8, last_reservation=$9, notes=$10
     WHERE id=$1`,
    [
      id,
      customer.name,
      customer.phone,
      customer.whatsapp,
      customer.country,
      customer.email,
      customer.totalReservations,
      customer.totalSpent,
      customer.lastReservation,
      customer.notes,
    ],
  );
  return customer;
}

export async function syncCustomerFromReservations(phone: string) {
  if (!phone) return null;
  const { getReservations } = await import("@/lib/db/reservations");
  const reservations = await getReservations();
  const related = reservations.filter(
    (item) => phoneMatchKey(item.phone) === phoneMatchKey(phone),
  );
  const latest = related
    .slice()
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))[0];
  const totals = related.reduce(
    (acc, item) => {
      if (item.status !== "Cancelled") {
        acc.spent += item.price;
        acc.count += 1;
      }
      return acc;
    },
    { spent: 0, count: 0 },
  );
  const existing = await findCustomerByPhone(phone);
  const payload: Customer = {
    id: existing?.id || generateId("CUS"),
    name: latest?.customerName || existing?.name || "",
    phone: latest?.phone || existing?.phone || phone,
    whatsapp: latest?.whatsapp || existing?.whatsapp || phone,
    country: existing?.country || "Morocco",
    email: existing?.email || "",
    totalReservations: totals.count,
    totalSpent: totals.spent,
    lastReservation: latest?.date || "",
    notes: existing?.notes || "",
  };
  if (!payload.name) return existing;
  if (existing) return updateCustomer(existing.id, payload);
  return createCustomer(payload);
}

export function customerReservations(reservations: Reservation[], phone: string) {
  const key = phoneMatchKey(phone);
  return reservations
    .filter((item) => phoneMatchKey(item.phone) === key)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
}
