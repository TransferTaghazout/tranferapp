"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { safeErrorMessage } from "@/lib/utils";
import { ensureSpreadsheetStructure, seedDemoData, updateSettings } from "@/lib/sheets";
import { settingsSchema } from "@/lib/validations";

export async function setupSheetsAction() {
  await requireSession();
  try {
    const result = await ensureSpreadsheetStructure();
    revalidateAll();
    return {
      ok: true as const,
      message:
        result.created.length > 0
          ? "Database tables are ready."
          : "Database is ready.",
    };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Database connection unavailable."),
    };
  }
}

export async function seedDemoAction() {
  await requireSession();
  if (process.env.ALLOW_DEMO_SEED === "false") {
    return { ok: false as const, message: "Demo seeding is disabled in this environment." };
  }
  try {
    const result = await seedDemoData();
    revalidateAll();
    return { ok: true as const, message: result.message };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Unable to add demo data."),
    };
  }
}

export async function saveSettingsAction(formData: FormData) {
  await requireSession();
  const parsed = settingsSchema.safeParse({
    businessName: formData.get("businessName"),
    currency: formData.get("currency"),
    timezone: formData.get("timezone"),
    defaultCurrency: formData.get("defaultCurrency"),
    whatsappCountryCode: formData.get("whatsappCountryCode"),
    driverWhatsApp: formData.get("driverWhatsApp") || "",
  });
  if (!parsed.success) {
    return { ok: false as const, message: "Please check settings." };
  }
  try {
    await updateSettings(parsed.data);
    revalidateAll();
    return { ok: true as const, message: "Settings saved." };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Unable to save settings."),
    };
  }
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/reservations");
  revalidatePath("/calendar");
  revalidatePath("/finance");
  revalidatePath("/services");
  revalidatePath("/customers");
  revalidatePath("/more");
}
