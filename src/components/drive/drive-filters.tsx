import { Driver, PAYMENT_STATUSES, RESERVATION_STATUSES, SERVICE_TYPES } from "@/lib/types";

const QUICK = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function DriveFilters({
  drivers,
  values,
}: {
  drivers: Driver[];
  values: Record<string, string>;
}) {
  const range = values.range || "today";
  return (
    <form method="get" className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {QUICK.map((item) => (
          <a
            key={item.value}
            href={`/drive?range=${item.value}`}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
              range === item.value ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <input
          type="date"
          name="date"
          defaultValue={values.date}
          className="h-12 rounded-2xl border bg-card px-3"
        />
        <select name="status" defaultValue={values.status} className={selectClass}>
          <option value="">All statuses</option>
          {RESERVATION_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <select name="paymentStatus" defaultValue={values.paymentStatus} className={selectClass}>
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <select name="type" defaultValue={values.type} className={selectClass}>
          <option value="">All services</option>
          {SERVICE_TYPES.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <select name="driverId" defaultValue={values.driverId} className={selectClass}>
          <option value="">All drivers</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          name="from"
          type="date"
          defaultValue={values.from}
          className="h-12 rounded-2xl border bg-card px-3"
        />
        <input
          name="to"
          type="date"
          defaultValue={values.to}
          className="h-12 rounded-2xl border bg-card px-3"
        />
      </div>
      <input type="hidden" name="range" value={values.date || values.from ? "custom" : range} />
      <button className="h-12 w-full rounded-2xl bg-primary font-semibold text-primary-foreground">
        Apply
      </button>
    </form>
  );
}

const selectClass = "h-12 rounded-2xl border bg-card px-3 text-sm";
