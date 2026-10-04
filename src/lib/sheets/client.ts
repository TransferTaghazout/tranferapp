import { google, sheets_v4 } from "googleapis";
import { SHEETS, SheetName } from "@/lib/sheets/columns";

let cachedClient: sheets_v4.Sheets | null = null;

export function isSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEETS_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY,
  );
}

function privateKey() {
  return (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
}

export function getSpreadsheetId() {
  const id = process.env.GOOGLE_SHEETS_ID;
  if (!id) {
    throw new Error("GOOGLE_SHEETS_ID is not configured.");
  }
  return id;
}

export function getSheetsClient() {
  if (!isSheetsConfigured()) {
    throw new Error("Google Sheets connection unavailable.");
  }

  if (cachedClient) return cachedClient;

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

export function a1(sheet: SheetName, range: string) {
  return `'${sheet}'!${range}`;
}

export async function getValues(sheet: SheetName, range = "A:Z") {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: a1(sheet, range),
    majorDimension: "ROWS",
  });
  return res.data.values ?? [];
}

export async function updateValues(
  sheet: SheetName,
  range: string,
  values: (string | number)[][],
) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: a1(sheet, range),
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export async function appendValues(
  sheet: SheetName,
  values: (string | number)[][],
) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: a1(sheet, "A1"),
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}

export async function clearValues(sheet: SheetName, range: string) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: getSpreadsheetId(),
    range: a1(sheet, range),
  });
}

export async function getSheetId(title: SheetName) {
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
    fields: "sheets(properties(sheetId,title))",
  });
  const match = meta.data.sheets?.find((s) => s.properties?.title === title);
  if (match?.properties?.sheetId == null) {
    throw new Error(`Sheet tab "${title}" was not found.`);
  }
  return match.properties.sheetId;
}

export async function deleteRow(sheet: SheetName, rowNumber: number) {
  const sheetId = await getSheetId(sheet);
  const sheets = getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });
}

export async function listSheetTitles() {
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
    fields: "properties.title,sheets(properties(title))",
  });
  return {
    title: meta.data.properties?.title ?? "",
    sheets: (meta.data.sheets ?? [])
      .map((s) => s.properties?.title)
      .filter((title): title is string => Boolean(title)),
  };
}

export function cell(row: string[], index: number) {
  return (row[index] ?? "").toString().trim();
}

export { SHEETS };
