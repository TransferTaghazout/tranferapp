import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export function MoneyStack({
  price,
  cost,
  profit,
  compact = false,
}: {
  price: number;
  cost: number;
  profit: number;
  compact?: boolean;
}) {
  return (
    <div className={cn("grid gap-1 text-sm", compact ? "grid-cols-3" : "grid-cols-1")}>
      <p className="font-semibold text-primary">{formatMoney(price)}</p>
      <p className="text-muted-foreground">Cost: {formatMoney(cost)}</p>
      <p className="font-semibold text-accent">Profit: {formatMoney(profit)}</p>
    </div>
  );
}
