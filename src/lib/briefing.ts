import { formatDisplayDate, formatDisplayTime, tomorrowISO } from "@/lib/dates";
import { Reservation } from "@/lib/types";

export function tomorrowJobs(reservations: Reservation[]) {
  const date = tomorrowISO();
  return reservations
    .filter(
      (item) =>
        item.date === date &&
        item.status !== "Cancelled" &&
        item.status !== "No Show",
    )
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function driverWhatsAppMessage(reservations: Reservation[], driverId?: string) {
  const date = tomorrowISO();
  const jobs = tomorrowJobs(reservations).filter((job) =>
    driverId ? job.driverId === driverId : true,
  );
  const header = `Hi\nTomorrow's jobs — ${formatDisplayDate(date)}\n`;

  if (jobs.length === 0) {
    return `${header}\nNo services tomorrow.`;
  }

  const lines = jobs.map((job, index) => {
    const route =
      job.pickupLocation && job.destination
        ? `${job.pickupLocation} → ${job.destination}`
        : "";
    return [
      `${index + 1}. ${formatDisplayTime(job.time)}`,
      job.customerName,
      route,
      job.type,
      job.description,
      job.driverCommission ? `Your commission: ${job.driverCommission} DH` : null,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return `${header}\n${lines.join("\n\n")}\n\nTotal: ${jobs.length} ${jobs.length === 1 ? "service" : "services"}`;
}
