import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { TIMEZONE } from "@/lib/types";

export function nowInTimezone(timezone = TIMEZONE) {
  return toZonedTime(new Date(), timezone);
}

export function todayISO(timezone = TIMEZONE) {
  return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
}

export function tomorrowISO(timezone = TIMEZONE) {
  return formatISODate(addDays(nowInTimezone(timezone), 1));
}

export function yesterdayISO(timezone = TIMEZONE) {
  return formatISODate(addDays(nowInTimezone(timezone), -1));
}

export function formatISODate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function formatDisplayDate(isoDate: string) {
  if (!isoDate) return "—";
  try {
    return format(parseISO(`${isoDate}T12:00:00`), "dd MMM yyyy");
  } catch {
    return isoDate;
  }
}

export function formatBriefingDate(isoDate: string) {
  if (!isoDate) return "";
  try {
    return format(parseISO(`${isoDate}T12:00:00`), "dd/MMM/yyyy");
  } catch {
    return isoDate;
  }
}

export function formatLongDate(isoDate: string) {
  if (!isoDate) return "—";
  try {
    return format(parseISO(`${isoDate}T12:00:00`), "dd MMMM yyyy");
  } catch {
    return isoDate;
  }
}

export function formatDisplayTime(time: string) {
  if (!time) return "—";
  return time.slice(0, 5);
}

export function formatShortDate(isoDate: string) {
  if (!isoDate) return "—";
  try {
    return format(parseISO(`${isoDate}T12:00:00`), "dd MMM");
  } catch {
    return isoDate;
  }
}

export function formatDateTime(isoDate: string, time: string) {
  return `${formatDisplayDate(isoDate)} · ${formatDisplayTime(time)}`;
}

export function toSheetTimestamp(date = new Date(), timezone = TIMEZONE) {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd HH:mm:ss");
}

export function currentTime(timezone = TIMEZONE) {
  return formatInTimeZone(new Date(), timezone, "HH:mm");
}

export function weekRange(isoDate: string) {
  const date = parseISO(`${isoDate}T12:00:00`);
  return {
    from: formatISODate(startOfWeek(date, { weekStartsOn: 1 })),
    to: formatISODate(endOfWeek(date, { weekStartsOn: 1 })),
  };
}

export function monthRange(isoDate: string) {
  const date = parseISO(`${isoDate}T12:00:00`);
  return {
    from: formatISODate(startOfMonth(date)),
    to: formatISODate(endOfMonth(date)),
  };
}

export function inRange(isoDate: string, from: string, to: string) {
  return isoDate >= from && isoDate <= to;
}

export function compareTime(a: string, b: string) {
  return formatDisplayTime(a).localeCompare(formatDisplayTime(b));
}

export function zonedDateFromParts(date: string, time: string, timezone = TIMEZONE) {
  return fromZonedTime(`${date}T${formatDisplayTime(time) || "00:00"}:00`, timezone);
}

export function monthLabel(year: number, month: number) {
  return format(new Date(year, month, 1), "MMMM yyyy");
}
