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
import { query, queryOne } from "@/lib/db/client";
import { getDriverById } from "@/lib/db/drivers";

type ReservationRow = Record<string, unknown>;

function mapReservation(row: ReservationRow): Reservation {
  const price = toMoney(row.price);
  const commission = toMoney(row.commission ?? row.cost);
  const cost = toMoney(row.cost ?? commission);
  return {
    id: String(row.id),
    createdAt: String(row.created_at || ""),
    date: String(row.date || ""),
    time: String(row.time || ""),
    customerName: String(row.customer_name || ""),
    phone: String(row.phone || ""),
    whatsapp: String(row.whatsapp || ""),
    numberOfPeople: Math.max(1, Number(row.number_of_people || 1)),
    type: (String(row.type || "Other") as ServiceType),
    serviceName: String(row.service_name || row.type || ""),
    pickupLocation: String(row.pickup_location || ""),
    destination: String(row.destination || ""),
    price,
    cost,
    commission,
    profit: calculateProfit(price, commission),
    currency: String(row.currency || "MAD"),
    status: (String(row.status || "Pending") as ReservationStatus),
    paymentStatus: (String(row.payment_status || "Unpaid") as PaymentStatus),
    description: String(row.description || ""),
    internalNotes: String(row.internal_notes || ""),
    driver: String(row.driver_name || row.driver || ""),
    driverId: String(row.driver_id || ""),
    driverName: String(row.driver_name || ""),
    driverPhone: String(row.driver_phone || ""),
    driverEmail: String(row.driver_email || ""),
    vehicle: String(row.vehicle || ""),
    flightNumber: String(row.flight_number || ""),
    bookingSource: String(row.booking_source || "APP"),
    updatedAt: String(row.updated_at || ""),
  };
}

const SELECT = `
  SELECT r.*, d.name AS driver_name, d.phone AS driver_phone, d.email AS driver_email
  FROM reservations r
  LEFT JOIN drivers d ON d.id = r.driver_id
`;

export async function getReservations(): Promise<Reservation[]> {
  const rows = await query(`${SELECT} ORDER BY r.date, r.time`);
  return rows.map(mapReservation).sort((a, b) => a.date.localeCompare(b.date) || compareTime(a.time, b.time));
}

export async function getReservationById(id: string) {
  const row = await queryOne(`${SELECT} WHERE r.id = $1`, [id]);
  return row ? mapReservation(row) : null;
}

export async function getReservationsForDriver(driverId: string) {
  const rows = await query(`${SELECT} WHERE r.driver_id = $1 ORDER BY r.date, r.time`, [driverId]);
  return rows.map(mapReservation);
}

async function buildReservation(input: ReservationInput, existing?: Reservation): Promise<Reservation> {
  const now = toSheetTimestamp();
  const price = toMoney(input.price);
  const commission = toMoney(input.commission ?? input.cost);
  const driver = input.driverId ? await getDriverById(input.driverId) : null;
  return {
    id: existing?.id || input.id || generateId("RES"),
    createdAt: existing?.createdAt || now,
    date: input.date,
    time: input.time,
    customerName: input.customerName,
    phone: input.phone || "",
    whatsapp: input.whatsapp || input.phone || "",
    numberOfPeople: input.numberOfPeople || 1,
    type: input.type,
    serviceName: input.serviceName || input.type,
    pickupLocation: input.pickupLocation || "",
    destination: input.destination || "",
    price,
    cost: commission,
    commission,
    profit: calculateProfit(price, commission),
    currency: input.currency || existing?.currency || "MAD",
    status: input.status,
    paymentStatus: input.paymentStatus,
    description: input.description || "",
    internalNotes: input.internalNotes || "",
    driver: driver?.name || input.driver || "",
    driverId: driver?.id || "",
    driverName: driver?.name || "",
    driverPhone: driver?.phone || "",
    driverEmail: driver?.email || "",
    vehicle: input.vehicle || "",
    flightNumber: input.flightNumber || "",
    bookingSource: input.bookingSource || existing?.bookingSource || "APP",
    updatedAt: now,
  };
}

function values(reservation: Reservation) {
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
    reservation.commission,
    reservation.profit,
    reservation.currency,
    reservation.status,
    reservation.paymentStatus,
    reservation.description,
    reservation.internalNotes,
    reservation.driver,
    reservation.driverId || null,
    reservation.vehicle,
    reservation.flightNumber,
    reservation.bookingSource,
    reservation.updatedAt,
  ];
}

export async function createReservation(input: ReservationInput) {
  const reservation = await buildReservation(input);
  await query(
    `INSERT INTO reservations (
      id, created_at, date, time, customer_name, phone, whatsapp, number_of_people, type, service_name,
      pickup_location, destination, price, cost, commission, profit, currency, status, payment_status,
      description, internal_notes, driver, driver_id, vehicle, flight_number, booking_source, updated_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27
    )`,
    values(reservation),
  );
  if (reservation.phone) {
    const { syncCustomerFromReservations } = await import("@/lib/db/customers");
    await syncCustomerFromReservations(reservation.phone);
  }
  return reservation;
}

export async function updateReservation(id: string, input: ReservationInput) {
  const existing = await getReservationById(id);
  if (!existing) throw new Error("Reservation not found.");
  const reservation = await buildReservation(input, existing);
  await query(
    `UPDATE reservations SET
      date=$3, time=$4, customer_name=$5, phone=$6, whatsapp=$7, number_of_people=$8, type=$9, service_name=$10,
      pickup_location=$11, destination=$12, price=$13, cost=$14, commission=$15, profit=$16, currency=$17,
      status=$18, payment_status=$19, description=$20, internal_notes=$21, driver=$22, driver_id=$23,
      vehicle=$24, flight_number=$25, booking_source=$26, updated_at=$27
     WHERE id=$1`,
    values(reservation),
  );
  if (reservation.phone) {
    const { syncCustomerFromReservations } = await import("@/lib/db/customers");
    await syncCustomerFromReservations(reservation.phone);
  }
  return reservation;
}

export async function deleteReservation(id: string) {
  const existing = await getReservationById(id);
  if (!existing) throw new Error("Reservation not found.");
  await query("DELETE FROM reservations WHERE id = $1", [id]);
  if (existing.phone) {
    const { syncCustomerFromReservations } = await import("@/lib/db/customers");
    await syncCustomerFromReservations(existing.phone);
  }
}

export async function updateReservationStatus(id: string, status: ReservationStatus) {
  const current = await getReservationById(id);
  if (!current) throw new Error("Reservation not found.");
  return updateReservation(id, { ...current, status });
}

export function matchesSearch(reservation: Reservation, queryText: string) {
  const q = queryText.trim().toLowerCase();
  if (!q) return true;
  return [
    reservation.id,
    reservation.customerName,
    reservation.phone,
    reservation.whatsapp,
    reservation.serviceName,
    reservation.pickupLocation,
    reservation.destination,
    reservation.driverName,
  ]
    .join(" ")
    .toLowerCase()
    .includes(q);
}
