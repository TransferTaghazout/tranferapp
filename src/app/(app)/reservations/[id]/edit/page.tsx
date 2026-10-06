import { notFound } from "next/navigation";
import { ReservationForm } from "@/components/reservations/reservation-form";
import { currentTime, todayISO } from "@/lib/dates";
import { loadWorkspace } from "@/lib/data";

export default async function EditReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { reservations, services, customers, drivers, settings } = await loadWorkspace();
  const reservation = reservations.find((item) => item.id === id);
  if (!reservation) notFound();
  const recognized = customers.find(
    (item) => item.phone.replace(/\D/g, "").slice(-9) === reservation.phone.replace(/\D/g, "").slice(-9),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Edit</p>
        <h1 className="mt-1 font-display text-4xl">{reservation.serviceName}</h1>
      </header>
      <ReservationForm
        reservation={reservation}
        services={services.filter((s) => s.active || s.name === reservation.serviceName)}
        drivers={drivers}
        defaultDate={todayISO()}
        defaultTime={currentTime(settings.timezone)}
        countryCode={settings.whatsappCountryCode}
      />
    </div>
  );
}
