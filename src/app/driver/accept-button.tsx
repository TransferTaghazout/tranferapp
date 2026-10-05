"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  completeDriverJobAction,
  saveDriverCommissionAction,
} from "@/app/actions/driver-jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DriverJobActions({
  jobId,
  driverCommission,
  completed,
}: {
  jobId: string;
  driverCommission: number;
  completed: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: typeof completeDriverJobAction, okMessage?: string) {
    startTransition(async () => {
      const form = document.getElementById(`driver-job-${jobId}`) as HTMLFormElement | null;
      if (!form) return;
      const result = await action(new FormData(form));
      if (!result.ok) toast.error(result.message);
      else toast.success(okMessage || result.message);
      router.refresh();
    });
  }

  return (
    <form id={`driver-job-${jobId}`} className="mt-4 space-y-3">
      <input type="hidden" name="id" value={jobId} />
      <div className="rounded-2xl bg-emerald-100 p-3">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
          Commission dyali
        </p>
        <Input
          name="driverCommission"
          type="number"
          min={0}
          defaultValue={driverCommission || ""}
          placeholder="Chhal bghiti"
          className="border-emerald-200 bg-white"
          disabled={completed}
        />
      </div>
      {completed ? (
        <p className="text-center text-sm font-semibold text-emerald-700">Accepté — dart</p>
      ) : (
        <div className="grid gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => run(saveDriverCommissionAction)}
          >
            {pending ? "..." : "Sift commission"}
          </Button>
          <Button type="button" disabled={pending} onClick={() => run(completeDriverJobAction)}>
            {pending ? "..." : "Accept — dart l-service"}
          </Button>
        </div>
      )}
    </form>
  );
}
