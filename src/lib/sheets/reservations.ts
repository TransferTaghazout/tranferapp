import { calculateProfit, toMoney } from "@/lib/money";
import { compareTime, toSheetTimestamp } from "@/lib/dates";
import { generateId } from "@/lib/utils";
import {
  PaymentStatus,
  Reservation,
  ReservationStatus,
  ServiceType,
} from "@/lib/types";
import { ReservationInput } from "@/lib/validations";
import { cached, cacheClear } from "@/lib/sheets/cache";
import {
  appendValues,
  cell,
  deleteRow,
  getValues,
  SHEETS,
  updateValues,
} from "@/lib/sheets/client";
import { RESERVATION_HEADERS } from "@/lib/sheets/columns";
import { syncCustomerFromReservations } from "@/lib/sheets/customers";
import { upsertFinanceRow, deleteFinanceRow } from "@/lib/sheets/finance";

function parseReservation(row: string[], rowNumber: number): Reservation {
  return {
    id: cell(row, 0),
    createdAt: cell(row, 1),
    date: cell(row, 2),
    time: cell(row, 3),
    customerName: cell(row, 4),
    phone: cell(row, 5),
    whatsapp: cell(row, 6),
    numberOfPeople: Math.max(1, Number(cell(row, 7) || 1)),
    type: (cell(row, 8) || "Other") as ServiceType,
    serviceName: cell(row, 9),
    pickupLocation: cell(row, 10),
    destination: cell(row, 11),
    price: toMoney(cell(row, 12)),
    cost: toMoney(cell(row, 13)),
    profit: calculateProfit(toMoney(cell(row, 12)), toMoney(cell(row, 13))),
    currency: cell(row, 15) || "MAD",
    status: (cell(row, 16) || "Pending") as ReservationStatus,
    paymentStatus: (cell(row, 17) || "Unpaid") as PaymentStatus,
    description: cell(row, 18),
    internalNotes: cell(row, 19),
    driver: cell(row, 20),
    driverId: "",
    driverName: cell(row, 20),
    driverPhone: "",
    driverEmail: "",
    commission: toMoney(cell(row, 13)),
    vehicle: cell(row, 21),
    flightNumber: cell(row, 22),
    bookingSource: cell(row, 23) || "APP",
    updatedAt: cell(row, 24),
    ...({ _row: rowNumber } as object),
  };
}

function toRow(reservation: Reservation): (string | number)[] {
  return [
    reservation.id,
    reservation.createdAt,
    reservation.date,
    reservation.time,
    reservation.customerName,
    reservation.phone,
    reservation.whatsapp,
    reservation.numberOfPeople,
    reservation.type,
    reservation.serviceName,
    reservation.pickupLocation,
    reservation.destination,
    reservation.price,
    reservation.cost,
    reservation.profit,
    reservation.currency,
    reservation.status,
    reservation.paymentStatus,
    reservation.description,
    reservation.internalNotes,
    reservation.driver,
    reservation.vehicle,
    reservation.flightNumber,
    reservation.bookingSource,
    reservation.updatedAt,
  ];
}

async function readReservationRows() {
  const values = await getValues(SHEETS.reservations, "A:Y");
  return values.slice(1).map((row, index) => ({
    rowNumber: index + 2,
    reservation: parseReservation(row.map(String), index + 2),
  }));
}

export async function getReservations(): Promise<Reservation[]> {
  return cached("reservations:all", async () => {
    const rows = await readReservationRows();
    return rows
      .map((r) => r.reservation)
      .filter((r) => r.id)
      .sort((a, b) => a.date.localeCompare(b.date) || compareTime(a.time, b.time));
  });
}

export async function getReservationById(id: string) {
  const reservations = await getReservations();
  return reservations.find((item) => item.id === id) ?? null;
}

async function findReservationRow(id: string) {
  const rows = await readReservationRows();
  return rows.find((row) => row.reservation.id === id) ?? null;
}

function buildReservation(input: ReservationInput, existing?: Reservation): Reservation {
  const now = toSheetTimestamp();
  const price = toMoney(input.price);
  const cost = toMoney(input.cost);
  return {
    id: existing?.id || input.id || generateId("RES"),
    createdAt: existing?.createdAt || now,
    date: input.date,
    time: input.time,
    customerName: input.customerName,
    phone: input.phone,
    whatsapp: input.whatsapp || input.phone,
    numberOfPeople: input.numberOfPeople,
    type: input.type,
    serviceName: input.serviceName,
    pickupLocation: input.pickupLocation || "",
    destination: input.destination || "",
    price,
    cost,
    profit: calculateProfit(price, cost),
    currency: input.currency || existing?.currency || "MAD",
    status: input.status,
    paymentStatus: input.paymentStatus,
    description: input.description || "",
    internalNotes: input.internalNotes || "",
    driver: input.driver || "",
    driverId: input.driverId || "",
    driverName: input.driver || "",
    driverPhone: "",
    driverEmail: "",
    commission: toMoney(input.commission ?? cost),
    vehicle: input.vehicle || "",
    flightNumber: input.flightNumber || "",
    bookingSource: input.bookingSource || existing?.bookingSource || "APP",
    updatedAt: now,
  };
}

export async function createReservation(input: ReservationInput) {
  const reservation = buildReservation(input);
  await appendValues(SHEETS.reservations, [toRow(reservation)]);
  await upsertFinanceRow(reservation);
  cacheClear();
  await syncCustomerFromReservations(reservation.phone);
  cacheClear("customers");
  return reservation;
}

export async function updateReservation(id: string, input: ReservationInput) {
  const existingRow = await findReservationRow(id);
  if (!existingRow) {
    throw new Error("Reservation not found.");
  }
  const reservation = buildReservation(input, existingRow.reservation);
  await updateValues(
    SHEETS.reservations,
    `A${existingRow.rowNumber}:Y${existingRow.rowNumber}`,
    [toRow(reservation)],
  );
  await upsertFinanceRow(reservation);
  cacheClear();
  await syncCustomerFromReservations(reservation.phone);
  if (existingRow.reservation.phone !== reservation.phone) {
    await syncCustomerFromReservations(existingRow.reservation.phone);
  }
  cacheClear("customers");
  return reservation;
}

export async function deleteReservation(id: string) {
  const existingRow = await findReservationRow(id);
  if (!existingRow) {
    throw new Error("Reservation not found.");
  }
  await deleteRow(SHEETS.reservations, existingRow.rowNumber);
  await deleteFinanceRow(id);
  cacheClear();
  await syncCustomerFromReservations(existingRow.reservation.phone);
  cacheClear("customers");
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
) {
  const current = await getReservationById(id);
  if (!current) throw new Error("Reservation not found.");
  return updateReservation(id, { ...current, status });
}

export function matchesSearch(reservation: Reservation, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    reservation.id,
    reservation.customerName,
    reservation.phone,
    reservation.whatsapp,
    reservation.serviceName,
    reservation.pickupLocation,
    reservation.destination,
    reservation.flightNumber,
    reservation.driver,
  ]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export { RESERVATION_HEADERS };
