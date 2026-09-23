import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { apiFetch, ApiError, type ApiService } from "@/lib/api";

import { ServiceForm } from "../../service-form";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (session?.user?.role !== "AGENCY") {
    redirect("/dashboard");
  }

  const { service } = await apiFetch<{ service: ApiService }>(
    `/api/agency/services/${id}`
  ).catch((err: unknown) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit service</h1>
        <p className="mt-1 text-muted-foreground">
          Update the details below. The current status is kept unchanged.
        </p>
      </div>
      <ServiceForm
        submitLabel="Save changes"
        service={{
          id: service.id,
          type: service.type,
          title: service.title,
          description: service.description,
          price: service.price,
          currency: service.currency,
          imageUrl: service.imageUrl,
          featured: service.featured,
          details: service.details ?? null,
          status: service.status,
        }}
      />
    </div>
  );
}