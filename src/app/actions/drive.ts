"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getReservationById, saveReservationRecord } from "@/lib/db/reservations";
import { logFinancialHistory } from "@/lib/db/finance-history";
import { formatMoney, toMoney, toSignedMoney } from "@/lib/money";
import { toSheetTimestamp } from "@/lib/dates";
import { safeErrorMessage } from "@/lib/utils";
import {
  calculateCommissionAmount,
  calculateReservationFinance,
  paymentStatusFromReceived,
} from "@/lib/drive-finance";
import { CommissionType, Reservation } from "@/lib/types";

function revalidateDrive(id?: string) {
  revalidatePath("/drive");
  revalidatePath("/driver");
  revalidatePath("/");
  revalidatePath("/reservations");
  revalidatePath("/finance");
  revalidatePath("/calendar");
  if (id) {
    revalidatePath(`/drive/${id}`);
    revalidatePath(`/reservations/${id}`);
  }
}

async function actor() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (session.role === "driver") {
    return { role: "driver" as const, name: session.name, driverId: session.driverId };
  }
  return { role: "admin" as const, name: session.email, driverId: "" };
}

async function loadOwned(id: string) {
  const user = await actor();
  const job = await getReservationById(id);
  if (!job) return { user, job: null as Reservation | null, error: "Reservation not found." };
  if (user.role === "driver" && job.driverId !== user.driverId) {
    return { user, job: null, error: "This job is not assigned to you." };
  }
  return { user, job, error: null as string | null };
}

export async function completeDriveJobAction(formData: FormData) {
  try {
    const id = String(formData.get("id") || "");
    const { user, job, error } = await loadOwned(id);
    if (!job) return { ok: false as const, message: error || "Unable to save changes. Please try again." };

    const amountReceived = toMoney(formData.get("amountReceived"));
    const reason = String(formData.get("reason") || "").trim();
    const note = String(formData.get("note") || "").trim();
    const financeBefore = calculateReservationFinance(job);
    const difference = amountReceived - financeBefore.expectedAmount;
    if (difference !== 0 && !reason) {
      return { ok: false as const, message: "Select a reason for the missing or extra amount." };
    }

    const next: Reservation = {
      ...job,
      status: "Completed",
      amountReceived,
      adjustmentReason: reason,
      financialNotes: [job.financialNotes, note].filter(Boolean).join("\n"),
      completedAt: toSheetTimestamp(),
      completedBy: user.name,
      paymentStatus: paymentStatusFromReceived(financeBefore.expectedAmount, amountReceived),
    };
    const saved = await saveReservationRecord(next);
    await logFinancialHistory({
      reservationId: saved.id,
      action: "Marked Completed",
      oldValue: formatMoney(financeBefore.expectedAmount),
      newValue: formatMoney(amountReceived),
      difference,
      reason: [reason, note].filter(Boolean).join(" — "),
      user: user.name,
    });
    revalidateDrive(saved.id);
    return { ok: true as const, message: "Saved" };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Unable to save changes. Please try again."),
    };
  }
}

export async function cancelDriveJobAction(formData: FormData) {
  try {
    const id = String(formData.get("id") || "");
    const { user, job, error } = await loadOwned(id);
    if (!job) return { ok: false as const, message: error || "Unable to save changes. Please try again." };

    const reason = String(formData.get("reason") || "").trim();
    const note = String(formData.get("note") || "").trim();
    const noShow = reason === "No show";
    if (!reason) return { ok: false as const, message: "Select a cancellation reason." };
    const cancellationFee = toMoney(formData.get("cancellationFee"));
    const cancellationCommission = toMoney(formData.get("cancellationCommission"));
    const next: Reservation = {
      ...job,
      status: noShow ? "No Show" : "Cancelled",
      cancellationReason: [reason, note].filter(Boolean).join(" — "),
      cancellationFee,
      cancellationCommission,
      amountReceived: cancellationFee,
      driverCommission: cancellationFee > 0 ? cancellationCommission : 0,
      paymentStatus: cancellationFee > 0 ? paymentStatusFromReceived(cancellationFee, cancellationFee) : "Refunded",
      completedAt: "",
      completedBy: user.name,
    };
    const saved = await saveReservationRecord(next);
    await logFinancialHistory({
      reservationId: saved.id,
      action: noShow ? "Marked No Show" : "Cancelled",
      oldValue: formatMoney(job.price),
      newValue: formatMoney(cancellationFee),
      difference: cancellationFee - job.price,
      reason: next.cancellationReason,
      user: user.name,
    });
    revalidateDrive(saved.id);
    return { ok: true as const, message: "Saved" };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Unable to save changes. Please try again."),
    };
  }
}

