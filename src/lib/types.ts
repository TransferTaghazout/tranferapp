export const SERVICE_TYPES = ["Transfer", "Activity", "Tour", "Other"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const BOOKING_SERVICES = [
  { name: "Airport Transfer", type: "Transfer" as const },
  { name: "Paradise Valley", type: "Activity" as const },
  { name: "Sandboarding", type: "Activity" as const },
  { name: "Tour", type: "Tour" as const },
  { name: "Other", type: "Other" as const },
] as const;

export const VEHICLE_TYPES = ["Sedan", "SUV", "Van", "Minibus", "4x4"] as const;

export const RESERVATION_STATUSES = [
  "New",
  "Confirmed",
  "On the way",
  "Completed",
  "Cancelled",
  "No Show",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const PAYMENT_STATUSES = ["Unpaid", "Partially Paid", "Paid", "Refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const COMMISSION_TYPES = ["percentage", "fixed"] as const;
export type CommissionType = (typeof COMMISSION_TYPES)[number];

export function normalizeReservationStatus(value: unknown): ReservationStatus {
  const raw = String(value || "New");
  if (raw === "Pending") return "New";
  if ((RESERVATION_STATUSES as readonly string[]).includes(raw)) return raw as ReservationStatus;
  return "New";
}

export function normalizePaymentStatus(value: unknown): PaymentStatus {
  const raw = String(value || "Unpaid");
  if (raw === "Deposit") return "Partially Paid";
  if ((PAYMENT_STATUSES as readonly string[]).includes(raw)) return raw as PaymentStatus;
  return "Unpaid";
}

export const BOOKING_SOURCES = ["APP", "DEMO", "PHONE", "WHATSAPP", "WALK_IN"] as const;
export type BookingSource = (typeof BOOKING_SOURCES)[number];

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  active: boolean;
}

export interface Reservation {
  id: string;
  createdAt: string;
  date: string;
  time: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  numberOfPeople: number;
  type: ServiceType;
  serviceName: string;
  pickupLocation: string;
  destination: string;
  price: number;
  cost: number;
  profit: number;
  currency: string;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  description: string;
  internalNotes: string;
  driver: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverEmail: string;
  commission: number;
  driverCommission: number;
  vehicle: string;
  flightNumber: string;
  bookingSource: string;
  commissionType: CommissionType;
  commissionRate: number;
  expectedAmount: number;
  amountReceived: number;
  difference: number;
  adjustmentAmount: number;
  adjustmentReason: string;
  cancellationReason: string;
  cancellationFee: number;
  cancellationCommission: number;
  completedAt: string;
  completedBy: string;
  driverNotes: string;
  financialNotes: string;
  updatedAt: string;
}

export interface ReservationFinance {
  expectedAmount: number;
  commission: number;
  amountReceived: number;
  difference: number;
  missingAmount: number;
  extraAmount: number;
  remaining: number;
  netAmount: number;
  officeNet: number;
  countsAsCompleted: boolean;
  countsAsRevenue: boolean;
}

export interface DriveSummary {
  completedCount: number;
  cancelledCount: number;
  expectedRevenue: number;
  actualReceived: number;
  missing: number;
  extra: number;
  commission: number;
  adjustments: number;
  cancellationFees: number;
  netCommission: number;
  net: number;
}

export interface FinancialHistoryEntry {
  id: string;
  timestamp: string;
  reservationId: string;
  action: string;
  oldValue: string;
  newValue: string;
  difference: number;
  reason: string;
  user: string;
}

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  defaultPrice: number;
  defaultCost: number;
  description: string;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  country: string;
  email: string;
  totalReservations: number;
  totalSpent: number;
  lastReservation: string;
  notes: string;
}

export interface FinanceRow {
  date: string;
  reservationId: string;
  service: string;
  revenue: number;
  cost: number;
  profit: number;
  paymentStatus: PaymentStatus;
}

export interface Settings {
  businessName: string;
  currency: string;
  timezone: string;
  defaultCurrency: string;
  whatsappCountryCode: string;
  driverWhatsApp: string;
}

export interface FinanceSummary {
  services: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface FinanceByService {
  key: string;
  label: string;
  type?: ServiceType;
  services: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export const DEFAULT_SETTINGS: Settings = {
  businessName: "Atlas Coast Travel",
  currency: "MAD",
  timezone: "Africa/Casablanca",
  defaultCurrency: "MAD",
  whatsappCountryCode: "212",
  driverWhatsApp: "",
};

export const TIMEZONE = "Africa/Casablanca";
export const CURRENCY_CODE = "MAD";
export const CURRENCY_LABEL = "DH";
