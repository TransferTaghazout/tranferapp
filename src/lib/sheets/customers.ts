import { toMoney } from "@/lib/money";
import { generateId } from "@/lib/utils";
import { phoneMatchKey } from "@/lib/phone";
import { Customer, Reservation } from "@/lib/types";
import { CustomerInput } from "@/lib/validations";
import { cached, cacheClear } from "@/lib/sheets/cache";
import {
  appendValues,
  cell,
  getValues,
  SHEETS,
  updateValues,
} from "@/lib/sheets/client";
import { CUSTOMER_HEADERS } from "@/lib/sheets/columns";

function parseCustomer(row: string[]): Customer {
  return {
    id: cell(row, 0),
    name: cell(row, 1),
    phone: cell(row, 2),
    whatsapp: cell(row, 3),
    country: cell(row, 4),
    email: cell(row, 5),
    totalReservations: Number(cell(row, 6) || 0),
    totalSpent: toMoney(cell(row, 7)),
    lastReservation: cell(row, 8),
    notes: cell(row, 9),
  };
}

function toRow(customer: Customer): (string | number)[] {
  return [
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
  ];
}

async function readCustomerRows() {
  const values = await getValues(SHEETS.customers, "A:J");
  return values.slice(1).map((row, index) => ({
    rowNumber: index + 2,
    customer: parseCustomer(row.map(String)),
  }));
}

export async function getCustomers(): Promise<Customer[]> {
  return cached("customers:all", async () => {
    const rows = await readCustomerRows();
    return rows
      .map((r) => r.customer)
      .filter((c) => c.id)
      .sort((a, b) => b.lastReservation.localeCompare(a.lastReservation));
  });
}

export async function getCustomerById(id: string) {
  const customers = await getCustomers();
  return customers.find((item) => item.id === id) ?? null;
}

export async function findCustomerByPhone(phone: string) {
  if (!phone) return null;
  const key = phoneMatchKey(phone);
  const customers = await getCustomers();
  return (
    customers.find((customer) => phoneMatchKey(customer.phone) === key) ?? null
  );
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
  await appendValues(SHEETS.customers, [toRow(customer)]);
  cacheClear("customers");
  return customer;
}

export async function updateCustomer(id: string, input: Partial<Customer>) {
  const rows = await readCustomerRows();
  const match = rows.find((row) => row.customer.id === id);
  if (!match) throw new Error("Customer not found.");
  const customer = { ...match.customer, ...input, id };
  await updateValues(SHEETS.customers, `A${match.rowNumber}:J${match.rowNumber}`, [
    toRow(customer),
  ]);
  cacheClear("customers");
  return customer;
}

export async function syncCustomerFromReservations(phone: string) {
  if (!phone) return null;

  const { getReservations } = await import("@/lib/sheets/reservations");
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

  if (existing) {
    return updateCustomer(existing.id, payload);
  }
  await appendValues(SHEETS.customers, [toRow(payload)]);
  cacheClear("customers");
  return payload;
}

export function customerReservations(reservations: Reservation[], phone: string) {
  const key = phoneMatchKey(phone);
  return reservations
    .filter((item) => phoneMatchKey(item.phone) === key)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
}

export { CUSTOMER_HEADERS };
