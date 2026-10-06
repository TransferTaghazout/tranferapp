import { Badge } from "@/components/ui/badge";
import { PaymentStatus, ReservationStatus } from "@/lib/types";

const statusVariant: Record<ReservationStatus, "confirmed" | "pending" | "ontheway" | "completed" | "cancelled" | "noshow"> = {
  New: "pending",
  Confirmed: "confirmed",
  "On the way": "ontheway",
  Completed: "completed",
  Cancelled: "cancelled",
  "No Show": "noshow",
};

const paymentVariant: Record<PaymentStatus, "paid" | "deposit" | "unpaid" | "refunded"> = {
  Paid: "paid",
  "Partially Paid": "deposit",
  Unpaid: "unpaid",
  Refunded: "refunded",
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariant[status]}>{status}</Badge>;
}
