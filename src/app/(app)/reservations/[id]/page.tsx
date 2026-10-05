import Link from "next/link";
import { notFound } from "next/navigation";
import { ReservationActions } from "@/components/reservations/reservation-actions";
import { PaymentBadge, StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatDisplayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { loadWorkspace } from "@/lib/data";
import { customerReservations } from "@/lib/db/customers";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { reservations, customers, settings } = await loadWorkspace();
  const reservation = reservations.find((item) => item.id === id);
  if (!reservation) notFound();

  const history = customerReservations(reservations, reservation.phone);
  const customer = customers.find(
    (item) => item.phone.replace(/\D/g, "").slice(-9) === reservation.phone.replace(/\D/g, "").slice(-9),
  );

  const rows = [
    ["Name", reservation.customerName],
    ["Driver", reservation.driverName || reservation.driver || "—"],
    ["Pickup", reservation.pickupLocation || "—"],
    ["Destination", reservation.destination || "—"],
    ["Price", formatMoney(reservation.price)],
    ["Profit", formatMoney(reservation.profit)],
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">{reservation.type}</p>
        <h1 className="mt-1 font-display text-4xl">{reservation.customerName}</h1>
        <p className="mt-1 text-muted-foreground">{formatDateTime(reservation.date, reservation.time)}</p>
        <div className="mt-3 flex gap-2">
          <StatusBadge status={reservation.status} />
          <PaymentBadge status={reservation.paymentStatus} />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[1.4rem] bg-amber-100 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">My commission</p>
          <p className="font-display text-3xl text-amber-950">{formatMoney(reservation.commission)}</p>
        </div>
        <div className="rounded-[1.4rem] bg-emerald-100 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Driver commission</p>
          <p className="font-display text-3xl text-emerald-950">
            {formatMoney(reservation.driverCommission)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border bg-card">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[8rem_1fr] gap-3 border-b px-5 py-3 last:border-b-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
          </div>
        ))}
      </div>

      {reservation.description || reservation.internalNotes ? (
        <div className="rounded-[1.5rem] border bg-card p-5">
          <h2 className="font-display text-2xl">Notes</h2>
          {reservation.description ? <p className="mt-2 text-sm">{reservation.description}</p> : null}
          {reservation.internalNotes ? (
            <p className="mt-2 text-sm text-muted-foreground">{reservation.internalNotes}</p>
          ) : null}
        </div>
      ) : null}

      {customer ? (
        <Link href={`/customers/${customer.id}`} className="block rounded-[1.5rem] bg-[#e7f3f8] p-5">
          <p className="font-semibold">Customer: {customer.name}</p>
          <p className="mt-1 text-sm">Reservations: {customer.totalReservations}</p>
          <p className="text-sm">Total Spent: {formatMoney(customer.totalSpent)}</p>
          <p className="text-sm">
            Last Reservation: {customer.lastReservation ? formatDisplayDate(customer.lastReservation) : "—"}
          </p>
          <p className="mt-2 text-sm font-semibold text-accent">View previous reservations →</p>
        </Link>
      ) : history.length > 1 ? (
        <div className="rounded-[1.5rem] bg-[#e7f3f8] p-5 text-sm">
          {history.length} reservations on this phone number.
        </div>
      ) : null}

      <ReservationActions
        reservation={reservation}
        countryCode={settings.whatsappCountryCode}
      />
    </div>
  );
}
