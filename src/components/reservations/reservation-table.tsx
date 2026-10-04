import Link from "next/link";
import { Reservation } from "@/lib/types";
import { formatDisplayDate, formatDisplayTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { PaymentBadge, StatusBadge } from "@/components/shared/status-badge";

export function ReservationTable({ reservations }: { reservations: Reservation[] }) {
  return (
    <div className="hidden overflow-hidden rounded-[1.4rem] border bg-card md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Route</th>
            <th className="px-4 py-3">Finance</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="px-4 py-3">
                <Link href={`/reservations/${item.id}`} className="font-semibold hover:underline">
                  {formatDisplayDate(item.date)}
                </Link>
                <div className="text-muted-foreground">{formatDisplayTime(item.time)}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium">{item.type}</div>
              </td>
              <td className="px-4 py-3">
                <div>{item.customerName}</div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {item.pickupLocation && item.destination
                  ? `${item.pickupLocation} → ${item.destination}`
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <div>{formatMoney(item.price)}</div>
                <div className="text-accent">+{formatMoney(item.profit)}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={item.status} />
                  <PaymentBadge status={item.paymentStatus} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
