export { isDatabaseConfigured, ensureSchema, dbStatus } from "@/lib/db/client";
export {
  getReservations,
  getReservationById,
  getReservationsForDriver,
  createReservation,
  updateReservation,
  deleteReservation,
  updateReservationStatus,
  updateDriverCommission,
  matchesSearch,
} from "@/lib/db/reservations";
export {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  findCustomerByPhone,
  customerReservations,
} from "@/lib/db/customers";
export {
  getServices,
  getActiveServices,
  getServiceById,
  createService,
  updateService,
} from "@/lib/db/services";
export {
  getFinanceData,
  getFinanceLedger,
  summarizeReservations,
  financeByServiceType,
  financeByServiceName,
  financeAverages,
} from "@/lib/db/finance";
export { getSettings, updateSettings } from "@/lib/db/settings";
export {
  getDrivers,
  getActiveDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  authenticateDriver,
} from "@/lib/db/drivers";

export async function seedDemoData() {
  const { ensureSchema, getConnectedPool } = await import("@/lib/db/client");
  await ensureSchema();
  const pool = await getConnectedPool();
  const result = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`,
  );
  const tables = result.rows.map((row) => String(row.table_name)).join(", ");
  return { seeded: true, message: tables ? `Database OK: ${tables}` : "Database connected, no tables yet." };
}

