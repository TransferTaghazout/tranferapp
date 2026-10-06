import { calculateProfit, toMoney, toSignedMoney } from "@/lib/money";
import { compareTime, toSheetTimestamp } from "@/lib/dates";
import { generateId } from "@/lib/utils";
import {
  CommissionType,
  Reservation,
  ServiceType,
  normalizePaymentStatus,
  normalizeReservationStatus,
} from "@/lib/types";
import { ReservationInput } from "@/lib/validations";
import { query, queryOne } from "@/lib/db/client";
import { getDriverById } from "@/lib/db/drivers";
import { calculateCommissionAmount, calculateReservationFinance } from "@/lib/drive-finance";

type ReservationRow = Record<string, unknown>;

function mapReservation(row: ReservationRow): Reservation {
  const price = toMoney(row.price);
  const commission = toMoney(row.commission);
  const driverCommission = toMoney(row.driver_commission);
  const cost = toMoney(row.cost ?? driverCommission);
  const commissionType = String(row.commission_type || "fixed") === "percentage" ? "percentage" : "fixed";
  const mapped: Reservation = {
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
    driverCommission,
    profit: calculateProfit(price, driverCommission),
    currency: String(row.currency || "MAD"),
    status: normalizeReservationStatus(row.status),
    paymentStatus: normalizePaymentStatus(row.payment_status),
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
    commissionType,
    commissionRate: toMoney(row.commission_rate),
    expectedAmount: toMoney(row.expected_amount || price),
    amountReceived: toMoney(row.amount_received),
    difference: toMoney(row.difference),
    adjustmentAmount: toSignedMoney(row.adjustment_amount),
    adjustmentReason: String(row.adjustment_reason || ""),
    cancellationReason: String(row.cancellation_reason || ""),
    cancellationFee: toMoney(row.cancellation_fee),
    cancellationCommission: toMoney(row.cancellation_commission),
    completedAt: String(row.completed_at || ""),
    completedBy: String(row.completed_by || ""),
    driverNotes: String(row.driver_notes || ""),
    financialNotes: String(row.financial_notes || ""),
    updatedAt: String(row.updated_at || ""),
  };
  const finance = calculateReservationFinance(mapped);
  mapped.driverCommission = finance.commission;
  mapped.expectedAmount = finance.expectedAmount;
  mapped.difference = finance.difference;
  mapped.profit = calculateProfit(
    finance.countsAsRevenue ? finance.amountReceived || finance.expectedAmount : mapped.price,
    finance.commission,
  );
  return mapped;
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

function financeFields(input: ReservationInput, existing?: Reservation) {
  const price = toMoney(input.price);
  const commissionType: CommissionType = input.commissionType || existing?.commissionType || "fixed";
  const commissionRate = toMoney(input.commissionRate ?? existing?.commissionRate);
  const fixedCommission = toMoney(input.driverCommission ?? existing?.driverCommission);
  const driverCommission = calculateCommissionAmount(price, commissionType, commissionRate, fixedCommission);
  return {
    commissionType,
    commissionRate,
    driverCommission,
    expectedAmount: price,
    amountReceived: toMoney(input.amountReceived ?? existing?.amountReceived),
    difference: toMoney(input.difference ?? existing?.difference),
    adjustmentAmount: toSignedMoney(input.adjustmentAmount ?? existing?.adjustmentAmount),
    adjustmentReason: input.adjustmentReason ?? existing?.adjustmentReason ?? "",
    cancellationReason: input.cancellationReason ?? existing?.cancellationReason ?? "",
    cancellationFee: toMoney(input.cancellationFee ?? existing?.cancellationFee),
    cancellationCommission: toMoney(input.cancellationCommission ?? existing?.cancellationCommission),
    completedAt: input.completedAt ?? existing?.completedAt ?? "",
    completedBy: input.completedBy ?? existing?.completedBy ?? "",
    driverNotes: input.driverNotes ?? existing?.driverNotes ?? "",
    financialNotes: input.financialNotes ?? existing?.financialNotes ?? "",
  };
}

async function buildReservation(input: ReservationInput, existing?: Reservation): Promise<Reservation> {
  const now = toSheetTimestamp();
  const price = toMoney(input.price);
  const commission = toMoney(input.commission);
  const finance = financeFields(input, existing);
  const driver = input.driverId ? await getDriverById(input.driverId) : null;
  const reservation: Reservation = {
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
    cost: finance.driverCommission,
    commission,
    currency: input.currency || existing?.currency || "MAD",
    status: normalizeReservationStatus(input.status),
    paymentStatus: normalizePaymentStatus(input.paymentStatus),
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
    ...finance,
    profit: calculateProfit(price, finance.driverCommission),
    updatedAt: now,
  };
  const calc = calculateReservationFinance(reservation);
  reservation.difference = calc.difference;
  reservation.expectedAmount = calc.expectedAmount;
  reservation.driverCommission = calc.commission;
  reservation.profit = calculateProfit(price, calc.commission);
  return reservation;
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
    reservation.driverCommission,
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
    reservation.commissionType,
    reservation.commissionRate,
    reservation.expectedAmount,
    reservation.amountReceived,
    reservation.difference,
    reservation.adjustmentAmount,
    reservation.adjustmentReason,
    reservation.cancellationReason,
    reservation.cancellationFee,
    reservation.cancellationCommission,
    reservation.completedAt,
    reservation.completedBy,
    reservation.driverNotes,
    reservation.financialNotes,
    reservation.updatedAt,
  ];
}

