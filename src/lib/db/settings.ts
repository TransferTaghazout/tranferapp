import { DEFAULT_SETTINGS, Settings } from "@/lib/types";
import { queryOne, query } from "@/lib/db/client";

type SettingsRow = Record<string, unknown>;

function mapSettings(row: SettingsRow | null): Settings {
  if (!row) return DEFAULT_SETTINGS;
  return {
    businessName: String(row.business_name || DEFAULT_SETTINGS.businessName),
    currency: String(row.currency || DEFAULT_SETTINGS.currency),
    timezone: String(row.timezone || DEFAULT_SETTINGS.timezone),
    defaultCurrency: String(row.default_currency || DEFAULT_SETTINGS.defaultCurrency),
    whatsappCountryCode: String(row.whatsapp_country_code || DEFAULT_SETTINGS.whatsappCountryCode),
    driverWhatsApp: String(row.driver_whatsapp || ""),
  };
}

export async function getSettings(): Promise<Settings> {
  const row = await queryOne("SELECT * FROM settings WHERE id = 1");
  return mapSettings(row);
}

export async function updateSettings(settings: Settings) {
  await query(
    `UPDATE settings SET
      business_name=$1, currency=$2, timezone=$3, default_currency=$4,
      whatsapp_country_code=$5, driver_whatsapp=$6
     WHERE id=1`,
    [
      settings.businessName,
      settings.currency,
      settings.timezone,
      settings.defaultCurrency,
      settings.whatsappCountryCode,
      settings.driverWhatsApp,
    ],
  );
  return settings;
}
