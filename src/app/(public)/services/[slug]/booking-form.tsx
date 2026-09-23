"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/format";

import { bookService, type BookingResult } from "./actions";

function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function BookingForm({
  serviceId,
  price,
  currency,
}: {
  serviceId: string;
  price: number;
  currency: string;
}) {
  const [travelDate, setTravelDate] = useState(() =>
    toISODate(new Date(Date.now() + 24 * 60 * 60 * 1000))
  );
  const [travelers, setTravelers] = useState(1);
  const [requests, setRequests] = useState("");
  const [result, setResult] = useState<BookingResult | null>(null);
  const [pending, startTransition] = useTransition();

  const today = toISODate(new Date());
  const total = price * travelers;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const res = await bookService({
        serviceId,
        travelDate,
        numTravelers: travelers,
        specialRequests: requests || undefined,
      });
      setResult(res);
      if (!res.ok) toast.error(res.error ?? "Booking failed.");
    });
  }

  if (result?.ok && result.booking) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
        <div>
          <p className="font-semibold">Booking request received</p>
          <p className="text-sm text-muted-foreground">
            Reference <span className="font-medium text-foreground">{result.booking.bookingNumber}</span> ·{" "}
            {formatMoney(result.booking.totalPrice, result.booking.currency)}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          The agency will confirm shortly. Track it in your dashboard.
        </p>
        <Button render={<Link href="/dashboard/customer" />} className="w-full">
          View my bookings
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="travelDate">Travel date</Label>
        <Input
          id="travelDate"
          name="travelDate"
          type="date"
          required
          min={today}
          value={travelDate}
          onChange={(e) => setTravelDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="travelers">Travelers</Label>
        <Input
          id="travelers"
          name="travelers"
          type="number"
          required
          min={1}
          max={100}
          value={travelers}
          onChange={(e) => setTravelers(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialRequests">Special requests (optional)</Label>
        <Textarea
          id="specialRequests"
          name="specialRequests"
          rows={3}
          placeholder="Any preferences, dietary needs, or accessibility requirements…"
          value={requests}
          onChange={(e) => setRequests(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {travelers} × {formatMoney(price, currency)}
        </span>
        <span className="font-semibold">{formatMoney(total, currency)}</span>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Booking…" : `Book now · ${formatMoney(total, currency)}`}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        The agency will confirm your booking request. Payment happens later.
      </p>
    </form>
  );
}