const COLUMNS = `
  id, created_at, date, time, customer_name, phone, whatsapp, number_of_people, type, service_name,
  pickup_location, destination, price, cost, commission, driver_commission, profit, currency, status, payment_status,
  description, internal_notes, driver, driver_id, vehicle, flight_number, booking_source,
  commission_type, commission_rate, expected_amount, amount_received, difference, adjustment_amount, adjustment_reason,
  cancellation_reason, cancellation_fee, cancellation_commission, completed_at, completed_by, driver_notes, financial_notes, updated_at
`;

const PLACEHOLDERS = Array.from({ length: 42 }, (_, index) => `$${index + 1}`).join(",");

export async function createReservation(input: ReservationInput) {
  const reservation = await buildReservation(input);
  await query(
    `INSERT INTO reservations (${COLUMNS}) VALUES (${PLACEHOLDERS})`,
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
      pickup_location=$11, destination=$12, price=$13, cost=$14, commission=$15, driver_commission=$16, profit=$17, currency=$18,
      status=$19, payment_status=$20, description=$21, internal_notes=$22, driver=$23, driver_id=$24,
      vehicle=$25, flight_number=$26, booking_source=$27, commission_type=$28, commission_rate=$29, expected_amount=$30,
      amount_received=$31, difference=$32, adjustment_amount=$33, adjustment_reason=$34, cancellation_reason=$35,
      cancellation_fee=$36, cancellation_commission=$37, completed_at=$38, completed_by=$39, driver_notes=$40,
      financial_notes=$41, updated_at=$42
     WHERE id=$1`,
    values(reservation),
  );
  if (reservation.phone) {
    const { syncCustomerFromReservations } = await import("@/lib/db/customers");
    await syncCustomerFromReservations(reservation.phone);
  }
  return reservation;
}

export async function saveReservationRecord(reservation: Reservation) {
  const now = toSheetTimestamp();
  const next = { ...reservation, updatedAt: now };
  const calc = calculateReservationFinance(next);
  next.driverCommission = calc.commission;
  next.expectedAmount = calc.expectedAmount;
  next.difference = calc.difference;
  next.profit = calculateProfit(next.price, calc.commission);
  next.cost = calc.commission;
  await query(
    `UPDATE reservations SET
      date=$3, time=$4, customer_name=$5, phone=$6, whatsapp=$7, number_of_people=$8, type=$9, service_name=$10,
      pickup_location=$11, destination=$12, price=$13, cost=$14, commission=$15, driver_commission=$16, profit=$17, currency=$18,
      status=$19, payment_status=$20, description=$21, internal_notes=$22, driver=$23, driver_id=$24,
      vehicle=$25, flight_number=$26, booking_source=$27, commission_type=$28, commission_rate=$29, expected_amount=$30,
      amount_received=$31, difference=$32, adjustment_amount=$33, adjustment_reason=$34, cancellation_reason=$35,
      cancellation_fee=$36, cancellation_commission=$37, completed_at=$38, completed_by=$39, driver_notes=$40,
      financial_notes=$41, updated_at=$42
     WHERE id=$1`,
    values(next),
  );
  return next;
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

export async function updateReservationStatus(id: string, status: Reservation["status"]) {
  const current = await getReservationById(id);
  if (!current) throw new Error("Reservation not found.");
  return updateReservation(id, { ...current, status });
}

export async function updateDriverCommission(id: string, amount: number) {
  const current = await getReservationById(id);
  if (!current) throw new Error("Reservation not found.");
  const driverCommission = toMoney(amount);
  return updateReservation(id, {
    ...current,
    commissionType: "fixed",
    driverCommission,
    cost: driverCommission,
  });
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
