import { apiFetch, type ApiAgency } from "@/lib/api";

// Resolves the agency profile for the signed-in user, or null when the caller
// is not an authenticated agency (or carries a stale/invalid session). Server
// actions must never trust a client-supplied agencyId.
export async function requireAgency() {
  const { agency } = await apiFetch<{ agency: ApiAgency }>(
    "/api/agency/profile"
  ).catch((err: unknown) => {
    const status = (err as { status?: number }).status;
    if (status === 404 || status === 403) return { agency: null };
    throw err;
  });
  return agency;
}