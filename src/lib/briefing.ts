import { formatBriefingDate, formatDisplayDate, formatDisplayTime, tomorrowISO } from "@/lib/dates";
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

export function assignedJobWhatsAppMessage(job: Reservation) {
  const route =
    job.pickupLocation && job.destination
      ? `${job.pickupLocation} → ${job.destination}`
      : job.pickupLocation || job.destination || "";
  const pay = job.driverCommission
    ? `We will pay you: ${job.driverCommission} DH`
    : "Commission to confirm";
  return [
    "New job assigned",
    `${formatDisplayDate(job.date)} · ${formatDisplayTime(job.time)}`,
    job.customerName,
    route,
    job.type,
    job.description,
    pay,
    "Open your driver board for details.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function customerConfirmWhatsAppMessage(job: Reservation) {
  const when = `${formatDisplayDate(job.date)} at ${formatDisplayTime(job.time)}`;
  return [
    `Hello ${job.customerName},`,
    "",
    `Your ${job.type.toLowerCase()} is confirmed for ${when}.`,
    job.pickupLocation ? `Pickup:\n${job.pickupLocation}` : "",
    job.destination ? `Destination:\n${job.destination}` : "",
    "",
    "Thank you.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export type BookingShareDraft = {
  date: string;
  time: string;
  pickupLocation: string;
  destination: string;
  numberOfPeople: string | number;
  vehicle: string;
  customerName: string;
  phone: string;
  serviceName: string;
  price: string | number;
};

export function bookingShareMessage(draft: BookingShareDraft) {
  const people = Number(draft.numberOfPeople || 0);
  const price = Number(draft.price || 0);
  return [
    `Pick-Up Date: ${formatBriefingDate(draft.date) || draft.date}`,
    `Pick-Up Time: ${formatDisplayTime(draft.time)}`,
    `📍 Pick-Up Location: ${draft.pickupLocation || "—"}`,
    `📍 Drop-Off Location: ${draft.destination || "—"}`,
    `Number of Passengers: ${people || "—"}`,
    `Vehicle Type: ${draft.vehicle || "—"}`,
    `Passenger Name: ${draft.customerName || "—"}`,
    `Mobile Phone: ${draft.phone || "—"}`,
    `Service: ${draft.serviceName || "—"}`,
    price ? `Price: ${price} DH` : "Price: —",
  ].join("\n");
}
