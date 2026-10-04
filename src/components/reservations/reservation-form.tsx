"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Reservation, ServiceType } from "@/lib/types";
import { calculateProfit, formatMoney } from "@/lib/money";
import { saveReservationAction } from "@/app/actions/reservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TYPES: ServiceType[] = ["Transfer", "Activity", "Tour", "Other"];
const PLACES = [
  "Agadir Airport",
  "Taghazout",
  "Taghazout Bay",
  "Agadir Centre",
  "Paradise Valley",
  "Timlaline",
];
const TIMES = ["08:00", "09:00", "10:00", "11:30", "14:00", "16:00", "18:00"];

export function ReservationForm({
  reservation,
  defaultDate,
  defaultTime,
}: {
  reservation?: Reservation;
  services?: unknown;
  customers?: unknown;
  recognizedCustomer?: unknown;
  defaultDate: string;
  defaultTime: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<ServiceType>(reservation?.type || "Transfer");
  const [price, setPrice] = useState(String(reservation?.price ?? ""));
  const [cost, setCost] = useState(String(reservation?.cost ?? ""));
  const [pickup, setPickup] = useState(reservation?.pickupLocation || "");
  const [destination, setDestination] = useState(reservation?.destination || "");
  const [time, setTime] = useState(reservation?.time || defaultTime);

  const profit = useMemo(
    () => calculateProfit(Number(price || 0), Number(cost || 0)),
    [price, cost],
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
      <input type="hidden" name="pickupLocation" value={pickup} />
      <input type="hidden" name="destination" value={destination} />
      <input type="hidden" name="time" value={time} />
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
        <Input type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <ChipRow>
        {TIMES.map((slot) => (
          <Chip key={slot} active={time === slot} onClick={() => setTime(slot)}>
            {slot}
          </Chip>
        ))}
      </ChipRow>

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

      <PlaceField label="Pickup" value={pickup} onChange={setPickup} />
      <PlaceField label="Destination" value={destination} onChange={setDestination} />

      <Textarea
        name="description"
        defaultValue={reservation?.description}
        placeholder="Description"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          name="price"
          type="number"
          min={0}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
        />
        <Input
          name="cost"
          type="number"
          min={0}
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Cost"
        />
      </div>
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

function PlaceField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} />
      <ChipRow>
        {PLACES.map((place) => (
          <Chip key={place} active={value === place} onClick={() => onChange(place)}>
            {place}
          </Chip>
        ))}
      </ChipRow>
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 overflow-x-auto pb-1">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 shrink-0 rounded-full px-3 text-sm font-semibold",
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
      )}
    >
      {children}
    </button>
  );
}
