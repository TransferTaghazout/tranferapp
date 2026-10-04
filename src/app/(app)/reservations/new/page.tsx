import { ReservationForm } from "@/components/reservations/reservation-form";
import { ConnectionBanner } from "@/components/setup/connection-banner";
import { currentTime, todayISO } from "@/lib/dates";
import { loadWorkspace } from "@/lib/data";

export default async function NewReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; phone?: string }>;
}) {
  const params = await searchParams;
  const { services, customers, settings } = await loadWorkspace();
  const phone = params.phone ?? "";
  const recognized = phone
    ? customers.find((c) =>
        c.phone.replace(/\D/g, "").endsWith(phone.replace(/\D/g, "").slice(-9)),
      )
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <ConnectionBanner />
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Create</p>
        <h1 className="mt-1 font-display text-4xl">New Reservation</h1>
        <p className="text-muted-foreground">Smiya, date, type, transfer, description, finance.</p>
      </header>
      <ReservationForm
        services={services.filter((s) => s.active)}
        customers={customers}
        recognizedCustomer={recognized}
        defaultDate={params.date || todayISO()}
        defaultTime={currentTime(settings.timezone)}
      />
    </div>
  );
}
