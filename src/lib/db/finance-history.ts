import { toMoney } from "@/lib/money";
import { toSheetTimestamp } from "@/lib/dates";
import { generateId } from "@/lib/utils";
import { FinancialHistoryEntry } from "@/lib/types";
import { query } from "@/lib/db/client";

export async function logFinancialHistory(input: {
  reservationId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  difference?: number;
  reason?: string;
  user?: string;
}) {
  const entry: FinancialHistoryEntry = {
    id: generateId("FIN"),
    timestamp: toSheetTimestamp(),
    reservationId: input.reservationId,
    action: input.action,
    oldValue: input.oldValue || "",
    newValue: input.newValue || "",
    difference: toMoney(input.difference),
    reason: input.reason || "",
    user: input.user || "",
  };
  await query(
    `INSERT INTO financial_history (
      id, timestamp, reservation_id, action, old_value, new_value, difference, reason, actor
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      entry.id,
      entry.timestamp,
      entry.reservationId,
      entry.action,
      entry.oldValue,
      entry.newValue,
      entry.difference,
      entry.reason,
      entry.user,
    ],
  );
  return entry;
}

export async function getFinancialHistory(reservationId: string) {
  const rows = await query(
    `SELECT id, timestamp, reservation_id, action, old_value, new_value, difference, reason, actor
     FROM financial_history WHERE reservation_id = $1 ORDER BY timestamp DESC`,
    [reservationId],
  );
  return rows.map((row) => ({
    id: String(row.id),
    timestamp: String(row.timestamp || ""),
    reservationId: String(row.reservation_id || ""),
    action: String(row.action || ""),
    oldValue: String(row.old_value || ""),
    newValue: String(row.new_value || ""),
    difference: toMoney(row.difference),
    reason: String(row.reason || ""),
    user: String(row.actor || ""),
  })) satisfies FinancialHistoryEntry[];
}
