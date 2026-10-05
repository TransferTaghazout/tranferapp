"use server";

import { revalidatePath } from "next/cache";
import { requireDriverSession } from "@/lib/auth";
import { getReservationById, updateReservationStatus } from "@/lib/db/reservations";
import { safeErrorMessage } from "@/lib/utils";

export async function completeDriverJobAction(id: string) {
  const session = await requireDriverSession();
  try {
    const job = await getReservationById(id);
    if (!job || job.driverId !== session.driverId) {
      return { ok: false as const, message: "Had lkedma machi dyalek." };
    }
    if (job.status === "Cancelled") {
      return { ok: false as const, message: "Had lkedma annulée." };
    }
    if (job.status === "Completed") {
      return { ok: true as const, message: "Déjà dart." };
    }
    await updateReservationStatus(id, "Completed");
    revalidatePath("/driver");
    revalidatePath("/");
    revalidatePath("/reservations");
    revalidatePath("/finance");
    revalidatePath("/calendar");
    return { ok: true as const, message: "Accepté. Dart l-service." };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Ma qdersh naccepti."),
    };
  }
}
