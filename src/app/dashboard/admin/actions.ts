"use server";

import { revalidatePath } from "next/cache";

import { apiFetch, ApiError } from "@/lib/api";

export type AdminActionResult = { ok?: boolean; error?: string };

async function runApproval(
  path: string,
  body: { reason?: string }
): Promise<AdminActionResult> {
  try {
    await apiFetch<{ ok?: boolean; agency?: unknown }>(path, {
      method: "POST",
      body: { ...body },
    });
    revalidatePath("/dashboard/admin");
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
}

export async function approveAgency(agencyId: string): Promise<AdminActionResult> {
  if (!agencyId) return { error: "Missing agency id." };
  return runApproval(`/api/admin/agencies/${agencyId}/approve`, {});
}

export async function rejectAgency(
  agencyId: string,
  reason: string
): Promise<AdminActionResult> {
  if (!agencyId) return { error: "Missing agency id." };
  return runApproval(`/api/admin/agencies/${agencyId}/reject`, {
    reason: reason || undefined,
  });
}