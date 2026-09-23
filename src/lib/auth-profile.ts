import { apiFetch, type ApiUser } from "@/lib/api";

export async function ensureRoleProfile(userId: string, role: string) {
  await apiFetch<{ ok: boolean }>("/api/users/ensure-profile", {
    method: "POST",
    body: { userId, role },
  });
}

export type { ApiUser };