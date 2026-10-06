"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { BOOKING_SERVICES, Driver, Reservation, VEHICLE_TYPES } from "@/lib/types";
import { calculateCommissionAmount } from "@/lib/drive-finance";
import { calculateProfit, formatMoney } from "@/lib/money";
import { bookingShareMessage } from "@/lib/briefing";
import { whatsappShareLink } from "@/lib/phone";
import { saveReservationAction } from "@/app/actions/reservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function serviceFromReservation(reservation?: Reservation) {
  if (!reservation) return BOOKING_SERVICES[0];
  return (
    BOOKING_SERVICES.find((item) => item.name === reservation.serviceName) ||
    BOOKING_SERVICES.find((item) => item.type === reservation.type) ||
    BOOKING_SERVICES[0]
  );
}

export function ReservationForm({
  reservation,
  drivers = [],
  defaultDate,
  defaultTime,
  countryCode = "212",
}: {
  reservation?: Reservation;
  services?: unknown;
  customers?: unknown;
  recognizedCustomer?: unknown;
  drivers?: Driver[];
  defaultDate: string;
  defaultTime: string;
  countryCode?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initialService = serviceFromReservation(reservation);
  const [serviceName, setServiceName] = useState(initialService.name);
  const [type, setType] = useState(initialService.type);
  const [date, setDate] = useState(reservation?.date || defaultDate);
  const [time, setTime] = useState(reservation?.time || defaultTime);
  const [pickupLocation, setPickupLocation] = useState(reservation?.pickupLocation || "");
  const [destination, setDestination] = useState(reservation?.destination || "");
  const [numberOfPeople, setNumberOfPeople] = useState(String(reservation?.numberOfPeople || 2));
  const [vehicle, setVehicle] = useState(reservation?.vehicle || "Sedan");
  const [customerName, setCustomerName] = useState(reservation?.customerName || "");
  const [phone, setPhone] = useState(reservation?.phone || "");
  const [price, setPrice] = useState(String(reservation?.price ?? ""));
  const [commission, setCommission] = useState(String(reservation?.commission ?? ""));
  const [driverCommission, setDriverCommission] = useState(
    String(reservation?.driverCommission ?? ""),
  );
  const [commissionType, setCommissionType] = useState<"percentage" | "fixed">(
    reservation?.commissionType || "fixed",
  );
  const [commissionRate, setCommissionRate] = useState(String(reservation?.commissionRate ?? ""));
  const [driverId, setDriverId] = useState(reservation?.driverId || "");

  const draft = {
    date,
    time,
    pickupLocation,
    destination,
    numberOfPeople,
    vehicle,
    customerName,
    phone,
    serviceName,
    price,
  };
  const shareText = bookingShareMessage(draft);
  const shareHref = whatsappShareLink(shareText);
  const passengerHref = phone ? whatsappShareLink(shareText, phone, countryCode) : "";

  const profit = useMemo(() => {
    const amount = calculateCommissionAmount(
      Number(price || 0),
      commissionType,
      Number(commissionRate || 0),
      Number(driverCommission || 0),
    );
    return calculateProfit(Number(price || 0), amount);
  }, [price, commissionType, commissionRate, driverCommission]);

  function selectService(name: (typeof BOOKING_SERVICES)[number]["name"]) {
    const service = BOOKING_SERVICES.find((item) => item.name === name) || BOOKING_SERVICES[0];
    setServiceName(service.name);
    setType(service.type);
    if (service.name === "Airport Transfer" && !destination) {
      setDestination("Agadir Al Massira Airport");
    }
    if (service.name === "Paradise Valley" && !destination) {
      setDestination("Paradise Valley");
    }
    if (service.name === "Sandboarding" && !destination) {
      setDestination("Sandboarding");
    }
  }

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveReservationAction(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      if (result.notifyHref) {
        window.open(result.notifyHref, "_blank", "noopener,noreferrer");
      }
      toast.success(result.message, {
        action: result.shareHref
          ? {
              label: "Share WhatsApp",
              onClick: () => window.open(result.shareHref, "_blank", "noopener,noreferrer"),
            }
          : undefined,
      });
      router.push(`/drive/${result.id}`);
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
      <input type="hidden" name="serviceName" value={serviceName} />
      <input type="hidden" name="driverId" value={driverId} />
      <input type="hidden" name="commissionType" value={commissionType} />
      <input type="hidden" name="whatsapp" value={phone} />

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-sand">Service</p>
        <div className="grid grid-cols-2 gap-2">
          {BOOKING_SERVICES.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => selectService(item.name)}
              className={cn(
                "min-h-12 rounded-2xl px-3 text-sm font-semibold",
                serviceName === item.name ? "bg-primary text-primary-foreground" : "border bg-card",
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <Field label="Pick-Up Date">
        <Input name="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field label="Pick-Up Time">
        <Input name="time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
      </Field>
      <Field label="📍 Pick-Up Location">
        <Input
          name="pickupLocation"
          required
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          placeholder="Hilton Taghazout Bay Beach Resort & Spa"
        />
      </Field>
      <Field label="📍 Drop-Off Location">
        <Input
          name="destination"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Agadir Al Massira Airport"
        />
      </Field>
      <Field label="Number of Passengers">
        <Input
          name="numberOfPeople"
          type="number"
          min={1}
          value={numberOfPeople}
          onChange={(e) => setNumberOfPeople(e.target.value)}
        />
      </Field>
      <Field label="Vehicle Type">
        <select
          name="vehicle"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          className="h-12 w-full rounded-2xl border border-input bg-card px-4"
        >
          {VEHICLE_TYPES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Field label="Passenger Name">
        <Input
          name="customerName"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Mr. Juda BaK"
        />
      </Field>
      <Field label="Mobile Phone">
        <Input
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+44 7770338113"
        />
      </Field>
      <Field label="Price">
        <Input
          name="price"
          type="number"
          min={0}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="400"
        />
      </Field>

      <section className="rounded-[1.5rem] border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sand">WhatsApp preview</p>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6">{shareText}</pre>
        <div className="mt-4 grid gap-2">
          <Button asChild variant="ocean" size="lg">
            <a href={shareHref} target="_blank" rel="noreferrer">
              <MessageCircle /> Share to WhatsApp
            </a>
          </Button>
          {passengerHref ? (
            <Button asChild variant="outline">
              <a href={passengerHref} target="_blank" rel="noreferrer">
                Send to passenger
              </a>
            </Button>
          ) : null}
        </div>
      </section>

      <select
        value={driverId}
        onChange={(e) => setDriverId(e.target.value)}
        className="h-12 rounded-2xl border border-input bg-card px-4"
      >
        <option value="">Select driver</option>
        {drivers
          .filter((driver) => driver.active || driver.id === reservation?.driverId)
          .map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name} · {driver.phone}
            </option>
          ))}
      </select>

      <div className="grid grid-cols-2 gap-2">
        {(["percentage", "fixed"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCommissionType(item)}
            className={cn(
              "h-12 rounded-2xl text-sm font-semibold",
              commissionType === item ? "bg-primary text-primary-foreground" : "bg-card border",
            )}
          >
            {item === "percentage" ? "Percentage" : "Fixed amount"}
          </button>
        ))}
      </div>
      {commissionType === "percentage" ? (
        <Input
          name="commissionRate"
          type="number"
          min={0}
          value={commissionRate}
          onChange={(e) => setCommissionRate(e.target.value)}
          placeholder="Commission %"
        />
      ) : (
        <input type="hidden" name="commissionRate" value={commissionRate || 0} />
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-amber-100 p-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-800">
            My commission
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
            Driver commission
          </p>
          <Input
            name="driverCommission"
            type="number"
            min={0}
            value={driverCommission}
            onChange={(e) => setDriverCommission(e.target.value)}
            placeholder="Driver amount"
            className="border-emerald-200 bg-white"
          />
        </div>
      </div>
      <div className="rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
        <p className="text-xs uppercase tracking-wider text-white/70">Profit</p>
        <p className="font-display text-3xl">{formatMoney(profit)}</p>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Saving..." : reservation ? "Save reservation" : "Add reservation"}
      </Button>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="ocean" size="lg">
            <a href={shareHref} target="_blank" rel="noreferrer">
              <MessageCircle /> Share
            </a>
          </Button>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
