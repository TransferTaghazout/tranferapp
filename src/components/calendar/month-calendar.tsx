import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function MonthCalendar({
  year,
  month,
  selected,
  datesWithReservations,
}: {
  year: number;
  month: number;
  selected: string;
  datesWithReservations: Set<string>;
}) {
  const current = new Date(year, month, 1);
  const prev = subMonths(current, 1);
  const next = addMonths(current, 1);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(current), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(current), { weekStartsOn: 1 }),
  });

  return (
    <div className="rounded-[1.6rem] border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/calendar?date=${formatISODate(new Date(prev.getFullYear(), prev.getMonth(), 1))}`}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="font-display text-3xl">{format(current, "MMMM yyyy")}</h2>
        <Link
          href={`/calendar?date=${formatISODate(new Date(next.getFullYear(), next.getMonth(), 1))}`}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
      <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const iso = formatISODate(day);
          const selectedDay = iso === selected;
          const inMonth = isSameMonth(day, current);
          const has = datesWithReservations.has(iso);
          return (
            <Link
              key={iso}
              href={`/calendar?date=${iso}`}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center rounded-2xl text-sm font-semibold",
                inMonth ? "text-foreground" : "text-muted-foreground/40",
                selectedDay && "bg-primary text-primary-foreground",
                !selectedDay && has && "bg-emerald-50",
              )}
            >
              {format(day, "d")}
              {has ? (
                <span
                  className={cn(
                    "mt-1 h-1.5 w-1.5 rounded-full",
                    selectedDay ? "bg-secondary" : "bg-emerald-500",
                  )}
                />
              ) : (
                <span className="mt-1 h-1.5 w-1.5" />
              )}
            </Link>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Green dots mark days with reservations
        {selected ? ` · ${format(parseISO(`${selected}T12:00:00`), "dd MMM yyyy")}` : ""}
      </p>
    </div>
  );
}
