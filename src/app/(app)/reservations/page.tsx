import { ReservationFilters } from "@/components/reservations/filters";
import { ReservationCard } from "@/components/reservations/reservation-card";
import { ReservationTable } from "@/components/reservations/reservation-table";
import { ConnectionBanner } from "@/components/setup/connection-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { loadWorkspace } from "@/lib/data";
import { filterReservations } from "@/lib/filters";
import Link from "next/link";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { reservations, services } = await loadWorkspace();
  const filtered = filterReservations(reservations, {
    q: params.q,
    date: params.date,
    service: params.service,
    type: params.type,
    status: params.status,
    paymentStatus: params.paymentStatus,
    range: params.range || "all",
  }).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  return (
    <div className="space-y-5">
      <ConnectionBanner />
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Reservations</p>
          <h1 className="mt-1 font-display text-4xl">All bookings</h1>
          <p className="text-muted-foreground">{filtered.length} shown</p>
        </div>
        <Button asChild>
          <Link href="/reservations/new">Add reservation</Link>
        </Button>
      </header>
      <ReservationFilters
        services={[...new Set(services.map((s) => s.name))]}
        values={{
          q: params.q || "",
          date: params.date || "",
          service: params.service || "",
          type: params.type || "",
          status: params.status || "",
          paymentStatus: params.paymentStatus || "",
          range: params.range || "all",
        }}
      />
      {filtered.length === 0 ? (
        <EmptyState
          title="No reservations match"
          description="Try another date or create a new booking."
          actionHref="/reservations/new"
          actionLabel="Add reservation"
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
          <ReservationTable reservations={filtered} />
        </>
      )}
    </div>
  );
}
