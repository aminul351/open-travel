import { Building2, LineChart, Package, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
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
import { apiFetch, type ApiReview, type ApiUser } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

import { AgencyApprovals, type AdminAgency } from "./agency-approvals";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [
    {
      userCount,
      agencyCount,
      tourCount,
      bookingCount,
      recentUsers,
      pendingReviews,
      revenue,
    },
    { agencies },
  ] = await Promise.all([
    apiFetch<{
      userCount: number;
      agencyCount: number;
      tourCount: number;
      bookingCount: number;
      recentUsers: ApiUser[];
      pendingReviews: ApiReview[];
      revenue: number;
    }>("/api/admin/dashboard"),
    apiFetch<{ agencies: AdminAgency[] }>("/api/admin/agencies"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform overview</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor users, agencies, tours, and bookings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={userCount} icon={Users} />
        <StatCard label="Agencies" value={agencyCount} icon={Building2} />
        <StatCard label="Tour packages" value={tourCount} icon={Package} />
        <StatCard label="Paid bookings" value={`${bookingCount} · ${formatMoney(revenue)}`} icon={LineChart} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agency approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <AgencyApprovals agencies={agencies} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent signups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span className="capitalize">{u.role.toLowerCase()}</span>
                  </TableCell>
                  <TableCell>{formatDate(u.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews awaiting moderation</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No reviews waiting for approval. Nice.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tour</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.tourPackage?.title ?? "—"}
                    </TableCell>
                    <TableCell>{r.rating}★</TableCell>
                    <TableCell className="max-w-md truncate">
                      {r.comment ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
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