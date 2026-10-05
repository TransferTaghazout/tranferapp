import { average, calculateProfit } from "@/lib/money";
import { inRange } from "@/lib/dates";
import {
  DateRange,
  FinanceByService,
  FinanceSummary,
  Reservation,
  SERVICE_TYPES,
  ServiceType,
} from "@/lib/types";

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
      acc.cost += item.driverCommission;
      acc.profit += calculateProfit(item.price, item.driverCommission);
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
    current.cost += item.driverCommission;
    current.profit += calculateProfit(item.price, item.driverCommission);
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
    const key = item.serviceName || item.type || "Other";
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
    current.cost += item.driverCommission;
    current.profit += calculateProfit(item.price, item.driverCommission);
    groups.set(key, current);
  }

  return Array.from(groups.values()).sort((a, b) => b.revenue - a.revenue);
}

export async function getFinanceData(reservations?: Reservation[]) {
  const list =
    reservations ?? (await (await import("@/lib/db/reservations")).getReservations());
  return {
    all: summarizeReservations(list),
    byType: financeByServiceType(list),
    byService: financeByServiceName(list),
    ledger: list.map((item) => ({
      date: item.date,
      reservationId: item.id,
      service: item.serviceName || item.type,
      revenue: item.price,
      cost: item.driverCommission,
      profit: item.profit,
      paymentStatus: item.paymentStatus,
    })),
  };
}

export async function getFinanceLedger() {
  const data = await getFinanceData();
  return data.ledger;
}

function typeLabel(type: ServiceType) {
  if (type === "Transfer") return "Airport / Private Transfers";
  if (type === "Activity") return "Activities";
  if (type === "Tour") return "Tours / Excursions";
  return "Other services";
}
