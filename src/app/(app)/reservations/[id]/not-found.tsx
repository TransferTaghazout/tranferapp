import { EmptyState } from "@/components/shared/empty-state";

export default function ReservationNotFound() {
  return (
    <EmptyState
      title="Reservation not found"
      description="It may have been deleted, or Google Sheets is still updating."
      actionHref="/reservations"
      actionLabel="Back to reservations"
    />
  );
}
