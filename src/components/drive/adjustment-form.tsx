"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Reservation } from "@/lib/types";
import { saveDriveAdjustmentAction } from "@/app/actions/drive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AdjustmentForm({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveDriveAdjustmentAction(formData);
      if (!result.ok) toast.error(result.message);
      else toast.success("Saved");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-[1.5rem] border bg-card p-4">
      <input type="hidden" name="id" value={reservation.id} />
      <h2 className="font-display text-2xl">Adjustment</h2>
      <p className="text-sm text-muted-foreground">Never change amounts silently. Every change needs a reason.</p>
      <div className="grid grid-cols-2 gap-2">
        <select name="direction" className="h-12 rounded-2xl border px-3" defaultValue="minus">
          <option value="minus">Minus</option>
          <option value="plus">Plus</option>
        </select>
        <Input name="adjustmentAmount" type="number" min={0} required placeholder="Amount" />
      </div>
      <Input name="reason" required placeholder="Reason" />
      <Textarea name="note" placeholder="Note" />
      <Button type="submit" variant="outline" className="w-full" disabled={pending}>
        {pending ? "Saving..." : "Add adjustment"}
      </Button>
    </form>
  );
}
