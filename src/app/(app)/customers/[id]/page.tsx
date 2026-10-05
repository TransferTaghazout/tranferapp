import { notFound } from "next/navigation";
import { ReservationCard } from "@/components/reservations/reservation-card";
import { ReservationTable } from "@/components/reservations/reservation-table";
import { formatDisplayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { loadWorkspace } from "@/lib/data";
import { customerReservations } from "@/lib/db/customers";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { customers, reservations } = await loadWorkspace();
  const customer = customers.find((item) => item.id === id);
  if (!customer) notFound();
  const history = customerReservations(reservations, customer.phone);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Customer history</p>
        <h1 className="mt-1 font-display text-4xl">{customer.name}</h1>
        <p className="text-muted-foreground">{customer.phone}</p>
      </header>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[1.3rem] bg-primary p-4 text-primary-foreground">
          <p className="text-xs uppercase text-white/70">Reservations</p>
          <p className="font-display text-3xl">{customer.totalReservations}</p>
        </div>
        <div className="rounded-[1.3rem] bg-[#e7f3f8] p-4">
          <p className="text-xs uppercase text-muted-foreground">Total spent</p>
          <p className="font-display text-3xl">{formatMoney(customer.totalSpent)}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Last reservation: {customer.lastReservation ? formatDisplayDate(customer.lastReservation) : "—"}
      </p>
      <div className="space-y-3 md:hidden">
        {history.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>
      <ReservationTable reservations={history} />
    </div>
  );
}
