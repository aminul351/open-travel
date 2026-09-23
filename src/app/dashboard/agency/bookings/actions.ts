"use server";

import { revalidatePath } from "next/cache";

import { apiFetch, ApiError } from "@/lib/api";

export type ActionResult = { ok?: boolean; error?: string };

async function runBookingAction(
  bookingId: string,
  action: "accept" | "decline"
): Promise<ActionResult> {
  if (!bookingId) return { error: "Missing booking id." };
  try {
    await apiFetch(`/api/agency/bookings/${bookingId}/${action}`, {
      method: "POST",
      body: {},
    });
    revalidatePath("/dashboard/agency/bookings");
    revalidatePath("/dashboard/agency");
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
}

export async function acceptBooking(bookingId: string): Promise<ActionResult> {
  return runBookingAction(bookingId, "accept");
}

export async function declineBooking(bookingId: string): Promise<ActionResult> {
  return runBookingAction(bookingId, "decline");
}