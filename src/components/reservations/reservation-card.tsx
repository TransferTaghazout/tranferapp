import Link from "next/link";
import { Reservation } from "@/lib/types";
import { formatDisplayTime } from "@/lib/dates";
import { StatusBadge } from "@/components/shared/status-badge";
import { MoneyStack } from "@/components/shared/money-stack";
import { Card, CardContent } from "@/components/ui/card";

export function ReservationCard({ reservation }: { reservation: Reservation }) {
  const route =
    reservation.pickupLocation && reservation.destination
      ? `${reservation.pickupLocation} → ${reservation.destination}`
      : reservation.description;

  return (
    <Link href={`/reservations/${reservation.id}`} className="block">
      <Card className="transition-transform active:scale-[0.99]">
        <CardContent className="grid grid-cols-[4.2rem_1fr] gap-4 p-4">
          <div className="rounded-2xl bg-secondary px-2 py-3 text-center">
            <p className="text-lg font-bold text-primary">{formatDisplayTime(reservation.time)}</p>
          </div>
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-display text-xl leading-tight">
                  {reservation.customerName}
                </h3>
                <p className="text-sm text-muted-foreground">{reservation.type}</p>
                {route ? (
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{route}</p>
                ) : null}
              </div>
              <StatusBadge status={reservation.status} />
            </div>
            <div className="mt-3">
              <MoneyStack
                price={reservation.price}
                cost={reservation.cost}
                profit={reservation.profit}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
