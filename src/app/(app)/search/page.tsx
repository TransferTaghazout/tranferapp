import { ReservationCard } from "@/components/reservations/reservation-card";
import { ReservationTable } from "@/components/reservations/reservation-table";
import { EmptyState } from "@/components/shared/empty-state";
import { loadWorkspace } from "@/lib/data";
import { matchesSearch } from "@/lib/sheets/reservations";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { reservations } = await loadWorkspace();
  const results = q
    ? reservations.filter((item) => matchesSearch(item, q))
    : [];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Search</p>
        <h1 className="mt-1 font-display text-4xl">Find a booking</h1>
      </header>
      <form className="flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Name, phone, ID, service, pickup, destination"
          className="h-14 flex-1 rounded-2xl border bg-card px-4"
        />
        <button className="h-14 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground">
          Search
        </button>
      </form>
      {!q ? (
        <EmptyState
          title="Search the operations desk"
          description="Look up a guest, phone number, reservation ID or transfer route."
        />
      ) : results.length === 0 ? (
        <EmptyState title="No results" description="Nothing matched that search." />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{results.length} results</p>
          <div className="space-y-3 md:hidden">
            {results.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
          <ReservationTable reservations={results} />
        </>
      )}
    </div>
  );
}
