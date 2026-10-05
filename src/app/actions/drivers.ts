"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { driverSchema } from "@/lib/validations";
import { safeErrorMessage } from "@/lib/utils";
import { createDriver, updateDriver } from "@/lib/db/drivers";

export async function saveDriverAction(formData: FormData) {
  await requireSession();
  const parsed = driverSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    password: formData.get("password") || "",
    active: formData.get("active") === "on" || formData.get("active") === "true" || !formData.get("id"),
  });
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || "Check driver details." };
  }
  if (!parsed.data.id && !parsed.data.password) {
    return { ok: false as const, message: "Password khass l driver jdid." };
  }
  try {
    const driver = parsed.data.id
      ? await updateDriver(parsed.data.id, {
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email,
          password: parsed.data.password || undefined,
          active: parsed.data.active,
        })
      : await createDriver({
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email,
          password: parsed.data.password || "",
          active: true,
        });
    revalidatePath("/drivers");
    revalidatePath("/reservations/new");
    revalidatePath("/driver");
    return { ok: true as const, message: parsed.data.id ? "Driver updated." : "Driver added.", id: driver?.id };
  } catch (error) {
    return { ok: false as const, message: safeErrorMessage(error, "Unable to save driver.") };
  }
}
