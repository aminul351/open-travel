"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BOOKING_STATUS } from "@/lib/constants";

import { acceptBooking, declineBooking } from "./actions";

export function BookingRowActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [pendingAccept, startAccept] = useTransition();
  const [pendingDecline, startDecline] = useTransition();

  const canAct = status === BOOKING_STATUS.PENDING;

  function handleAccept() {
    startAccept(async () => {
      const result = await acceptBooking(bookingId);
      if (result.error) toast.error(result.error);
      else toast.success("Booking confirmed for your service.");
    });
  }

  function handleDecline() {
    if (!window.confirm("Decline this booking request?")) return;
    startDecline(async () => {
      const result = await declineBooking(bookingId);
      if (result.error) toast.error(result.error);
    });
  }

  if (!canAct) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-emerald-700 dark:text-emerald-300"
        onClick={handleAccept}
        disabled={pendingAccept || pendingDecline}
      >
        <Check />
        {pendingAccept ? "..." : "Accept"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={handleDecline}
        disabled={pendingDecline || pendingAccept}
      >
        <X />
        {pendingDecline ? "..." : "Decline"}
      </Button>
    </div>
  );
}