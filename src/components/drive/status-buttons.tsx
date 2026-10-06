"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Reservation } from "@/lib/types";
import { setDriveStatusAction } from "@/app/actions/drive";
import { Button } from "@/components/ui/button";

const STATUSES = ["New", "Confirmed", "On the way"] as const;

export function StatusButtons({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(status: string) {
    startTransition(async () => {
      const form = new FormData();
      form.set("id", reservation.id);
      form.set("status", status);
      const result = await setDriveStatusAction(form);
      if (!result.ok) toast.error(result.message);
      else toast.success("Saved");
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {STATUSES.map((status) => (
        <Button
          key={status}
          type="button"
          size="sm"
          variant={reservation.status === status ? "default" : "outline"}
          disabled={pending}
          onClick={() => run(status)}
        >
          {status}
        </Button>
      ))}
    </div>
  );
}
