"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { saveSettingsAction } from "@/app/actions/setup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveSettingsAction(formData);
      if (!result.ok) toast.error(result.message);
      else toast.success(result.message);
    });
  }

  return (
    <form action={onSubmit} className="mt-4 grid gap-4">
      <Field label="Business name" name="businessName" defaultValue={settings.businessName} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Currency" name="currency" defaultValue={settings.currency} />
        <Field label="Default currency" name="defaultCurrency" defaultValue={settings.defaultCurrency} />
      </div>
      <Field label="Timezone" name="timezone" defaultValue={settings.timezone} />
      <Field
        label="WhatsApp country code"
        name="whatsappCountryCode"
        defaultValue={settings.whatsappCountryCode}
      />
      <Field
        label="WhatsApp dyal driver"
        name="driverWhatsApp"
        defaultValue={settings.driverWhatsApp}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  const required = name !== "driverWhatsApp";
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} required={required} />
    </div>
  );
}
