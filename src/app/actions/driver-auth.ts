"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";
import { authenticateDriver } from "@/lib/db/drivers";

export async function driverLoginAction(_: { error?: string } | undefined, formData: FormData) {
  const login = String(formData.get("login") || "").trim();
  const password = String(formData.get("password") || "");
  if (!login || !password) {
    return { error: "Phone/email and password are required." };
  }
  const driver = await authenticateDriver(login, password).catch(() => null);
  if (!driver) return { error: "Incorrect login." };
  await createSession({
    role: "driver",
    email: driver.email || driver.phone,
    driverId: driver.id,
    name: driver.name,
  });
  redirect("/driver");
}
