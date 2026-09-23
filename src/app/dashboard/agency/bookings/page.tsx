import { CheckCircle2, Hourglass, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch, type ApiAgency, type ApiBooking } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

import { BookingRowActions } from "./booking-row-actions";

export const dynamic = "force-dynamic";

export default async function AgencyBookingsPage() {
  const session = await auth();
  if (session?.user?.role !== "AGENCY") redirect("/dashboard");

  const { agency, bookings } = await apiFetch<{
    agency: ApiAgency;
    bookings: ApiBooking[];
  }>("/api/agency/dashboard").catch((err) => {
    if ((err as { status?: number }).status === 404) {
      redirect("/register?role=AGENCY");
    }
    throw err;
  });

  const pending = bookings.filter((b) => b.status === "PENDING").length;
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
  const revenue = bookings
    .filter((b) => b.status !== "CANCELLED" && b.status !== "CANCELLED")
    .reduce((s, b) => s + Number(b.totalPrice), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="mt-1 text-muted-foreground">
          Accept or decline booking requests from customers for {agency.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={pending} icon={Hourglass} />
        <StatCard label="Confirmed" value={confirmed} icon={CheckCircle2} />
        <StatCard label="Revenue" value={formatMoney(revenue, "USD")} icon={Wallet} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No bookings yet. Once customers book your published services they
              will show up here for you to accept or decline.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Travel date</TableHead>
                  <TableHead>Travelers</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      {b.bookingNumber}
                    </TableCell>
                    <TableCell>{b.service?.title ?? "—"}</TableCell>
                    <TableCell>{b.customer?.user?.name ?? "—"}</TableCell>
                    <TableCell>{formatDate(b.travelDate)}</TableCell>
                    <TableCell>{b.numTravelers}</TableCell>
                    <TableCell>{formatMoney(b.totalPrice, b.currency)}</TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="flex justify-end">
                      <BookingRowActions bookingId={b.id} status={b.status} />
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