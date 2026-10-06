"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Check, MessageCircle, Pencil, Phone, X } from "lucide-react";
import { Reservation } from "@/lib/types";
import { telLink, whatsappLink } from "@/lib/phone";
import { deleteReservationAction } from "@/app/actions/reservations";
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
      <Button asChild variant="default">
        <Link href={`/drive/${reservation.id}`}>
          <Check /> Complete
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href={`/drive/${reservation.id}`}>
          <X /> Cancel
        </Link>
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
