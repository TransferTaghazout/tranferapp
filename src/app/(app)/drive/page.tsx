import { DriveCard } from "@/components/drive/drive-card";
import { DriveDashboard } from "@/components/drive/drive-dashboard";
import { DriveFilters } from "@/components/drive/drive-filters";
import { DriveTable } from "@/components/drive/drive-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { loadWorkspace } from "@/lib/data";
import { monthRange, todayISO, weekRange, yesterdayISO } from "@/lib/dates";
import { summarizeDrive } from "@/lib/drive-finance";
import { filterReservations } from "@/lib/filters";
import { formatMoney } from "@/lib/money";
import { StatCard } from "@/components/shared/stat-card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DrivePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const range = params.range || "today";
  const { reservations, drivers, settings } = await loadWorkspace();
  const today = todayISO();
  const filtered = filterReservations(reservations, {
    date: params.date,
    from: params.from,
    to: params.to,
    type: params.type,
    status: params.status,
    paymentStatus: params.paymentStatus,
    driverId: params.driverId,
    range,
  }).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const todaySummary = summarizeDrive(reservations, { from: today, to: today });
  const week = weekRange(today);
  const month = monthRange(today);
  const yesterday = yesterdayISO();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Drive</p>
          <h1 className="mt-1 font-display text-4xl">Operations</h1>
          <p className="text-muted-foreground">Booked → completed → received → missing → commission</p>
        </div>
        <Button asChild>
          <Link href="/reservations/new">Add reservation</Link>
        </Button>
      </header>

      <DriveDashboard title="Today" summary={todaySummary} />

      <section className="space-y-3">
        <h2 className="font-display text-3xl">Commission report</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Today" value={formatMoney(todaySummary.commission)} tone="forest" />
          <StatCard
            label="Yesterday"
            value={formatMoney(summarizeDrive(reservations, { from: yesterday, to: yesterday }).commission)}
          />
          <StatCard label="This week" value={formatMoney(summarizeDrive(reservations, week).commission)} tone="sand" />
          <StatCard label="This month" value={formatMoney(summarizeDrive(reservations, month).commission)} tone="ocean" />
        </div>
      </section>

      <DriveFilters
        drivers={drivers}
        values={{
          range,
          date: params.date || "",
          from: params.from || "",
          to: params.to || "",
          status: params.status || "",
          paymentStatus: params.paymentStatus || "",
          type: params.type || "",
          driverId: params.driverId || "",
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No reservations in this view"
          description="Add a booking or choose another day, status or driver."
          actionHref="/reservations/new"
          actionLabel="Add reservation"
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((reservation) => (
              <DriveCard
                key={reservation.id}
                reservation={reservation}
                countryCode={settings.whatsappCountryCode}
              />
            ))}
          </div>
          <DriveTable reservations={filtered} />
        </>
      )}
    </div>
  );
}
