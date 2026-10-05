import { formatDisplayDate, formatDisplayTime, todayISO, tomorrowISO } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { requireDriverSession } from "@/lib/auth";
import { getReservationsForDriver } from "@/lib/db/reservations";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DriverHomePage() {
  const session = await requireDriverSession().catch(() => null);
  if (!session) redirect("/driver/login");

  const jobs = (await getReservationsForDriver(session.driverId)).filter(
    (item) => item.status !== "Cancelled",
  );
  const today = todayISO();
  const tomorrow = tomorrowISO();
  const groups = [
    { label: "Lyoum", items: jobs.filter((item) => item.date === today) },
    { label: "Ghedda", items: jobs.filter((item) => item.date === tomorrow) },
    {
      label: "Mnb3d",
      items: jobs.filter((item) => item.date > tomorrow),
    },
  ];

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.label} className="space-y-3">
          <h2 className="font-display text-3xl">{group.label}</h2>
          {group.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ma kayn hatta khedma.</p>
          ) : (
            group.items.map((job) => (
              <article key={job.id} className="rounded-[1.4rem] border bg-card p-4">
                <p className="text-sm font-semibold text-muted-foreground">
                  {formatDisplayDate(job.date)} · {formatDisplayTime(job.time)}
                </p>
                <h3 className="mt-1 font-display text-2xl">{job.customerName}</h3>
                <p className="text-sm">{job.type}</p>
                {job.pickupLocation || job.destination ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.pickupLocation} → {job.destination}
                  </p>
                ) : null}
                {job.description ? <p className="mt-2 text-sm">{job.description}</p> : null}
                <div className="mt-4 rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
                  <p className="text-xs uppercase tracking-wider text-white/70">Taman service</p>
                  <p className="font-display text-3xl">
                    {formatMoney(job.commission || job.cost)}
                  </p>
                </div>
              </article>
            ))
          )}
        </section>
      ))}
    </div>
  );
}
