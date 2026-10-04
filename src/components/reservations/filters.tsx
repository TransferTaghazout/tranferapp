import { SERVICE_TYPES, RESERVATION_STATUSES, PAYMENT_STATUSES } from "@/lib/types";

export function ReservationFilters({
  services,
  values,
}: {
  services: string[];
  values: Record<string, string>;
}) {
  return (
    <form className="grid gap-3 rounded-[1.4rem] border bg-card p-4" method="get">
      <input type="hidden" name="range" value={values.range || "all"} />
      <input
        name="q"
        defaultValue={values.q}
        placeholder="Search name, phone, ID, service..."
        className="h-12 rounded-2xl border border-input bg-background px-4"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {quickFilters.map((item) => (
          <a
            key={item.value}
            href={`/reservations?range=${item.value}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ${
              (values.range || "all") === item.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <input
          type="date"
          name="date"
          defaultValue={values.date}
          className="h-12 rounded-2xl border border-input px-3"
        />
        <select name="service" defaultValue={values.service} className={selectClass}>
          <option value="">All services</option>
          {services.map((service) => (
            <option key={service}>{service}</option>
          ))}
        </select>
        <select name="type" defaultValue={values.type} className={selectClass}>
          <option value="">All types</option>
          {SERVICE_TYPES.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <select name="status" defaultValue={values.status} className={selectClass}>
          <option value="">All statuses</option>
          {RESERVATION_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <select
          name="paymentStatus"
          defaultValue={values.paymentStatus}
          className={selectClass}
        >
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>
      <button className="h-12 rounded-2xl bg-primary font-semibold text-primary-foreground">
        Apply filters
      </button>
    </form>
  );
}

const quickFilters = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All" },
];

const selectClass = "h-12 rounded-2xl border border-input bg-card px-3 text-sm";
