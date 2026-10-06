import { notFound, redirect } from "next/navigation";
import { requireDriverSession } from "@/lib/auth";
import { getReservationById } from "@/lib/db/reservations";
import { getSettings } from "@/lib/db/settings";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { CompleteForm } from "@/components/drive/complete-form";
import { CancelForm } from "@/components/drive/cancel-form";
import { DriveCard } from "@/components/drive/drive-card";
import { formatMoney } from "@/lib/money";
import { calculateReservationFinance } from "@/lib/drive-finance";

export const dynamic = "force-dynamic";

export default async function DriverJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireDriverSession().catch(() => null);
  if (!session) redirect("/driver/login");
  const { id } = await params;
  const job = await getReservationById(id).catch(() => null);
  if (!job || job.driverId !== session.driverId) notFound();
  const settings = await getSettings().catch(() => DEFAULT_SETTINGS);
  const finance = calculateReservationFinance(job);
  const closed = job.status === "Completed" || job.status === "Cancelled" || job.status === "No Show";

  return (
    <div className="space-y-5">
      <DriveCard reservation={job} countryCode={settings.whatsappCountryCode} href={`/driver/${job.id}`} />
      <div className="grid grid-cols-3 gap-2">
        <Mini label="Booked" value={formatMoney(finance.expectedAmount)} />
        <Mini label="Commission" value={formatMoney(finance.commission)} />
        <Mini label="We pay you" value={formatMoney(finance.commission)} />
      </div>
      {!closed ? <CompleteForm reservation={job} /> : null}
      {!closed ? <CancelForm reservation={job} /> : null}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card px-3 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-xl leading-none">{value}</p>
    </div>
  );
}
