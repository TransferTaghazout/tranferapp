import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { Reservation } from "@/lib/types";
import { formatDisplayTime, formatShortDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { telLink, whatsappShareLink } from "@/lib/phone";
import { calculateReservationFinance } from "@/lib/drive-finance";
import { bookingShareMessage } from "@/lib/briefing";
import { PaymentBadge, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

export function DriveCard({
  reservation,
  countryCode,
  href,
}: {
  reservation: Reservation;
  countryCode: string;
  href?: string;
}) {
  const finance = calculateReservationFinance(reservation);
  const phone = reservation.whatsapp || reservation.phone;
  const callHref = telLink(phone);
  const waHref = phone
    ? whatsappShareLink(bookingShareMessage(reservation), phone, countryCode)
    : "";
  const route =
    reservation.pickupLocation && reservation.destination
      ? `${reservation.pickupLocation} → ${reservation.destination}`
      : reservation.pickupLocation || reservation.destination;
  const openHref = href || `/drive/${reservation.id}`;

  return (
    <article className="overflow-hidden rounded-[1.5rem] border bg-card shadow-sm">
      <div className="grid grid-cols-[5.4rem_1fr] gap-3 p-4">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-primary px-2 py-3 text-primary-foreground">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">
            {formatShortDate(reservation.date)}
          </p>
          <p className="font-display text-2xl leading-none">{formatDisplayTime(reservation.time)}</p>
        </div>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-sand">{reservation.type}</p>
            <StatusBadge status={reservation.status} />
          </div>
          {route ? <p className="mt-1 truncate font-medium">{route}</p> : null}
          <h3 className="mt-1 truncate font-display text-2xl leading-tight">{reservation.customerName}</h3>
          <p className="text-sm text-muted-foreground">
            {reservation.numberOfPeople} {reservation.numberOfPeople === 1 ? "passenger" : "passengers"}
            {phone ? ` · ${phone}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4">
        <MoneyBox label="Reservation" value={formatMoney(finance.expectedAmount)} />
        <MoneyBox label="Commission" value={formatMoney(finance.commission)} tone="green" />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
        <PaymentBadge status={reservation.paymentStatus} />
        {finance.missingAmount > 0 && reservation.status === "Completed" ? (
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-rose-800">
            {formatMoney(finance.missingAmount)} missing
          </span>
        ) : null}
        {finance.extraAmount > 0 && reservation.status === "Completed" ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
            {formatMoney(finance.extraAmount)} extra
          </span>
        ) : null}
        {finance.remaining > 0 && reservation.paymentStatus === "Partially Paid" ? (
          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-orange-800">
            {formatMoney(finance.remaining)} remaining
          </span>
        ) : null}
      </div>

      <div className={`grid gap-2 p-4 ${callHref && waHref ? "grid-cols-3" : "grid-cols-2"}`}>
        <Button asChild size="sm">
          <Link href={openHref}>Open</Link>
        </Button>
        {waHref ? (
          <Button asChild variant="ocean" size="sm">
            <a href={waHref} target="_blank" rel="noreferrer">
              <MessageCircle /> WhatsApp
            </a>
          </Button>
        ) : null}
        {callHref ? (
          <Button asChild variant="outline" size="sm">
            <a href={callHref}>
              <Phone /> Call
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function MoneyBox({ label, value, tone }: { label: string; value: string; tone?: "green" }) {
  return (
    <div className={`rounded-2xl px-3 py-2 ${tone === "green" ? "bg-emerald-100" : "bg-muted"}`}>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-xl leading-none">{value}</p>
    </div>
  );
}
