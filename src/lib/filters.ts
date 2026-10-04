import { monthRange, todayISO, tomorrowISO, weekRange, inRange } from "@/lib/dates";
import { matchesSearch } from "@/lib/sheets/reservations";
import { Reservation } from "@/lib/types";

export function filterReservations(
  reservations: Reservation[],
  params: {
    q?: string;
    date?: string;
    from?: string;
    to?: string;
    service?: string;
    type?: string;
    status?: string;
    paymentStatus?: string;
    range?: string;
  },
) {
  const today = todayISO();
  let from = params.from || "";
  let to = params.to || "";

  if (params.range === "today") {
    from = today;
    to = today;
  } else if (params.range === "tomorrow") {
    from = tomorrowISO();
    to = from;
  } else if (params.range === "week") {
    const week = weekRange(today);
    from = week.from;
    to = week.to;
  } else if (params.range === "month") {
    const month = monthRange(today);
    from = month.from;
    to = month.to;
  }

  if (params.date) {
    from = params.date;
    to = params.date;
  }

  return reservations.filter((item) => {
    if (params.q && !matchesSearch(item, params.q)) return false;
    if (from && to && !inRange(item.date, from, to)) return false;
    if (params.service && item.serviceName !== params.service) return false;
    if (params.type && item.type !== params.type) return false;
    if (params.status && item.status !== params.status) return false;
    if (params.paymentStatus && item.paymentStatus !== params.paymentStatus) return false;
    return true;
  });
}
