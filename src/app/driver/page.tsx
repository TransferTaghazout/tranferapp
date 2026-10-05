import { formatDisplayDate, formatDisplayTime, todayISO, tomorrowISO } from "@/lib/dates";
import { requireDriverSession } from "@/lib/auth";
import { getReservationsForDriver } from "@/lib/db/reservations";
import { DriverJobActions } from "@/app/driver/accept-button";
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
  const open = jobs.filter((item) => item.status !== "Completed");
  const done = jobs.filter((item) => item.status === "Completed");
  const groups = [
    { label: "Lyoum", items: open.filter((item) => item.date === today) },
    { label: "Ghedda", items: open.filter((item) => item.date === tomorrow) },
    {
      label: "Mnb3d",
      items: open.filter((item) => item.date > tomorrow),
    },
    { label: "Dart", items: done },
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
                <DriverJobActions
                  jobId={job.id}
                  driverCommission={job.driverCommission}
                  completed={job.status === "Completed"}
                />
              </article>
            ))
          )}
        </section>
      ))}
    </div>
  );
}
