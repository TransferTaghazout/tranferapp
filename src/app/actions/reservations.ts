"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { reservationSchema } from "@/lib/validations";
import { safeErrorMessage } from "@/lib/utils";
import {
  createReservation,
  deleteReservation,
  updateReservation,
  updateReservationStatus,
} from "@/lib/db";
import { getDriverById } from "@/lib/db/drivers";
import { getSettings } from "@/lib/db/settings";
import { assignedJobWhatsAppMessage, bookingShareMessage } from "@/lib/briefing";
import { whatsappShareLink } from "@/lib/phone";
import { DEFAULT_SETTINGS, ReservationStatus } from "@/lib/types";

function revalidateReservationViews() {
  revalidatePath("/");
  revalidatePath("/reservations");
  revalidatePath("/calendar");
  revalidatePath("/finance");
  revalidatePath("/customers");
  revalidatePath("/search");
  revalidatePath("/drivers");
  revalidatePath("/driver");
  revalidatePath("/drive");
}

export async function saveReservationAction(formData: FormData) {
  await requireSession();
  const parsed = reservationSchema.safeParse({
    id: formData.get("id") || undefined,
    date: formData.get("date"),
    time: formData.get("time"),
    customerName: formData.get("customerName"),
    phone: formData.get("phone") || "",
    whatsapp: formData.get("whatsapp") || formData.get("phone") || "",
    numberOfPeople: formData.get("numberOfPeople") || 1,
    type: formData.get("type"),
    serviceName: formData.get("serviceName") || formData.get("type") || "",
    pickupLocation: formData.get("pickupLocation") || "",
    destination: formData.get("destination") || "",
    price: formData.get("price"),
    cost: formData.get("driverCommission") || 0,
    commission: formData.get("commission") || 0,
    driverCommission: formData.get("driverCommission") || 0,
    commissionType: formData.get("commissionType") || "fixed",
    commissionRate: formData.get("commissionRate") || 0,
    currency: formData.get("currency") || "MAD",
    status: formData.get("status"),
    paymentStatus: formData.get("paymentStatus"),
    description: formData.get("description") || "",
    internalNotes: formData.get("internalNotes") || "",
    driver: formData.get("driver") || "",
    driverId: formData.get("driverId") || "",
    vehicle: formData.get("vehicle") || "",
    flightNumber: formData.get("flightNumber") || "",
    bookingSource: formData.get("bookingSource") || "APP",
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message || "Please check the form.",
    };
  }

  try {
    const reservation = parsed.data.id
      ? await updateReservation(parsed.data.id, parsed.data)
      : await createReservation(parsed.data);
    revalidateReservationViews();
    revalidatePath(`/reservations/${reservation.id}`);
    const settings = await getSettings().catch(() => DEFAULT_SETTINGS);
    let notifyHref = "";
    if (reservation.driverId) {
      const driver = await getDriverById(reservation.driverId).catch(() => null);
      if (driver?.phone) {
        notifyHref = whatsappShareLink(
          assignedJobWhatsAppMessage(reservation),
          driver.phone,
          settings.whatsappCountryCode,
        );
      }
    }
    const shareHref = whatsappShareLink(
      bookingShareMessage(reservation),
      undefined,
      settings.whatsappCountryCode,
    );
    return {
      ok: true as const,
      id: reservation.id,
      notifyHref,
      shareHref,
      message: parsed.data.id
        ? "Reservation updated successfully."
        : "Reservation created successfully.",
    };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Unable to save reservation. Please try again."),
    };
  }
}

export async function setReservationStatusAction(id: string, status: ReservationStatus) {
  await requireSession();
  try {
    await updateReservationStatus(id, status);
    revalidateReservationViews();
    revalidatePath(`/reservations/${id}`);
    return { ok: true as const, message: `Reservation marked ${status.toLowerCase()}.` };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Unable to update reservation."),
    };
  }
}

export async function deleteReservationAction(id: string) {
  await requireSession();
  try {
    await deleteReservation(id);
    revalidateReservationViews();
    return { ok: true as const, message: "Reservation deleted." };
  } catch (error) {
    return {
      ok: false as const,
      message: safeErrorMessage(error, "Unable to delete reservation."),
    };
  }
}
