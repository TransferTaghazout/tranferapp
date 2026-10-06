"use server";

import { revalidatePath } from "next/cache";
import { requireDriverSession } from "@/lib/auth";
import {
  getReservationById,
  updateDriverCommission,
  updateReservationStatus,
} from "@/lib/db/reservations";
import { safeErrorMessage } from "@/lib/utils";
import { toMoney } from "@/lib/money";

function revalidateJobs() {
  revalidatePath("/driver");
  revalidatePath("/");
  revalidatePath("/reservations");
  revalidatePath("/finance");
  revalidatePath("/calendar");
}

async function ownedJob(id: string, driverId: string) {
  const job = await getReservationById(id);
  if (!job || job.driverId !== driverId) return null;
  return job;
}

export async function saveDriverCommissionAction(formData: FormData) {
  const session = await requireDriverSession();
  const id = String(formData.get("id") || "");
  const amount = toMoney(formData.get("driverCommission"));
  try {
    const job = await ownedJob(id, session.driverId);
    if (!job) return { ok: false as const, message: "This job is not assigned to you." };
    if (job.status === "Cancelled") {
      return { ok: false as const, message: "This job is cancelled." };
    }
    await updateDriverCommission(id, amount);
    revalidateJobs();
    revalidatePath(`/reservations/${id}`);
    return { ok: true as const, message: "Your commission was saved." };
  } catch (error) {
    return { ok: false as const, message: safeErrorMessage(error, "Could not save commission.") };
  }
}

export async function completeDriverJobAction(formData: FormData) {
  const session = await requireDriverSession();
  const id = String(formData.get("id") || "");
  try {
    const job = await ownedJob(id, session.driverId);
    if (!job) return { ok: false as const, message: "This job is not assigned to you." };
    if (job.status === "Cancelled") {
      return { ok: false as const, message: "This job is cancelled." };
    }
    if (job.status !== "Completed") {
      await updateReservationStatus(id, "Completed");
    }
    revalidateJobs();
    revalidatePath(`/reservations/${id}`);
    return { ok: true as const, message: "Job marked as done." };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Could not complete this job."),
    };
  }
}
