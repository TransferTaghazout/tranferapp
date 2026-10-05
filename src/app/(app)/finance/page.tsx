import { ConnectionBanner } from "@/components/setup/connection-banner";
import { StatCard } from "@/components/shared/stat-card";
import { loadWorkspace } from "@/lib/data";
import { monthRange, todayISO, weekRange } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import {
  financeAverages,
  financeByServiceName,
  financeByServiceType,
  summarizeReservations,
} from "@/lib/db/finance";
import { SERVICE_TYPES, ServiceType } from "@/lib/types";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; type?: string }>;
}) {
  const params = await searchParams;
  const today = todayISO();
  const { reservations } = await loadWorkspace();
  const week = weekRange(today);
  const month = monthRange(today);
  const custom =
    params.from && params.to ? { from: params.from, to: params.to } : month;
  const type = (params.type as ServiceType | undefined) || undefined;

  const todaySummary = summarizeReservations(reservations, { from: today, to: today });
  const weekSummary = summarizeReservations(reservations, week);
  const monthSummary = summarizeReservations(reservations, month);
  const customSummary = summarizeReservations(reservations, custom);
  const averages = financeAverages(customSummary);
  const byType = financeByServiceType(reservations, custom, type);
  const byService = financeByServiceName(reservations, custom).filter((item) =>
    type ? item.type === type : true,
  );

  return (
    <div className="space-y-6">
      <ConnectionBanner />
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Finance</p>
        <h1 className="mt-1 font-display text-4xl">Revenue & profit</h1>
      </header>

      <Period title="Today" summary={todaySummary} />
      <Period title="This Week" summary={weekSummary} />
      <Period title="This Month" summary={monthSummary} />

      <form className="grid gap-3 rounded-[1.4rem] border bg-card p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
        <input type="date" name="from" defaultValue={custom.from} className="h-12 rounded-2xl border px-3" />
        <input type="date" name="to" defaultValue={custom.to} className="h-12 rounded-2xl border px-3" />
        <select name="type" defaultValue={type || ""} className="h-12 rounded-2xl border px-3">
          <option value="">All types</option>
          {SERVICE_TYPES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button className="h-12 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground">
          Apply range
        </button>
      </form>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Total revenue" value={formatMoney(customSummary.revenue)} tone="sand" />
        <StatCard label="Total costs" value={formatMoney(customSummary.cost)} />
        <StatCard label="Total profit" value={formatMoney(customSummary.profit)} tone="ocean" />
        <StatCard label="Reservations" value={String(customSummary.services)} />
        <StatCard label="Avg revenue/service" value={formatMoney(averages.averageRevenue)} />
        <StatCard label="Avg profit/service" value={formatMoney(averages.averageProfit)} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-3xl">Finance by type</h2>
        {byType.length === 0 ? (
          <p className="text-sm text-muted-foreground">No results in this range.</p>
        ) : (
          byType.map((item) => (
            <BreakdownCard key={item.key} title={item.label} item={item} />
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-3xl">Finance by service</h2>
        {byService.map((item) => (
          <BreakdownCard key={item.key} title={item.label} item={item} />
        ))}
      </section>
    </div>
  );
}

function Period({
  title,
  summary,
}: {
  title: string;
  summary: { services: number; revenue: number; cost: number; profit: number };
}) {
  return (
    <section className="rounded-[1.5rem] border bg-card p-5">
      <h2 className="font-display text-3xl">{title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <p>Services: <strong>{summary.services}</strong></p>
        <p>Revenue: <strong>{formatMoney(summary.revenue)}</strong></p>
        <p>Costs: <strong>{formatMoney(summary.cost)}</strong></p>
        <p>Profit: <strong>{formatMoney(summary.profit)}</strong></p>
      </div>
    </section>
  );
}

function BreakdownCard({
  title,
  item,
}: {
  title: string;
  item: { revenue: number; cost: number; profit: number; services: number };
}) {
  return (
    <div className="rounded-[1.4rem] border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-2xl">{title}</h3>
        <span className="text-xs font-semibold uppercase text-muted-foreground">
          {item.services} services
        </span>
      </div>
      <div className="mt-3 grid gap-1 text-sm">
        <p>Revenue: {formatMoney(item.revenue)}</p>
        <p>Cost: {formatMoney(item.cost)}</p>
        <p className="font-semibold text-accent">Profit: {formatMoney(item.profit)}</p>
      </div>
    </div>
  );
}
