import { DEFAULT_SETTINGS, Settings } from "@/lib/types";
import { cached, cacheClear } from "@/lib/sheets/cache";
import { cell, getValues, SHEETS, updateValues } from "@/lib/sheets/client";
import { SETTINGS_HEADERS } from "@/lib/sheets/columns";

export async function getSettings(): Promise<Settings> {
  return cached("settings", async () => {
    const values = await getValues(SHEETS.settings, "A:F");
    const data = values[1] ?? [];
    return {
      businessName: cell(data, 0) || DEFAULT_SETTINGS.businessName,
      currency: cell(data, 1) || DEFAULT_SETTINGS.currency,
      timezone: cell(data, 2) || DEFAULT_SETTINGS.timezone,
      defaultCurrency: cell(data, 3) || DEFAULT_SETTINGS.defaultCurrency,
      whatsappCountryCode:
        cell(data, 4) || DEFAULT_SETTINGS.whatsappCountryCode,
      driverWhatsApp: cell(data, 5) || DEFAULT_SETTINGS.driverWhatsApp,
    };
  });
}

export async function updateSettings(settings: Settings) {
  await updateValues(SHEETS.settings, "A1:F2", [
    [...SETTINGS_HEADERS],
    [
      settings.businessName,
      settings.currency,
      settings.timezone,
      settings.defaultCurrency,
      settings.whatsappCountryCode,
      settings.driverWhatsApp,
    ],
  ]);
  cacheClear("settings");
  return settings;
}
