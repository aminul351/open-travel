"use server";

import { revalidatePath } from "next/cache";

import { apiFetch, ApiError } from "@/lib/api";

export type ActionResult = { ok?: boolean; error?: string };

export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  if (!bookingId) return { error: "Missing booking id." };
  try {
    await apiFetch(`/api/customer/bookings/${bookingId}/cancel`, {
      method: "POST",
      body: {},
    });
    revalidatePath("/dashboard/customer");
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
}