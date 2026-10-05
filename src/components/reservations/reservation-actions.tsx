"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Check, MessageCircle, Pencil, Phone, X } from "lucide-react";
import { Reservation } from "@/lib/types";
import { telLink, whatsappLink } from "@/lib/phone";
import {
  deleteReservationAction,
  setReservationStatusAction,
} from "@/app/actions/reservations";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ReservationActions({
  reservation,
  countryCode,
}: {
  reservation: Reservation;
  countryCode: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const wa = whatsappLink(reservation.whatsapp || reservation.phone, countryCode);
  const tel = telLink(reservation.phone);

  function runStatus(status: "Completed" | "Cancelled") {
    startTransition(async () => {
      const result = await setReservationStatusAction(reservation.id, status);
      if (!result.ok) toast.error(result.message);
      else toast.success(result.message);
      router.refresh();
    });
  }

  function runDelete() {
    startTransition(async () => {
      const result = await deleteReservationAction(reservation.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/reservations");
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button asChild variant="outline">
        <Link href={`/reservations/${reservation.id}/edit`}>
          <Pencil /> Edit
        </Link>
      </Button>
      {wa ? (
        <Button asChild variant="ocean">
          <a href={wa} target="_blank" rel="noreferrer">
            <MessageCircle /> WhatsApp
          </a>
        </Button>
      ) : null}
      {tel ? (
        <Button asChild variant="secondary">
          <a href={tel}>
            <Phone /> Call
          </a>
        </Button>
      ) : null}
      <Button
        variant="default"
        disabled={pending || reservation.status === "Completed"}
        onClick={() => runStatus("Completed")}
      >
        <Check /> Mark completed
      </Button>
      <Button
        variant="outline"
        disabled={pending || reservation.status === "Cancelled"}
        onClick={() => runStatus("Cancelled")}
      >
        <X /> Cancel
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={pending}>
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this reservation?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes it from the database and the finance ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep reservation</AlertDialogCancel>
            <AlertDialogAction onClick={runDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
