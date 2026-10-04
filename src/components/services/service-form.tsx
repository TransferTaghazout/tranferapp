"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Service } from "@/lib/types";
import { saveServiceAction } from "@/app/actions/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ServiceForm({ service }: { service?: Service }) {
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveServiceAction(formData);
      if (!result.ok) toast.error(result.message);
      else toast.success(result.message);
    });
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      {service ? <input type="hidden" name="id" value={service.id} /> : null}
      <div className="grid gap-2">
        <Label htmlFor="name">Service name</Label>
        <Input id="name" name="name" required defaultValue={service?.name} placeholder="Timlaline Sandboarding" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          name="type"
          defaultValue={service?.type || "Activity"}
          className="h-12 rounded-2xl border border-input bg-card px-4"
        >
          <option>Transfer</option>
          <option>Activity</option>
          <option>Tour</option>
          <option>Other</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="defaultPrice">Default price</Label>
          <Input
            id="defaultPrice"
            name="defaultPrice"
            type="number"
            min={0}
            required
            defaultValue={service?.defaultPrice ?? 250}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="defaultCost">Default cost</Label>
          <Input
            id="defaultCost"
            name="defaultCost"
            type="number"
            min={0}
            defaultValue={service?.defaultCost ?? 150}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={service?.description} />
      </div>
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          name="active"
          defaultChecked={service?.active ?? true}
          className="h-5 w-5 accent-primary"
        />
        Active
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : service ? "Update service" : "Add service"}
      </Button>
    </form>
  );
}
