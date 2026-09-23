import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  apiFetch,
  type ApiAgency,
  type ApiService,
} from "@/lib/api";
import { AGENCY_APPROVAL_STATUS, SERVICE_TYPE } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

import { ServiceRowActions } from "./service-row-actions";

export const dynamic = "force-dynamic";

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Hotel", value: SERVICE_TYPE.HOTEL },
  { label: "Transportation", value: SERVICE_TYPE.TRANSPORTATION },
  { label: "Package", value: SERVICE_TYPE.PACKAGE },
];

const TYPE_STYLES: Record<string, string> = {
  HOTEL: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  TRANSPORTATION:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  PACKAGE:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function getServiceLocation(service: ApiService) {
  const details = service.details;
  if (details && typeof details.location === "string") return details.location;
  return "—";
}

function approvalBanner(approvalStatus: string, rejectedReason: string | null) {
  if (approvalStatus === AGENCY_APPROVAL_STATUS.APPROVED) {
    return (
      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
        Your agency is approved — you can publish services.
      </p>
    );
  }
  if (approvalStatus === AGENCY_APPROVAL_STATUS.PENDING) {
    return (
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
        Your agency is pending approval. You can create and edit draft services,
        but publishing is disabled until an admin approves your agency.
      </p>
    );
  }
  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      Your agency was rejected
      {rejectedReason ? ` (${rejectedReason})` : ""}. You can keep editing draft
      services, but you can&apos;t publish until your agency is approved.
    </p>
  );
}

export default async function AgencyServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const requested = String(sp.type ?? "").trim();
  const filter = Object.values(SERVICE_TYPE).includes(requested as (typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE])
    ? requested
    : "";

  const session = await auth();
  if (session?.user?.role !== "AGENCY") redirect("/dashboard");

  const { agency, services } = await apiFetch<{
    agency: ApiAgency;
    services: ApiService[];
  }>(`/api/agency/services${filter ? `?type=${filter}` : ""}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your hotels, transportation and packages.
          </p>
        </div>
        <Button render={<Link href="/dashboard/agency/services/new" />}>
          <Plus />
          New service
        </Button>
      </div>

      {approvalBanner(agency.approvalStatus, agency.rejectedReason)}

      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((t) => {
          const active = (filter || "") === t.value;
          const href = t.value
            ? `/dashboard/agency/services?type=${t.value}`
            : "/dashboard/agency/services";
          return (
            <Link
              key={t.label}
              href={href}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filter
              ? `${filter.charAt(0) + filter.slice(1).toLowerCase()} services`
              : "All services"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No services{filter ? " of this type" : ""} yet.{" "}
              <Link
                href="/dashboard/agency/services/new"
                className="font-medium text-primary hover:underline"
              >
                Create one
              </Link>
              .
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <a
                        href={`/dashboard/agency/services/${service.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {service.title}
                      </a>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[service.type] ?? ""}`}
                      >
                        {service.type.charAt(0) + service.type.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>{getServiceLocation(service)}</TableCell>
                    <TableCell>
                      {formatMoney(service.price, service.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={service.status} />
                    </TableCell>
                    <TableCell>
                      <ServiceRowActions
                        serviceId={service.id}
                        status={service.status}
                        approvalStatus={agency.approvalStatus}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}