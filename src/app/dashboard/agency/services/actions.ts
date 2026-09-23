"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiFetch, ApiError } from "@/lib/api";

export type ServiceFormState = { error: string | null };

export type ActionResult = { ok?: boolean; error?: string };

const TEXT_FIELDS = [
  "type",
  "currency",
  "title",
  "location",
  "price",
  "description",
  "address",
  "checkIn",
  "checkOut",
  "roomsAvailable",
  "vehicleType",
  "capacity",
  "from",
  "to",
  "durationDays",
  "durationNights",
  "groupSizeMax",
  "imageUrl",
];

function formToServiceBody(formData: FormData) {
  const body: Record<string, string | boolean> = {};
  for (const field of TEXT_FIELDS) {
    const value = formData.get(field);
    if (value !== null) body[field] = String(value).trim();
  }
  body.featured = formData.get("featured") === "on";
  return body;
}

async function saveService(
  path: string,
  method: "POST" | "PUT",
  formData: FormData
): Promise<ServiceFormState> {
  try {
    await apiFetch<{ service: unknown }>(path, {
      method,
      body: formToServiceBody(formData),
    });
    revalidatePath("/dashboard/agency/services");
    redirect("/dashboard/agency/services");
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
}

async function runAction(path: string, method: "POST" | "DELETE"): Promise<ActionResult> {
  try {
    await apiFetch<{ ok?: boolean; service?: unknown }>(
      path,
      { method, body: {} }
    );
    revalidatePath("/dashboard/agency/services");
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
}

export async function createService(
  _prev: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  return saveService("/api/agency/services", "POST", formData);
}

export async function updateService(
  _prev: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing service id." };
  return saveService(`/api/agency/services/${id}`, "PUT", formData);
}

export async function publishService(serviceId: string): Promise<ActionResult> {
  if (!serviceId) return { error: "Missing service id." };
  return runAction(`/api/agency/services/${serviceId}/publish`, "POST");
}

export async function unpublishService(serviceId: string): Promise<ActionResult> {
  if (!serviceId) return { error: "Missing service id." };
  return runAction(`/api/agency/services/${serviceId}/unpublish`, "POST");
}

export async function deleteService(serviceId: string): Promise<ActionResult> {
  if (!serviceId) return { error: "Missing service id." };
  return runAction(`/api/agency/services/${serviceId}`, "DELETE");
}