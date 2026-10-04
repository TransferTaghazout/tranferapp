import { DEFAULT_SETTINGS } from "@/lib/types";
import { cacheClear } from "@/lib/sheets/cache";
import {
  getSheetsClient,
  getSpreadsheetId,
  getValues,
  isSheetsConfigured,
  listSheetTitles,
  updateValues,
} from "@/lib/sheets/client";
import {
  CUSTOMER_HEADERS,
  FINANCE_HEADERS,
  RESERVATION_HEADERS,
  SERVICE_HEADERS,
  SETTINGS_HEADERS,
  SHEETS,
} from "@/lib/sheets/columns";

const REQUIRED_SHEETS = [
  { title: SHEETS.reservations, headers: [...RESERVATION_HEADERS] },
  { title: SHEETS.services, headers: [...SERVICE_HEADERS] },
  { title: SHEETS.customers, headers: [...CUSTOMER_HEADERS] },
  { title: SHEETS.finance, headers: [...FINANCE_HEADERS] },
  { title: SHEETS.settings, headers: [...SETTINGS_HEADERS] },
];

export async function ensureSpreadsheetStructure() {
  if (!isSheetsConfigured()) {
    throw new Error("Google Sheets connection unavailable.");
  }

  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const meta = await listSheetTitles();
  const existing = new Set(meta.sheets);

  const missing = REQUIRED_SHEETS.filter((sheet) => !existing.has(sheet.title));
  if (missing.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: missing.map((sheet) => ({
          addSheet: {
            properties: {
              title: sheet.title,
              gridProperties: { frozenRowCount: 1 },
            },
          },
        })),
      },
    });
  }

  for (const sheet of REQUIRED_SHEETS) {
    const values = await getValues(sheet.title, "A1:Z1");
    const header = (values[0] ?? []).map((cell) => String(cell));
    const needsHeaders =
      header.length === 0 || sheet.headers.some((col, i) => header[i] !== col);
    if (needsHeaders) {
      await updateValues(sheet.title, `A1:${columnLetter(sheet.headers.length)}1`, [
        sheet.headers,
      ]);
    }
  }

  const settings = await getValues(SHEETS.settings, "A2:F2");
  if (!settings[0] || !settings[0][0]) {
    await updateValues(SHEETS.settings, "A2:F2", [
      [
        DEFAULT_SETTINGS.businessName,
        DEFAULT_SETTINGS.currency,
        DEFAULT_SETTINGS.timezone,
        DEFAULT_SETTINGS.defaultCurrency,
        DEFAULT_SETTINGS.whatsappCountryCode,
        DEFAULT_SETTINGS.driverWhatsApp,
      ],
    ]);
  }

  cacheClear();
  return { title: meta.title || "Tourism Reservation Manager", created: missing.map((s) => s.title) };
}

function columnLetter(index: number) {
  let n = index;
  let letter = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter || "A";
}

export function sheetsStatus() {
  return {
    configured: isSheetsConfigured(),
    missing: [
      !process.env.GOOGLE_SHEETS_ID ? "GOOGLE_SHEETS_ID" : null,
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
        ? "GOOGLE_SERVICE_ACCOUNT_EMAIL"
        : null,
      !process.env.GOOGLE_PRIVATE_KEY ? "GOOGLE_PRIVATE_KEY" : null,
    ].filter(Boolean),
  };
}
