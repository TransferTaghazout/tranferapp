"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { seedDemoAction, setupSheetsAction } from "@/app/actions/setup";
import { Button } from "@/components/ui/button";

export function SetupActions() {
  const [pending, startTransition] = useTransition();

  function run(kind: "setup" | "seed") {
    startTransition(async () => {
      const result = kind === "setup" ? await setupSheetsAction() : await seedDemoAction();
      if (!result.ok) toast.error(result.message);
      else toast.success(result.message);
    });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button disabled={pending} onClick={() => run("setup")}>
        Prepare database
      </Button>
      <Button variant="secondary" disabled={pending} onClick={() => run("seed")}>
        Check database tables
      </Button>
    </div>
  );
}
