export const SERVICE_TYPES = ["Transfer", "Activity", "Tour", "Other"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const RESERVATION_STATUSES = [
  "Confirmed",
  "Pending",
  "Completed",
  "Cancelled",
  "No Show",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const PAYMENT_STATUSES = ["Unpaid", "Deposit", "Paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

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
  vehicle: string;
  flightNumber: string;
  bookingSource: string;
  updatedAt: string;
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
