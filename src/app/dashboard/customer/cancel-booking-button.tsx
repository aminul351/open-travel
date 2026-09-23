"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { cancelBooking } from "./actions";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, start] = useTransition();

  function handleCancel() {
    if (
      !window.confirm(
        "Cancel this booking? This cannot be undone and must not have been paid."
      )
    ) {
      return;
    }
    start(async () => {
      const result = await cancelBooking(bookingId);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={handleCancel}
      disabled={pending}
      aria-label="Cancel booking"
    >
      <X />
      {pending ? "..." : "Cancel"}
    </Button>
  );
}