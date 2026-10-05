"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeDriverJobAction } from "@/app/actions/driver-jobs";
import { Button } from "@/components/ui/button";

export function DriverAcceptButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      className="mt-4 w-full"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await completeDriverJobAction(jobId);
          if (!result.ok) toast.error(result.message);
          else toast.success(result.message);
          router.refresh();
        });
      }}
    >
      {pending ? "..." : "Accept — dart l-service"}
    </Button>
  );
}
