import Link from "next/link";
import { CalendarDays, CircleDollarSign, Plus } from "lucide-react";
import { ConnectionBanner } from "@/components/setup/connection-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatCard } from "@/components/shared/stat-card";
import { ReservationCard } from "@/components/reservations/reservation-card";
import { formatInTimeZone } from "date-fns-tz";
import { EveningNotifier } from "@/components/briefing/evening-notifier";
import { TomorrowBoard } from "@/components/briefing/tomorrow-board";
import { driverWhatsAppMessage, tomorrowJobs } from "@/lib/briefing";
import { formatLongDate, todayISO, tomorrowISO } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { whatsappShareLink } from "@/lib/phone";
import { summarizeReservations } from "@/lib/db/finance";
import { loadWorkspace } from "@/lib/data";
import { TIMEZONE } from "@/lib/types";

export default async function TodayPage() {
  const today = todayISO();
  const { reservations, error, settings } = await loadWorkspace();
  const todays = reservations
    .filter((item) => item.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
  const summary = summarizeReservations(todays);
  const counts = {
    pending: todays.filter((item) => item.status === "Pending").length,
    confirmed: todays.filter((item) => item.status === "Confirmed").length,
    completed: todays.filter((item) => item.status === "Completed").length,
  };
  const tomorrowDate = tomorrowISO();
  const tomorrow = tomorrowJobs(reservations);
  const driverShares = Array.from(
    new Map(
      tomorrow
        .filter((job) => job.driverId && job.driverPhone)
        .map((job) => [
          job.driverId,
          {
            href: whatsappShareLink(
              driverWhatsAppMessage(reservations, job.driverId),
              job.driverPhone,
              settings.whatsappCountryCode,
            ),
            label: `WhatsApp ${job.driverName}`,
          },
        ]),
    ).values(),
  );
  const shareHref =
    driverShares[0]?.href ||
    whatsappShareLink(
      driverWhatsAppMessage(reservations),
      settings.driverWhatsApp,
      settings.whatsappCountryCode,
    );
  const afterSeven =
    Number(formatInTimeZone(new Date(), TIMEZONE, "H")) >= 19;

  return (
    <div className="space-y-6">
      <EveningNotifier tomorrowCount={tomorrow.length} tomorrowDate={tomorrowDate} />
      <ConnectionBanner />
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Today</p>
        <h1 className="mt-1 font-display text-4xl">{formatLongDate(today)}</h1>
        <p className="mt-1 text-muted-foreground">{summary.services} services on the board</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Services" value={String(summary.services)} tone="forest" />
        <StatCard label="Revenue" value={formatMoney(summary.revenue)} tone="sand" />
        <StatCard label="Costs" value={formatMoney(summary.cost)} />
        <StatCard label="Profit" value={formatMoney(summary.profit)} tone="ocean" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatusCount label="Pending" value={counts.pending} />
        <StatusCount label="Confirmed" value={counts.confirmed} />
        <StatusCount label="Completed" value={counts.completed} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickLink href="/reservations/new" icon={<Plus className="h-4 w-4" />} label="Add reservation" />
        <QuickLink href="/calendar" icon={<CalendarDays className="h-4 w-4" />} label="Calendar" />
        <QuickLink href="/finance" icon={<CircleDollarSign className="h-4 w-4" />} label="Finance" />
      </div>

      <TomorrowBoard
        date={tomorrowDate}
        jobs={tomorrow}
        shareHref={shareHref}
        shares={driverShares.slice(1)}
        highlight={afterSeven}
      />

      {error ? <ErrorState message={error} title="Unable to load today's services" /> : null}

      <section className="space-y-3">
        <h2 className="font-display text-3xl">Today&apos;s Services</h2>
        {todays.length === 0 && !error ? (
          <EmptyState
            title="No services today"
            description="Add the first transfer, activity or tour and it will appear here instantly."
            actionHref="/reservations/new"
            actionLabel="Add reservation"
          />
        ) : (
          <div className="space-y-3">
            {todays.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.2rem] border bg-card px-3 py-3 text-center">
      <p className="font-display text-3xl leading-none">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-card font-semibold shadow-sm"
    >
      {icon}
      {label}
    </Link>
  );
}
