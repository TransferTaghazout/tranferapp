import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDisplayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { loadWorkspace } from "@/lib/data";

export default async function CustomersPage() {
  const { customers } = await loadWorkspace();

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Guests</p>
        <h1 className="mt-1 font-display text-4xl">Customers</h1>
      </header>
      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Customers are created automatically when you save a reservation."
        />
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="block rounded-[1.4rem] border bg-card p-5"
            >
              <h2 className="font-display text-2xl">{customer.name}</h2>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p>Reservations: {customer.totalReservations}</p>
                <p>Total spent: {formatMoney(customer.totalSpent)}</p>
                <p className="col-span-2">
                  Last reservation:{" "}
                  {customer.lastReservation ? formatDisplayDate(customer.lastReservation) : "—"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
