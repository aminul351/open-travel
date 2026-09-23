import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { apiFetch, ApiError, type ApiAgency } from "@/lib/api";
import { AGENCY_APPROVAL_STATUS } from "@/lib/constants";

import { ServiceForm } from "../service-form";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const session = await auth();
  if (session?.user?.role !== "AGENCY") {
    redirect("/dashboard");
  }

  const { agency } = await apiFetch<{ agency: ApiAgency }>(
    "/api/agency/profile"
  ).catch((err: unknown) => {
    if (err instanceof ApiError && err.status === 404) {
      redirect("/register?role=AGENCY");
    }
    throw err;
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New service</h1>
        <p className="mt-1 text-muted-foreground">
          Services are saved as drafts until you publish them.
          {agency.approvalStatus !== AGENCY_APPROVAL_STATUS.APPROVED &&
            " Publishing unlocks once your agency has been approved."}
        </p>
      </div>
      <ServiceForm submitLabel="Create service" />
    </div>
  );
}