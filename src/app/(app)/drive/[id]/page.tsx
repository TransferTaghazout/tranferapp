import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { CompleteForm } from "@/components/drive/complete-form";
import { CancelForm } from "@/components/drive/cancel-form";
import { CommissionForm } from "@/components/drive/commission-form";
import { AdjustmentForm } from "@/components/drive/adjustment-form";
import { StatusButtons } from "@/components/drive/status-buttons";
import { PaymentBadge, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { loadWorkspace } from "@/lib/data";
import { getFinancialHistory } from "@/lib/db/finance-history";
import { formatDateTime, formatDisplayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { calculateReservationFinance } from "@/lib/drive-finance";
import { bookingShareMessage } from "@/lib/briefing";
import { telLink, whatsappShareLink } from "@/lib/phone";

export const dynamic = "force-dynamic";

export default async function DriveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { reservations, settings } = await loadWorkspace();
  const reservation = reservations.find((item) => item.id === id);
  if (!reservation) notFound();
  const finance = calculateReservationFinance(reservation);
  const history = await getFinancialHistory(id).catch(() => []);
  const phone = reservation.whatsapp || reservation.phone;
  const wa = phone
    ? whatsappShareLink(bookingShareMessage(reservation), phone, settings.whatsappCountryCode)
    : "";
  const tel = telLink(reservation.phone);
  const closed = reservation.status === "Completed" || reservation.status === "Cancelled" || reservation.status === "No Show";

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-28">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">{reservation.type}</p>
        <h1 className="mt-1 font-display text-4xl">{reservation.customerName}</h1>
        <p className="mt-1 text-muted-foreground">{formatDateTime(reservation.date, reservation.time)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge status={reservation.status} />
          <PaymentBadge status={reservation.paymentStatus} />
        </div>
      </header>

      <section className="rounded-[1.5rem] border bg-card p-4">
        <h2 className="font-display text-2xl">Customer</h2>
        <Info label="Name" value={reservation.customerName} />
        <Info label="Phone" value={reservation.phone || "—"} />
        <Info label="WhatsApp" value={reservation.whatsapp || reservation.phone || "—"} />
        <Info label="People" value={String(reservation.numberOfPeople)} />
      </section>

      <section className="rounded-[1.5rem] border bg-card p-4">
        <h2 className="font-display text-2xl">Service</h2>
        <Info label="Service" value={reservation.serviceName || reservation.type} />
        <Info label="Date" value={formatDisplayDate(reservation.date)} />
        <Info label="Time" value={reservation.time} />
        <Info label="Pickup" value={reservation.pickupLocation || "—"} />
        <Info label="Destination" value={reservation.destination || "—"} />
        <Info label="Driver" value={reservation.driverName || reservation.driver || "—"} />
        <Info label="Vehicle" value={reservation.vehicle || "—"} />
        <Info label="Flight" value={reservation.flightNumber || "—"} />
      </section>

      <section className="space-y-3 rounded-[1.5rem] border bg-card p-4">
        <h2 className="font-display text-2xl">Financial information</h2>
        <div className="grid grid-cols-3 gap-2">
          <Money label="Reservation" value={formatMoney(finance.expectedAmount)} />
          <Money label="Commission" value={formatMoney(finance.commission)} />
          <Money label="Expected net" value={formatMoney(finance.expectedAmount - finance.commission)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Money label="Received" value={formatMoney(finance.amountReceived)} />
          <Money
            label={finance.missingAmount > 0 ? "Missing" : finance.extraAmount > 0 ? "Extra" : "Difference"}
            value={formatMoney(finance.missingAmount || finance.extraAmount)}
            tone={finance.missingAmount > 0 ? "red" : finance.extraAmount > 0 ? "green" : "neutral"}
          />
        </div>
        {finance.remaining > 0 ? (
          <p className="rounded-2xl bg-orange-100 px-3 py-2 text-sm font-bold text-orange-800">
            {formatMoney(finance.remaining)} remaining
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Office net {formatMoney(finance.officeNet)}
          {reservation.adjustmentAmount
            ? ` · Adjustment ${formatMoney(reservation.adjustmentAmount)}`
            : ""}
        </p>
        {reservation.adjustmentReason ? (
          <p className="text-sm">Reason: {reservation.adjustmentReason}</p>
        ) : null}
        {reservation.financialNotes ? (
          <p className="text-sm text-muted-foreground">{reservation.financialNotes}</p>
        ) : null}
      </section>

      {!closed ? <StatusButtons reservation={reservation} /> : null}
      {!closed ? <CompleteForm reservation={reservation} /> : null}
      {!closed ? <CancelForm reservation={reservation} /> : null}
      {reservation.status === "Completed" ? <AdjustmentForm reservation={reservation} /> : null}
      <CommissionForm reservation={reservation} />

      {history.length > 0 ? (
        <section className="rounded-[1.5rem] border bg-card p-4">
          <h2 className="font-display text-2xl">Audit history</h2>
          <ul className="mt-3 space-y-3">
            {history.map((entry) => (
              <li key={entry.id} className="border-b pb-3 text-sm last:border-0">
                <p className="font-semibold">{entry.action}</p>
                <p className="text-muted-foreground">
                  {entry.timestamp} · {entry.user || "Office"}
                </p>
                <p>
                  {entry.oldValue} → {entry.newValue}
                  {entry.difference ? ` (${formatMoney(entry.difference)})` : ""}
                </p>
                {entry.reason ? <p>{entry.reason}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        {wa ? (
          <Button asChild variant="ocean">
            <a href={wa} target="_blank" rel="noreferrer">
              <MessageCircle /> WhatsApp
            </a>
          </Button>
        ) : null}
        {tel ? (
          <Button asChild variant="outline">
            <a href={tel}>
              <Phone /> Call
            </a>
          </Button>
        ) : null}
        <Button asChild variant="secondary">
          <Link href={`/reservations/${reservation.id}/edit`}>Edit booking</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/drive">Back to Drive</Link>
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 border-b py-2 last:border-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Money({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "red" | "green";
}) {
  return (
    <div
      className={`rounded-2xl px-3 py-3 ${
        tone === "red" ? "bg-rose-100" : tone === "green" ? "bg-emerald-100" : "bg-muted"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-2xl leading-none">{value}</p>
    </div>
  );
}
