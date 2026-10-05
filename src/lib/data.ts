import { DEFAULT_SETTINGS, Driver, Reservation, Settings } from "@/lib/types";
import {
  getReservations,
  getServices,
  getCustomers,
  getSettings,
  getDrivers,
} from "@/lib/db";
import { friendlyDbError } from "@/lib/db/client";

export async function loadWorkspace() {
  try {
    const [reservations, services, customers, drivers, settings] = await Promise.all([
      getReservations(),
      getServices(),
      getCustomers(),
      getDrivers(),
      getSettings().catch(() => DEFAULT_SETTINGS as Settings),
    ]);
    return {
      configured: true as const,
      reservations,
      services,
      customers,
      drivers,
      settings,
      error: null as string | null,
    };
  } catch (error) {
    return {
      configured: false as const,
      reservations: [] as Reservation[],
      services: [],
      customers: [],
      drivers: [] as Driver[],
      settings: DEFAULT_SETTINGS,
      error:
        error instanceof Error ? friendlyDbError(error) : "Database connection unavailable.",
    };
  }
}
