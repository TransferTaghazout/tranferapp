"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Reservation } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { CANCEL_REASONS } from "@/lib/drive-finance";
import { cancelDriveJobAction } from "@/app/actions/drive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CancelForm({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [fee, setFee] = useState(String(reservation.cancellationFee || ""));
  const [commission, setCommission] = useState(String(reservation.cancellationCommission || ""));

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await cancelDriveJobAction(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Saved");
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="destructive" className="w-full" onClick={() => setOpen(true)}>
        Cancel reservation
      </Button>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4">
      <input type="hidden" name="id" value={reservation.id} />
      <h2 className="font-display text-2xl">Cancel reservation</h2>
      <p className="text-sm">Are you sure you want to cancel this reservation?</p>
      <p className="text-sm text-muted-foreground">
        Commission on this booking will become 0 DH unless you enter a cancellation fee.
      </p>
      <label className="grid gap-1 text-sm font-semibold">
        Reason
        <select name="reason" required className="h-12 rounded-2xl border border-input bg-white px-3">
          <option value="">Select reason</option>
          {CANCEL_REASONS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm font-semibold">
          Cancellation fee
          <Input
            name="cancellationFee"
            type="number"
            min={0}
            value={fee}
            onChange={(event) => setFee(event.target.value)}
            placeholder="0"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Commission on fee
          <Input
            name="cancellationCommission"
            type="number"
            min={0}
            value={commission}
            onChange={(event) => setCommission(event.target.value)}
            placeholder="0"
          />
        </label>
      </div>
      {Number(fee || 0) > 0 ? (
        <p className="text-sm">
          Fee {formatMoney(Number(fee))} · Commission {formatMoney(Number(commission || 0))}
        </p>
      ) : (
        <p className="text-sm font-semibold text-rose-800">Cancelled · Commission 0 DH</p>
      )}
      <Textarea name="note" placeholder="Note" />
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Keep reservation
        </Button>
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? "Saving..." : "Confirm cancel"}
        </Button>
      </div>
    </form>
  );
}
