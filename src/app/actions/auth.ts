"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0]?.message || "Check your login details.")}`);
  }

  if (!verifyCredentials(parsed.data.email, parsed.data.password)) {
    redirect(`/login?error=${encodeURIComponent("Incorrect login or password.")}`);
  }

  await createSession({ role: "admin", email: parsed.data.email.trim().toLowerCase() });
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
