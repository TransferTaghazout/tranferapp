import { average, calculateProfit, toMoney } from "@/lib/money";
import { inRange } from "@/lib/dates";
import {
  DateRange,
  FinanceByService,
  FinanceRow,
  FinanceSummary,
  PaymentStatus,
  Reservation,
  SERVICE_TYPES,
  ServiceType,
} from "@/lib/types";
import { cached, cacheClear } from "@/lib/sheets/cache";
import {
  appendValues,
  cell,
  deleteRow,
  getValues,
  SHEETS,
  updateValues,
} from "@/lib/sheets/client";
import { FINANCE_HEADERS } from "@/lib/sheets/columns";

function parseFinance(row: string[]): FinanceRow {
  return {
    date: cell(row, 0),
    reservationId: cell(row, 1),
    service: cell(row, 2),
    revenue: toMoney(cell(row, 3)),
    cost: toMoney(cell(row, 4)),
    profit: calculateProfit(toMoney(cell(row, 3)), toMoney(cell(row, 4))),
    paymentStatus: (cell(row, 5) || "Unpaid") as PaymentStatus,
  };
}

function toRow(row: FinanceRow): (string | number)[] {
  return [
    row.date,
    row.reservationId,
    row.service,
    row.revenue,
    row.cost,
    row.profit,
    row.paymentStatus,
  ];
}

async function readFinanceRows() {
  const values = await getValues(SHEETS.finance, "A:G");
  return values.slice(1).map((row, index) => ({
    rowNumber: index + 2,
    entry: parseFinance(row.map(String)),
  }));
}

export async function getFinanceLedger(): Promise<FinanceRow[]> {
  return cached("finance:all", async () => {
    const rows = await readFinanceRows();
    return rows.map((r) => r.entry).filter((r) => r.reservationId);
  });
}

export function summarizeReservations(
  reservations: Reservation[],
  range?: DateRange,
): FinanceSummary {
  const items = reservations.filter((item) => {
    if (item.status === "Cancelled") return false;
    if (!range) return true;
    return inRange(item.date, range.from, range.to);
  });

  return items.reduce(
    (acc, item) => {
      acc.services += 1;
      acc.revenue += item.price;
      acc.cost += item.cost;
      acc.profit += calculateProfit(item.price, item.cost);
      return acc;
    },
    { services: 0, revenue: 0, cost: 0, profit: 0 },
  );
}

export function financeAverages(summary: FinanceSummary) {
  return {
    averageRevenue: average(summary.revenue, summary.services),
    averageProfit: average(summary.profit, summary.services),
  };
}

export function financeByServiceType(
  reservations: Reservation[],
  range?: DateRange,
  type?: ServiceType | "All",
): FinanceByService[] {
  const items = reservations.filter((item) => {
    if (item.status === "Cancelled") return false;
    if (range && !inRange(item.date, range.from, range.to)) return false;
    if (type && type !== "All" && item.type !== type) return false;
    return true;
  });

  const groups = new Map<string, FinanceByService>();
  for (const item of items) {
    const key = item.type;
    const current = groups.get(key) ?? {
      key,
      label: typeLabel(item.type),
      type: item.type,
      services: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
    };
    current.services += 1;
    current.revenue += item.price;
    current.cost += item.cost;
    current.profit += calculateProfit(item.price, item.cost);
    groups.set(key, current);
  }

  return SERVICE_TYPES.map((key) => groups.get(key)).filter(
    (item): item is FinanceByService => Boolean(item),
  );
}

export function financeByServiceName(
  reservations: Reservation[],
  range?: DateRange,
): FinanceByService[] {
  const items = reservations.filter((item) => {
    if (item.status === "Cancelled") return false;
    if (range && !inRange(item.date, range.from, range.to)) return false;
    return true;
  });

  const groups = new Map<string, FinanceByService>();
  for (const item of items) {
    const key = item.serviceName || "Other";
    const current = groups.get(key) ?? {
      key,
      label: key,
      type: item.type,
      services: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
    };
    current.services += 1;
    current.revenue += item.price;
    current.cost += item.cost;
    current.profit += calculateProfit(item.price, item.cost);
    groups.set(key, current);
  }

  return Array.from(groups.values()).sort((a, b) => b.revenue - a.revenue);
}

export async function getFinanceData(reservations?: Reservation[]) {
  const list =
    reservations ?? (await import("@/lib/sheets/reservations")).getReservations();
  const items = await list;
  return {
    all: summarizeReservations(items),
    byType: financeByServiceType(items),
    byService: financeByServiceName(items),
    ledger: await getFinanceLedger(),
  };
}

export async function upsertFinanceRow(reservation: Reservation) {
  const entry: FinanceRow = {
    date: reservation.date,
    reservationId: reservation.id,
    service: reservation.serviceName,
    revenue: reservation.price,
    cost: reservation.cost,
    profit: calculateProfit(reservation.price, reservation.cost),
    paymentStatus: reservation.paymentStatus,
  };

  const rows = await readFinanceRows();
  const match = rows.find((row) => row.entry.reservationId === reservation.id);
  if (match) {
    await updateValues(SHEETS.finance, `A${match.rowNumber}:G${match.rowNumber}`, [
      toRow(entry),
    ]);
  } else {
    await appendValues(SHEETS.finance, [toRow(entry)]);
  }
  cacheClear("finance");
}

export async function deleteFinanceRow(reservationId: string) {
  const rows = await readFinanceRows();
  const match = rows.find((row) => row.entry.reservationId === reservationId);
  if (!match) return;
  await deleteRow(SHEETS.finance, match.rowNumber);
  cacheClear("finance");
}

function typeLabel(type: ServiceType) {
  if (type === "Transfer") return "Airport / Private Transfers";
  if (type === "Activity") return "Activities";
  if (type === "Tour") return "Tours / Excursions";
  return "Other services";
}

export { FINANCE_HEADERS };
