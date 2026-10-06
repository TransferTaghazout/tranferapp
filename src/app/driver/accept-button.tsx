"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeDriverJobAction } from "@/app/actions/driver-jobs";
import { Button } from "@/components/ui/button";

export function DriverJobActions({
  jobId,
  completed,
}: {
  jobId: string;
  driverCommission?: number;
  completed: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function markDone() {
    startTransition(async () => {
      const form = new FormData();
      form.set("id", jobId);
      const result = await completeDriverJobAction(form);
      if (!result.ok) toast.error(result.message);
      else toast.success(result.message);
      router.refresh();
    });
  }

  if (completed) {
    return <p className="mt-3 text-center text-sm font-semibold text-emerald-700">Job completed</p>;
  }

  return (
    <Button type="button" size="lg" className="mt-3 w-full" disabled={pending} onClick={markDone}>
      {pending ? "Saving..." : "Mark job done"}
    </Button>
  );
}
