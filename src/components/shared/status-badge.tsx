import { Badge } from "@/components/ui/badge";
import { PaymentStatus, ReservationStatus } from "@/lib/types";

const statusVariant = {
  Confirmed: "confirmed",
  Pending: "pending",
  Completed: "completed",
  Cancelled: "cancelled",
  "No Show": "noshow",
} as const;

const paymentVariant = {
  Paid: "paid",
  Deposit: "deposit",
  Unpaid: "unpaid",
} as const;

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariant[status]}>{status}</Badge>;
}
