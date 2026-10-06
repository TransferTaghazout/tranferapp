"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Reservation } from "@/lib/types";
import { formatMoney, toMoney } from "@/lib/money";
import {
  EXTRA_REASONS,
  MISSING_REASONS,
  calculateReservationFinance,
} from "@/lib/drive-finance";
import { completeDriveJobAction } from "@/app/actions/drive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CompleteForm({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const expected = calculateReservationFinance(reservation);
  const [received, setReceived] = useState(
    String(reservation.amountReceived || reservation.price || ""),
  );
  const [reason, setReason] = useState(reservation.adjustmentReason || "");
  const [note, setNote] = useState("");

  const preview = useMemo(() => {
    const amountReceived = toMoney(received);
    const difference = amountReceived - expected.expectedAmount;
    return {
      amountReceived,
      difference,
      missing: difference < 0 ? Math.abs(difference) : 0,
      extra: difference > 0 ? difference : 0,
      net: amountReceived - expected.commission - reservation.adjustmentAmount,
    };
  }, [received, expected.expectedAmount, expected.commission, reservation.adjustmentAmount]);

  const reasons = preview.missing > 0 ? MISSING_REASONS : preview.extra > 0 ? EXTRA_REASONS : [];

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await completeDriveJobAction(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Saved");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-[1.5rem] border bg-card p-4">
      <input type="hidden" name="id" value={reservation.id} />
      <h2 className="font-display text-2xl">Mark as completed</h2>
      <div className="grid grid-cols-3 gap-2">
        <Fact label="Reservation" value={formatMoney(expected.expectedAmount)} />
        <Fact label="Commission" value={formatMoney(expected.commission)} />
        <Fact label="Expected net" value={formatMoney(expected.expectedAmount - expected.commission)} />
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Amount actually received
        <Input
          name="amountReceived"
          type="number"
          min={0}
          step="0.01"
          required
          value={received}
          onChange={(event) => setReceived(event.target.value)}
        />
      </label>
      {preview.missing > 0 ? (
        <p className="rounded-2xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-800">
          {formatMoney(preview.missing)} missing
        </p>
      ) : null}
      {preview.extra > 0 ? (
        <p className="rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-800">
          {formatMoney(preview.extra)} extra
        </p>
      ) : null}
      {reasons.length > 0 ? (
        <label className="grid gap-1 text-sm font-semibold">
          Reason
          <select
            name="reason"
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="h-12 rounded-2xl border border-input bg-background px-3"
          >
            <option value="">Select reason</option>
            {reasons.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="reason" value="" />
      )}
      <Textarea name="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note" />
      <p className="text-sm text-muted-foreground">
        Net after commission: {formatMoney(preview.net)}
      </p>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-lg leading-none">{value}</p>
    </div>
  );
}
