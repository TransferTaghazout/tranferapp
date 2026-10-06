"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Reservation } from "@/lib/types";
import { formatMoney, toMoney } from "@/lib/money";
import { calculateCommissionAmount } from "@/lib/drive-finance";
import { saveDriveCommissionAction } from "@/app/actions/drive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

export function CommissionForm({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState(reservation.commissionType || "fixed");
  const [rate, setRate] = useState(String(reservation.commissionRate || ""));
  const [fixed, setFixed] = useState(String(reservation.driverCommission || ""));

  const preview = useMemo(
    () => calculateCommissionAmount(reservation.price, type, toMoney(rate), toMoney(fixed)),
    [reservation.price, type, rate, fixed],
  );

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveDriveCommissionAction(formData);
      if (!result.ok) toast.error(result.message);
      else toast.success("Saved");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-[1.5rem] border bg-card p-4">
      <input type="hidden" name="id" value={reservation.id} />
      <input type="hidden" name="commissionType" value={type} />
      <h2 className="font-display text-2xl">Commission</h2>
      <div className="grid grid-cols-2 gap-2">
        {(["percentage", "fixed"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setType(item)}
            className={`h-12 rounded-2xl text-sm font-semibold ${
              type === item ? "bg-primary text-primary-foreground" : "border bg-background"
            }`}
          >
            {item === "percentage" ? "Percentage" : "Fixed amount"}
          </button>
        ))}
      </div>
      {type === "percentage" ? (
        <label className="grid gap-1 text-sm font-semibold">
          Commission rate %
          <Input name="commissionRate" type="number" min={0} value={rate} onChange={(event) => setRate(event.target.value)} />
        </label>
      ) : (
        <input type="hidden" name="commissionRate" value={rate || 0} />
      )}
      <label className="grid gap-1 text-sm font-semibold">
        {type === "fixed" ? "Fixed commission" : "Fallback amount"}
        <Input name="driverCommission" type="number" min={0} value={fixed} onChange={(event) => setFixed(event.target.value)} />
      </label>
      <p className="text-sm">
        Reservation {formatMoney(reservation.price)} · Commission {formatMoney(preview)} · Net{" "}
        {formatMoney(reservation.price - preview)}
      </p>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving..." : "Save commission"}
      </Button>
    </form>
  );
}
