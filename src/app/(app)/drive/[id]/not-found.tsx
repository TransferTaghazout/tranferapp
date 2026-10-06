import { EmptyState } from "@/components/shared/empty-state";

export default function DriveNotFound() {
  return (
    <EmptyState
      title="Reservation not found"
      description="It may have been deleted."
      actionHref="/drive"
      actionLabel="Back to Drive"
    />
  );
}
