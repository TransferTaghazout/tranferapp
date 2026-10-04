import { MonthCalendar } from "@/components/calendar/month-calendar";
import { ConnectionBanner } from "@/components/setup/connection-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { ReservationCard } from "@/components/reservations/reservation-card";
import { StatCard } from "@/components/shared/stat-card";
import { formatLongDate, todayISO } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { loadWorkspace } from "@/lib/data";
import { summarizeReservations } from "@/lib/sheets/finance";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const selected = params.date || todayISO();
  const selectedDate = new Date(`${selected}T12:00:00`);
  const { reservations } = await loadWorkspace();
  const dates = new Set(reservations.map((item) => item.date));
  const dayItems = reservations
    .filter((item) => item.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time));
  const summary = summarizeReservations(dayItems);

  return (
    <div className="space-y-6">
      <ConnectionBanner />
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Calendar</p>
        <h1 className="mt-1 font-display text-4xl">Monthly board</h1>
      </header>
      <MonthCalendar
        year={selectedDate.getFullYear()}
        month={selectedDate.getMonth()}
        selected={selected}
        datesWithReservations={dates}
      />
      <section className="space-y-3">
        <h2 className="font-display text-3xl">{formatLongDate(selected)}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Services" value={String(summary.services)} />
          <StatCard label="Revenue" value={formatMoney(summary.revenue)} tone="sand" />
          <StatCard label="Costs" value={formatMoney(summary.cost)} />
          <StatCard label="Profit" value={formatMoney(summary.profit)} tone="ocean" />
        </div>
        {dayItems.length === 0 ? (
          <EmptyState
            title="No reservations on this date"
            description="Tap + to add a transfer or activity for this day."
            actionHref={`/reservations/new?date=${selected}`}
            actionLabel="+ New Reservation"
          />
        ) : (
          <div className="space-y-3">
            {dayItems.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