export async function setDriveStatusAction(formData: FormData) {
  try {
    const id = String(formData.get("id") || "");
    const status = String(formData.get("status") || "");
    const { user, job, error } = await loadOwned(id);
    if (!job) return { ok: false as const, message: error || "Unable to save changes. Please try again." };
    if (!["New", "Confirmed", "On the way"].includes(status)) {
      return { ok: false as const, message: "Use Complete or Cancel for that status." };
    }
    const saved = await saveReservationRecord({ ...job, status: status as Reservation["status"] });
    await logFinancialHistory({
      reservationId: saved.id,
      action: `Status: ${status}`,
      oldValue: job.status,
      newValue: status,
      user: user.name,
    });
    revalidateDrive(saved.id);
    return { ok: true as const, message: "Saved" };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Unable to save changes. Please try again."),
    };
  }
}

export async function saveDriveCommissionAction(formData: FormData) {
  try {
    const id = String(formData.get("id") || "");
    const { user, job, error } = await loadOwned(id);
    if (!job) return { ok: false as const, message: error || "Unable to save changes. Please try again." };
    if (user.role !== "admin") {
      return { ok: false as const, message: "Only the office can change commission." };
    }
    const commissionType = String(formData.get("commissionType") || "fixed") as CommissionType;
    const commissionRate = toMoney(formData.get("commissionRate"));
    const fixedAmount = toMoney(formData.get("driverCommission"));
    const driverCommission = calculateCommissionAmount(job.price, commissionType, commissionRate, fixedAmount);
    const saved = await saveReservationRecord({
      ...job,
      commissionType: commissionType === "percentage" ? "percentage" : "fixed",
      commissionRate,
      driverCommission,
    });
    await logFinancialHistory({
      reservationId: saved.id,
      action: "Commission updated",
      oldValue: formatMoney(job.driverCommission),
      newValue: formatMoney(saved.driverCommission),
      difference: saved.driverCommission - job.driverCommission,
      reason: commissionType === "percentage" ? `${commissionRate}%` : "Fixed amount",
      user: user.name,
    });
    revalidateDrive(saved.id);
    return { ok: true as const, message: "Saved" };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Unable to save changes. Please try again."),
    };
  }
}

export async function saveDriveAdjustmentAction(formData: FormData) {
  try {
    const id = String(formData.get("id") || "");
    const { user, job, error } = await loadOwned(id);
    if (!job) return { ok: false as const, message: error || "Unable to save changes. Please try again." };
    const amount = toSignedMoney(formData.get("adjustmentAmount"));
    const signed = String(formData.get("direction") || "minus") === "plus" ? Math.abs(amount) : -Math.abs(amount);
    const reason = String(formData.get("reason") || "").trim();
    const note = String(formData.get("note") || "").trim();
    if (!reason) return { ok: false as const, message: "Every adjustment needs a reason." };
    const saved = await saveReservationRecord({
      ...job,
      adjustmentAmount: toSignedMoney(job.adjustmentAmount) + signed,
      adjustmentReason: [job.adjustmentReason, `${reason} (${signed})`].filter(Boolean).join(" | "),
      financialNotes: [job.financialNotes, note].filter(Boolean).join("\n"),
    });
    await logFinancialHistory({
      reservationId: saved.id,
      action: "Adjustment",
      oldValue: formatMoney(job.adjustmentAmount),
      newValue: formatMoney(saved.adjustmentAmount),
      difference: signed,
      reason: [reason, note].filter(Boolean).join(" — "),
      user: user.name,
    });
    revalidateDrive(saved.id);
    return { ok: true as const, message: "Saved" };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Unable to save changes. Please try again."),
    };
  }
}
