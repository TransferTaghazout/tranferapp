import { DriveSummary } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { StatCard } from "@/components/shared/stat-card";

export function DriveDashboard({
  title,
  summary,
}: {
  title: string;
  summary: DriveSummary;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-3xl">{title}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Completed services" value={String(summary.completedCount)} tone="forest" />
        <StatCard label="Expected revenue" value={formatMoney(summary.expectedRevenue)} tone="sand" />
        <StatCard label="Actual received" value={formatMoney(summary.actualReceived)} />
        <StatCard
          label="Missing"
          value={formatMoney(summary.missing)}
          hint={summary.extra ? `Extra ${formatMoney(summary.extra)}` : undefined}
        />
        <StatCard label="Commission" value={formatMoney(summary.commission)} tone="ocean" />
        <StatCard label="Net commission" value={formatMoney(summary.netCommission)} hint="Commission minus missing" />
        <StatCard label="Cancelled" value={String(summary.cancelledCount)} />
        <StatCard
          label="Office net"
          value={formatMoney(summary.net)}
          hint="Received − commission − adjustments"
        />
      </div>
    </section>
  );
}
