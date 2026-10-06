import { z } from "zod";
import {
  COMMISSION_TYPES,
  PAYMENT_STATUSES,
  RESERVATION_STATUSES,
  SERVICE_TYPES,
  normalizePaymentStatus,
  normalizeReservationStatus,
} from "@/lib/types";

const moneyField = z.coerce.number().min(0, "Must be 0 or more");
const signedMoney = z.coerce.number();

export const reservationSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  customerName: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().optional().default(""),
  whatsapp: z.string().trim().optional().default(""),
  numberOfPeople: z.coerce.number().int().min(1).optional().default(1),
  type: z.enum(SERVICE_TYPES),
  serviceName: z.string().trim().optional().default(""),
  pickupLocation: z.string().trim().optional().default(""),
  destination: z.string().trim().optional().default(""),
  price: moneyField,
  cost: moneyField.optional().default(0),
  commission: moneyField.optional().default(0),
  driverCommission: moneyField.optional().default(0),
  commissionType: z.enum(COMMISSION_TYPES).optional().default("fixed"),
  commissionRate: moneyField.optional().default(0),
  amountReceived: moneyField.optional(),
  difference: signedMoney.optional(),
  adjustmentAmount: signedMoney.optional(),
  adjustmentReason: z.string().optional(),
  cancellationReason: z.string().optional(),
  cancellationFee: moneyField.optional(),
  cancellationCommission: moneyField.optional(),
  completedAt: z.string().optional(),
  completedBy: z.string().optional(),
  driverNotes: z.string().optional(),
  financialNotes: z.string().optional(),
  currency: z.string().optional().default("MAD"),
  status: z.preprocess(normalizeReservationStatus, z.enum(RESERVATION_STATUSES)),
  paymentStatus: z.preprocess(normalizePaymentStatus, z.enum(PAYMENT_STATUSES)),
  description: z.string().optional().default(""),
  internalNotes: z.string().optional().default(""),
  driver: z.string().trim().optional().default(""),
  driverId: z.string().trim().optional().default(""),
  vehicle: z.string().trim().optional().default(""),
  flightNumber: z.string().trim().optional().default(""),
  bookingSource: z.string().optional().default("APP"),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

export const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Service name is required"),
  type: z.enum(SERVICE_TYPES),
  defaultPrice: moneyField,
  defaultCost: moneyField.optional().default(0),
  description: z.string().optional().default(""),
  active: z.coerce.boolean().optional().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const driverSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(6, "Phone is required"),
  email: z.string().trim().optional().default(""),
  password: z.string().optional().default(""),
  active: z.coerce.boolean().optional().default(true),
});

export type DriverInput = z.infer<typeof driverSchema>;

export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(6, "Phone is required"),
  whatsapp: z.string().trim().optional().default(""),
  country: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
  notes: z.string().optional().default(""),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export const settingsSchema = z.object({
  businessName: z.string().trim().min(1),
  currency: z.string().trim().min(1),
  timezone: z.string().trim().min(1),
  defaultCurrency: z.string().trim().min(1),
  whatsappCountryCode: z.string().trim().min(1),
  driverWhatsApp: z.string().trim().optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Login is required"),
  password: z.string().min(1, "Password is required"),
});

export const reservationFiltersSchema = z.object({
  q: z.string().optional().default(""),
  date: z.string().optional().default(""),
  from: z.string().optional().default(""),
  to: z.string().optional().default(""),
  service: z.string().optional().default(""),
  type: z.string().optional().default(""),
  status: z.string().optional().default(""),
  paymentStatus: z.string().optional().default(""),
  range: z
    .enum(["today", "tomorrow", "yesterday", "week", "month", "all", "custom", "completed", "pending", "cancelled"])
    .optional()
    .default("all"),
  driverId: z.string().optional().default(""),
});
