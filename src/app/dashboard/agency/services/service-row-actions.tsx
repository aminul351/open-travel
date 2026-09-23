"use client";

import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AGENCY_APPROVAL_STATUS } from "@/lib/constants";

import { deleteService, publishService, unpublishService } from "./actions";

export function ServiceRowActions({
  serviceId,
  status,
  approvalStatus,
}: {
  serviceId: string;
  status: string;
  approvalStatus: string;
}) {
  const [pendingStatus, startStatus] = useTransition();
  const [pendingDelete, startDelete] = useTransition();

  const canPublish = approvalStatus === AGENCY_APPROVAL_STATUS.APPROVED;
  const isPublished = status === "PUBLISHED";

  function handlePublishToggle() {
    if (!canPublish) {
      toast.error(
        "Your agency must be approved before you can publish services."
      );
      return;
    }
    startStatus(async () => {
      const result = isPublished
        ? await unpublishService(serviceId)
        : await publishService(serviceId);
      if (result.error) toast.error(result.error);
    });
  }

  function handleDelete() {
    if (!window.confirm("Delete this service? This cannot be undone.")) return;
    startDelete(async () => {
      const result = await deleteService(serviceId);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        render={<Link href={`/dashboard/agency/services/${serviceId}/edit`} />}
        variant="ghost"
        size="sm"
        aria-label="Edit service"
      >
        <Pencil />
        Edit
      </Button>
      <Button
        type="button"
        variant={isPublished ? "secondary" : "outline"}
        size="sm"
        onClick={handlePublishToggle}
        disabled={pendingStatus || !canPublish}
        title={!canPublish ? "Requires agency approval" : undefined}
      >
        {pendingStatus
          ? "..."
          : isPublished
            ? "Unpublish"
            : status === "ARCHIVED"
              ? "Archived"
              : "Publish"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={pendingDelete}
        aria-label="Delete service"
      >
        <Trash2 />
        Delete
      </Button>
    </div>
  );
}