import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export function MoneyStack({
  price,
  commission,
  driverCommission,
  profit,
  compact = false,
}: {
  price: number;
  commission: number;
  driverCommission: number;
  profit: number;
  compact?: boolean;
  cost?: number;
}) {
  return (
    <div className={cn("grid gap-1.5 text-sm", compact ? "grid-cols-2" : "grid-cols-1")}>
      <p className="font-semibold text-primary">Price: {formatMoney(price)}</p>
      <p className="rounded-lg bg-amber-100 px-2 py-1 font-semibold text-amber-950">
        Commission: {formatMoney(commission)}
      </p>
      <p className="rounded-lg bg-emerald-100 px-2 py-1 font-semibold text-emerald-950">
        Commission driver: {formatMoney(driverCommission)}
      </p>
      <p className="font-semibold text-accent">Profit: {formatMoney(profit)}</p>
    </div>
  );
}
