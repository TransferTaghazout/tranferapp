import { requireDriverSession } from "@/lib/auth";
import { getReservationsForDriver } from "@/lib/db/reservations";
import { getSettings } from "@/lib/db/settings";
import { DEFAULT_SETTINGS, Reservation } from "@/lib/types";
import { formatLongDate, monthRange, todayISO, tomorrowISO } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { DriverJobCard } from "@/components/driver/job-card";
import { DriverNotifier } from "@/components/driver/driver-notifier";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function sumCommission(jobs: Reservation[]) {
  return jobs.reduce((total, job) => total + (job.driverCommission || 0), 0);
}

export default async function DriverHomePage() {
  const session = await requireDriverSession().catch(() => null);
  if (!session) redirect("/driver/login");

  const jobs = await getReservationsForDriver(session.driverId)
    .then((items) => items.filter((item) => item.status !== "Cancelled" && item.status !== "No Show"))
    .catch(() => []);
  const settings = await getSettings().catch(() => DEFAULT_SETTINGS);
  const today = todayISO();
  const tomorrow = tomorrowISO();
  const month = monthRange(today);
  const countryCode = settings.whatsappCountryCode;

  const byTime = (items: Reservation[]) =>
    [...items].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const open = byTime(jobs.filter((item) => item.status !== "Completed"));
  const done = [...jobs]
    .filter((item) => item.status === "Completed")
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const todayJobs = byTime(jobs.filter((item) => item.date === today));
  const tomorrowJobs = byTime(jobs.filter((item) => item.date === tomorrow));
  const allAssigned = open;
  const nextJob = todayJobs.find((item) => item.status !== "Completed") || open[0] || null;

  const todayPay = sumCommission(todayJobs.filter((item) => item.status !== "Completed"));
  const tomorrowPay = sumCommission(tomorrowJobs.filter((item) => item.status !== "Completed"));
  const openPay = sumCommission(open);
  const earned = sumCommission(done);
  const monthEarned = sumCommission(
    done.filter((item) => item.date >= month.from && item.date <= month.to),
  );

  return (
    <div className="space-y-6">
      <DriverNotifier
        jobs={open.map((job) => ({
          id: job.id,
          date: job.date,
          time: job.time,
          customerName: job.customerName,
          pickupLocation: job.pickupLocation,
          destination: job.destination,
          driverCommission: job.driverCommission,
        }))}
        todayCount={todayJobs.filter((item) => item.status !== "Completed").length}
        tomorrowCount={tomorrowJobs.filter((item) => item.status !== "Completed").length}
        tomorrowDate={tomorrow}
      />

      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Today</p>
        <h1 className="mt-1 font-display text-4xl">{formatLongDate(today)}</h1>
        <p className="mt-1 text-muted-foreground">
          {todayJobs.length} {todayJobs.length === 1 ? "job" : "jobs"} on your board
        </p>
      </header>

      <div id="finance" className="scroll-mt-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Finance</p>
        <p className="text-sm text-muted-foreground">
          Your commission only — this is what we will pay you.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Today" value={formatMoney(todayPay)} tone="forest" hint="Open jobs today" />
          <StatCard label="Tomorrow" value={formatMoney(tomorrowPay)} tone="sand" hint="Assigned tomorrow" />
          <StatCard
            label="We will pay you"
            value={formatMoney(openPay)}
            tone="ocean"
            hint={`${open.length} open ${open.length === 1 ? "job" : "jobs"}`}
          />
          <StatCard label="You earned" value={formatMoney(earned)} hint={`This month ${formatMoney(monthEarned)}`} />
        </div>
      </div>

      <nav className="grid grid-cols-4 gap-2">
        <Jump href="#today" label="Today" count={todayJobs.length} />
        <Jump href="#tomorrow" label="Tomorrow" count={tomorrowJobs.length} />
        <Jump href="#all" label="All jobs" count={allAssigned.length} />
        <Jump href="#finance" label="Pay" />
      </nav>

      <section id="today" className="scroll-mt-4 space-y-3">
        <h2 className="font-display text-3xl">Today</h2>
        {todayJobs.length === 0 ? (
          <EmptyState
            title="No jobs today"
            description="When the office assigns a transfer for today, it will appear here with time, pickup and destination."
          />
        ) : (
          todayJobs.map((job) => (
            <DriverJobCard
              key={job.id}
              job={job}
              countryCode={countryCode}
              highlight={job.id === nextJob?.id}
            />
          ))
        )}
      </section>

      <section id="tomorrow" className="scroll-mt-4 space-y-3">
        <h2 className="font-display text-3xl">Tomorrow</h2>
        {tomorrowJobs.length === 0 ? (
          <EmptyState
            title="No jobs tomorrow"
            description="Tomorrow's assigned transfers will show here, including the commission we will pay you."
          />
        ) : (
          tomorrowJobs.map((job) => (
            <DriverJobCard key={job.id} job={job} countryCode={countryCode} />
          ))
        )}
      </section>

      <section id="all" className="scroll-mt-4 space-y-3">
        <h2 className="font-display text-3xl">All assigned jobs</h2>
        {allAssigned.length === 0 ? (
          <EmptyState
            title="No assigned jobs"
            description="Every transfer the office gives you will stay on this list until you mark it done."
          />
        ) : (
          allAssigned.map((job) => (
            <DriverJobCard key={job.id} job={job} countryCode={countryCode} />
          ))
        )}
      </section>

      {done.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-3xl">Completed</h2>
          {done.slice(0, 20).map((job) => (
            <DriverJobCard key={job.id} job={job} countryCode={countryCode} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

function Jump({ href, label, count }: { href: string; label: string; count?: number }) {
  return (
    <a
      href={href}
      className="rounded-2xl bg-card px-2 py-3 text-center shadow-sm"
    >
      {typeof count === "number" ? (
        <p className="font-display text-2xl leading-none">{count}</p>
      ) : (
        <p className="font-display text-2xl leading-none">DH</p>
      )}
      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
    </a>
  );
}
