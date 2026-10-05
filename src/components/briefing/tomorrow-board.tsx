import { ShareTomorrowButton } from "@/components/briefing/share-tomorrow";
import { ReservationCard } from "@/components/reservations/reservation-card";
import { formatLongDate } from "@/lib/dates";
import { Reservation } from "@/lib/types";

export function TomorrowBoard({
  date,
  jobs,
  shareHref,
  shares = [],
  highlight,
}: {
  date: string;
  jobs: Reservation[];
  shareHref: string;
  shares?: { href: string; label: string }[];
  highlight?: boolean;
}) {
  return (
    <section
      className={`space-y-3 rounded-[1.5rem] p-4 ${
        highlight ? "bg-[#e7f3f8] border border-accent/20" : "border bg-card"
      }`}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
          19:00 · Driver briefing
        </p>
        <h2 className="mt-1 font-display text-3xl">Khedma dyal ghedda</h2>
        <p className="text-sm text-muted-foreground">
          {formatLongDate(date)} · {jobs.length} services
        </p>
      </div>
      <ShareTomorrowButton href={shareHref} />
      {shares.map((share) => (
        <ShareTomorrowButton key={share.href} href={share.href} label={share.label} />
      ))}
      {jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ma kayn hatta service ghedda.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      )}
    </section>
  );
}
