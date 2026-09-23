"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiAgency } from "@/lib/api";
import { formatDate } from "@/lib/format";

import { approveAgency, rejectAgency } from "./actions";

export type AdminAgency = ApiAgency & {
  createdAt?: string;
  owner?: { name: string; email: string } | null;
};

export function AgencyApprovals({ agencies }: { agencies: AdminAgency[] }) {
  const [pending, start] = useTransition();

  function handleApprove(agency: AdminAgency) {
    start(async () => {
      const result = await approveAgency(agency.id);
      if (result.error) toast.error(result.error);
      else toast.success(`${agency.name} approved. They can now publish.`);
    });
  }

  function handleReject(agency: AdminAgency) {
    const input = window.prompt(
      `Reason for rejecting "${agency.name}"? (optional)`
    );
    if (input === null) return;
    start(async () => {
      const result = await rejectAgency(agency.id, input.trim());
      if (result.error) toast.error(result.error);
      else toast.success(`${agency.name} was rejected.`);
    });
  }

  return (
    <div>
      {agencies.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No agencies waiting for approval.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agency</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agencies.map((agency) => (
              <TableRow key={agency.id}>
                <TableCell>
                  <div className="font-medium">{agency.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {agency.slug}
                    {agency.rejectedReason
                      ? ` · rejected: ${agency.rejectedReason}`
                      : ""}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{agency.owner?.name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {agency.owner?.email ?? ""}
                  </div>
                </TableCell>
                <TableCell>
                  {agency.createdAt ? formatDate(agency.createdAt) : "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={agency.approvalStatus} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {agency.approvalStatus !== "APPROVED" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(agency)}
                        disabled={pending}
                      >
                        <Check />
                        Approve
                      </Button>
                    )}
                    {agency.approvalStatus !== "REJECTED" && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(agency)}
                        disabled={pending}
                      >
                        <X />
                        Reject
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}