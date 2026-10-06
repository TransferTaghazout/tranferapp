"use client";

import { MessageCircle, Phone } from "lucide-react";
import { Reservation } from "@/lib/types";
import { formatDisplayTime, formatShortDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { telLink, whatsappLink } from "@/lib/phone";
import { StatusBadge } from "@/components/shared/status-badge";
import { DriverJobActions } from "@/app/driver/accept-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DriverJobCard({
  job,
  countryCode,
  highlight = false,
}: {
  job: Reservation;
  countryCode: string;
  highlight?: boolean;
}) {
  const phone = job.whatsapp || job.phone;
  const callHref = telLink(phone);
  const waHref = whatsappLink(phone, countryCode);
  const route =
    job.pickupLocation && job.destination
      ? `${job.pickupLocation} → ${job.destination}`
      : job.pickupLocation || job.destination;
  const completed = job.status === "Completed";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[1.5rem] border bg-card shadow-sm",
        highlight && "border-sand ring-2 ring-sand/50",
      )}
    >
      {highlight ? (
        <p className="bg-primary px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
          Next job
        </p>
      ) : null}
      <div className="grid grid-cols-[5.5rem_1fr] gap-3 p-4">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-primary px-2 py-3 text-primary-foreground">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">
            {formatShortDate(job.date)}
          </p>
          <p className="font-display text-2xl leading-none">{formatDisplayTime(job.time)}</p>
        </div>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-sand">{job.type}</p>
            <StatusBadge status={job.status} />
          </div>
          <h3 className="mt-1 truncate font-display text-2xl leading-tight">{job.customerName}</h3>
          {route ? <p className="mt-1 text-sm font-medium text-foreground">{route}</p> : null}
          {job.flightNumber ? (
            <p className="mt-1 text-sm text-muted-foreground">Flight {job.flightNumber}</p>
          ) : null}
          {job.description ? <p className="mt-2 text-sm text-muted-foreground">{job.description}</p> : null}
        </div>
      </div>

      {callHref || waHref ? (
        <div className={`grid gap-2 px-4 ${callHref && waHref ? "grid-cols-2" : "grid-cols-1"}`}>
          {callHref ? (
            <Button asChild variant="outline" size="sm">
              <a href={callHref}>
                <Phone /> Call
              </a>
            </Button>
          ) : null}
          {waHref ? (
            <Button asChild variant="ocean" size="sm">
              <a href={waHref} target="_blank" rel="noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="px-4 pb-4">
        {!completed ? (
          <p className="mt-3 text-sm font-semibold text-emerald-800">
            Your commission: {job.driverCommission ? formatMoney(job.driverCommission) : "enter below"}
          </p>
        ) : (
          <p className="mt-3 text-sm font-semibold text-emerald-700">
            Paid commission: {formatMoney(job.driverCommission)}
          </p>
        )}
        <DriverJobActions
          jobId={job.id}
          driverCommission={job.driverCommission}
          completed={completed}
        />
      </div>
    </article>
  );
}
