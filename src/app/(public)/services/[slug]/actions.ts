"use server";

import { revalidatePath } from "next/cache";

import { apiFetch, ApiError, type ApiBooking } from "@/lib/api";

export type BookingInput = {
  serviceId: string;
  travelDate: string;
  numTravelers: number;
  specialRequests?: string;
};

export type BookingResult = {
  ok: boolean;
  error?: string;
  booking?: Pick<ApiBooking, "bookingNumber" | "totalPrice" | "currency">;
};

export async function bookService(input: BookingInput): Promise<BookingResult> {
  try {
    const { booking } = await apiFetch<{ booking: ApiBooking }>(
      "/api/customer/bookings",
      {
        method: "POST",
        body: {
          serviceId: input.serviceId,
          travelDate: input.travelDate,
          numTravelers: input.numTravelers,
          specialRequests: input.specialRequests ?? "",
        },
      }
    );
    revalidatePath("/dashboard/customer");
    return {
      ok: true,
      booking: {
        bookingNumber: booking.bookingNumber,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
      },
    };
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message };
    throw err;
  }
}