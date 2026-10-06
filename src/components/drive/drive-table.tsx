import Link from "next/link";
import { Reservation } from "@/lib/types";
import { formatDisplayDate, formatDisplayTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { calculateReservationFinance } from "@/lib/drive-finance";
import { PaymentBadge, StatusBadge } from "@/components/shared/status-badge";

export function DriveTable({ reservations }: { reservations: Reservation[] }) {
  return (
    <div className="hidden overflow-x-auto rounded-[1.4rem] border bg-card md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Route</th>
            <th className="px-4 py-3">Booked</th>
            <th className="px-4 py-3">Received</th>
            <th className="px-4 py-3">Commission</th>
            <th className="px-4 py-3">Gap</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((item) => {
            const finance = calculateReservationFinance(item);
            return (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">
                  <Link href={`/drive/${item.id}`} className="font-semibold hover:underline">
                    {formatDisplayDate(item.date)}
                  </Link>
                  <div className="text-muted-foreground">{formatDisplayTime(item.time)}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{item.customerName}</div>
                  <div className="text-muted-foreground">{item.numberOfPeople} pax</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {item.pickupLocation && item.destination
                    ? `${item.pickupLocation} → ${item.destination}`
                    : item.type}
                </td>
                <td className="px-4 py-3">{formatMoney(finance.expectedAmount)}</td>
                <td className="px-4 py-3">{formatMoney(finance.amountReceived)}</td>
                <td className="px-4 py-3">{formatMoney(finance.commission)}</td>
                <td className="px-4 py-3">
                  {finance.missingAmount > 0 ? (
                    <span className="font-semibold text-rose-700">-{formatMoney(finance.missingAmount)}</span>
                  ) : finance.extraAmount > 0 ? (
                    <span className="font-semibold text-emerald-700">+{formatMoney(finance.extraAmount)}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={item.status} />
                    <PaymentBadge status={item.paymentStatus} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
