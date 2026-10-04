import { CURRENCY_LABEL } from "@/lib/types";

export function toMoney(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed =
    typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(parsed)) return 0;
  return roundMoney(Math.max(0, parsed));
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateProfit(price: number, cost?: number | null) {
  return roundMoney(toMoney(price) - toMoney(cost ?? 0));
}

export function formatMoney(value: number, currencyLabel = CURRENCY_LABEL) {
  const safe = toMoney(value);
  const formatted = new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: safe % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(safe);
  return `${formatted} ${currencyLabel}`;
}

export function average(total: number, count: number) {
  if (count <= 0) return 0;
  return roundMoney(total / count);
}
