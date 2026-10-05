"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Driver, Reservation, ServiceType } from "@/lib/types";
import { calculateProfit, formatMoney } from "@/lib/money";
import { saveReservationAction } from "@/app/actions/reservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TYPES: ServiceType[] = ["Transfer", "Activity", "Tour", "Other"];

export function ReservationForm({
  reservation,
  drivers = [],
  defaultDate,
  defaultTime,
}: {
  reservation?: Reservation;
  services?: unknown;
  customers?: unknown;
  recognizedCustomer?: unknown;
  drivers?: Driver[];
  defaultDate: string;
  defaultTime: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<ServiceType>(reservation?.type || "Transfer");
  const [price, setPrice] = useState(String(reservation?.price ?? ""));
  const [commission, setCommission] = useState(String(reservation?.commission ?? ""));
  const [driverCommission, setDriverCommission] = useState(
    String(reservation?.driverCommission ?? ""),
  );
  const [driverId, setDriverId] = useState(reservation?.driverId || "");

  const profit = useMemo(
    () => calculateProfit(Number(price || 0), Number(driverCommission || 0)),
    [price, driverCommission],
  );

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveReservationAction(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push(`/reservations/${result.id}`);
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-5 pb-28">
      {reservation ? <input type="hidden" name="id" value={reservation.id} /> : null}
      <input type="hidden" name="bookingSource" value={reservation?.bookingSource || "APP"} />
      <input type="hidden" name="status" value={reservation?.status || "Confirmed"} />
      <input type="hidden" name="paymentStatus" value={reservation?.paymentStatus || "Unpaid"} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="serviceName" value={type} />
      <input type="hidden" name="driverId" value={driverId} />
      <input type="hidden" name="numberOfPeople" value="1" />

      <Input
        name="customerName"
        required
        defaultValue={reservation?.customerName}
        placeholder="Smiya"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          name="date"
          type="date"
          required
          defaultValue={reservation?.date || defaultDate}
        />
        <Input
          name="time"
          type="time"
          required
          defaultValue={reservation?.time || defaultTime}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {TYPES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setType(item)}
            className={cn(
              "h-12 rounded-2xl text-sm font-semibold",
              type === item ? "bg-primary text-primary-foreground" : "bg-card border",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <Input
        name="pickupLocation"
        defaultValue={reservation?.pickupLocation}
        placeholder="Pickup"
      />
      <Input
        name="destination"
        defaultValue={reservation?.destination}
        placeholder="Destination"
      />

      <Textarea
        name="description"
        defaultValue={reservation?.description}
        placeholder="Description"
      />

      <select
        value={driverId}
        onChange={(e) => setDriverId(e.target.value)}
        className="h-12 rounded-2xl border border-input bg-card px-4"
      >
        <option value="">Driver — khter</option>
        {drivers
          .filter((driver) => driver.active || driver.id === reservation?.driverId)
          .map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name} · {driver.phone}
            </option>
          ))}
      </select>

      <Input
        name="price"
        type="number"
        min={0}
        required
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price — chhal 3lanti"
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-amber-100 p-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-800">
            Commission dyali
          </p>
          <Input
            name="commission"
            type="number"
            min={0}
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            placeholder="Commission"
            className="border-amber-200 bg-white"
          />
        </div>
        <div className="rounded-2xl bg-emerald-100 p-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            Commission driver
          </p>
          <Input
            name="driverCommission"
            type="number"
            min={0}
            value={driverCommission}
            onChange={(e) => setDriverCommission(e.target.value)}
            placeholder="Li bgha driver"
            className="border-emerald-200 bg-white"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Commission l-khder kayktebha driver. Nta katshufha b color mokhtalef.
      </p>
      <div className="rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
        <p className="text-xs uppercase tracking-wider text-white/70">Profit</p>
        <p className="font-display text-3xl">{formatMoney(profit)}</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-4 backdrop-blur">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Saving..." : "Save reservation"}
        </Button>
      </div>
    </form>
  );
}
