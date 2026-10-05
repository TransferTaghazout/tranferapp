export { isDatabaseConfigured, ensureSchema, dbStatus } from "@/lib/db/client";
export {
  getReservations,
  getReservationById,
  getReservationsForDriver,
  createReservation,
  updateReservation,
  deleteReservation,
  updateReservationStatus,
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
