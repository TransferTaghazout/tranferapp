import { DEFAULT_SETTINGS, Reservation, Settings } from "@/lib/types";
import {
  getReservations,
  getServices,
  getCustomers,
  getSettings,
  isSheetsConfigured,
} from "@/lib/sheets";

export async function loadWorkspace() {
  if (!isSheetsConfigured()) {
    return {
      configured: false as const,
      reservations: [] as Reservation[],
      services: [],
      customers: [],
      settings: DEFAULT_SETTINGS,
      error: "Google Sheets connection unavailable.",
    };
  }

  try {
    const [reservations, services, customers, settings] = await Promise.all([
      getReservations(),
      getServices(),
      getCustomers(),
      getSettings().catch(() => DEFAULT_SETTINGS as Settings),
    ]);
    return {
      configured: true as const,
      reservations,
      services,
      customers,
      settings,
      error: null as string | null,
    };
  } catch {
    return {
      configured: false as const,
      reservations: [] as Reservation[],
      services: [],
      customers: [],
      settings: DEFAULT_SETTINGS,
      error: "Google Sheets connection unavailable.",
    };
  }
}
