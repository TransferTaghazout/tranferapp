"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Driver } from "@/lib/types";
import { saveDriverAction } from "@/app/actions/drivers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DriverForm({ driver }: { driver?: Driver }) {
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveDriverAction(formData);
      if (!result.ok) toast.error(result.message);
      else toast.success(result.message);
    });
  }

  return (
    <form action={onSubmit} className="grid gap-3">
      {driver ? <input type="hidden" name="id" value={driver.id} /> : null}
      <div className="grid gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={driver?.name} placeholder="Youssef" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" required defaultValue={driver?.phone} placeholder="06..." />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={driver?.email} placeholder="driver@email.com" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password {driver ? "(leave empty to keep current)" : ""}</Label>
        <Input id="password" name="password" type="password" required={!driver} />
      </div>
      {driver ? (
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="active" defaultChecked={driver.active} className="h-5 w-5 accent-primary" />
          Active
        </label>
      ) : (
        <input type="hidden" name="active" value="true" />
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : driver ? "Save driver" : "Add driver"}
      </Button>
    </form>
  );
}
