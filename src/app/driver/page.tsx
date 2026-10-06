import { requireDriverSession } from "@/lib/auth";
import { getReservationsForDriver } from "@/lib/db/reservations";
import { getSettings } from "@/lib/db/settings";
import { DEFAULT_SETTINGS, Reservation } from "@/lib/types";
import { todayISO, tomorrowISO } from "@/lib/dates";
import { DriverJobCard } from "@/components/driver/job-card";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DriverHomePage() {
  const session = await requireDriverSession().catch(() => null);
  if (!session) redirect("/driver/login");

  const jobs = await getReservationsForDriver(session.driverId)
    .then((items) => items.filter((item) => item.status !== "Cancelled" && item.status !== "No Show"))
    .catch(() => []);
  const settings = await getSettings().catch(() => DEFAULT_SETTINGS);
  const today = todayISO();
  const tomorrow = tomorrowISO();
  const open = jobs
    .filter((item) => item.status !== "Completed")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const done = jobs
    .filter((item) => item.status === "Completed")
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const todayJobs = open.filter((item) => item.date === today);
  const tomorrowJobs = open.filter((item) => item.date === tomorrow);
  const laterJobs = open.filter((item) => item.date > tomorrow);
  const nextJob = todayJobs[0] || tomorrowJobs[0] || laterJobs[0] || null;
  const restToday = todayJobs.filter((item) => item.id !== nextJob?.id);
  const restTomorrow = tomorrowJobs.filter((item) => item.id !== nextJob?.id);
  const restLater = laterJobs.filter((item) => item.id !== nextJob?.id);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Today" value={todayJobs.length} />
        <Stat label="Open" value={open.length} />
        <Stat label="Done" value={done.length} />
      </div>

      {nextJob ? (
        <DriverJobCard
          job={nextJob}
          countryCode={settings.whatsappCountryCode}
          highlight
        />
      ) : (
        <div className="rounded-[1.5rem] border border-dashed bg-card px-5 py-10 text-center">
          <p className="font-display text-3xl">No jobs assigned</p>
          <p className="mt-2 text-sm text-muted-foreground">
            When the office assigns a transfer, it will show here with time, pickup and destination.
          </p>
        </div>
      )}

      <JobGroup title="Today" jobs={restToday} countryCode={settings.whatsappCountryCode} />
      <JobGroup title="Tomorrow" jobs={restTomorrow} countryCode={settings.whatsappCountryCode} />
      <JobGroup title="Later" jobs={restLater} countryCode={settings.whatsappCountryCode} />
      <JobGroup title="Completed" jobs={done} countryCode={settings.whatsappCountryCode} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card px-3 py-3 text-center shadow-sm">
      <p className="font-display text-3xl leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function JobGroup({
  title,
  jobs,
  countryCode,
}: {
  title: string;
  jobs: Reservation[];
  countryCode: string;
}) {
  if (jobs.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl">{title}</h2>
      {jobs.map((job) => (
        <DriverJobCard key={job.id} job={job} countryCode={countryCode} />
      ))}
    </section>
  );
}
