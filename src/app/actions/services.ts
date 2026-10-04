"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { serviceSchema } from "@/lib/validations";
import { safeErrorMessage } from "@/lib/utils";
import { createService, updateService } from "@/lib/sheets";

export async function saveServiceAction(formData: FormData) {
  await requireSession();
  const parsed = serviceSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    type: formData.get("type"),
    defaultPrice: formData.get("defaultPrice"),
    defaultCost: formData.get("defaultCost") || 0,
    description: formData.get("description") || "",
    active: formData.get("active") === "true" || formData.get("active") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message || "Please check the service details.",
    };
  }

  try {
    const service = parsed.data.id
      ? await updateService(parsed.data.id, parsed.data)
      : await createService(parsed.data);
    revalidatePath("/services");
    revalidatePath("/reservations/new");
    return {
      ok: true as const,
      id: service.id,
      message: parsed.data.id ? "Service updated." : "Service added.",
    };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Unable to save service."),
    };
  }
}
