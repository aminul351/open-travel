import {
  CalendarClock,
  Compass,
  MessageSquare,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LocationSearchBar } from "@/components/location-search-bar";
import { ServiceCard } from "@/components/service-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
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
  type ApiBooking,
  type ApiConversation,
  type ApiServiceDetail,
} from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

import { CancelBookingButton } from "./cancel-booking-button";

export default async function CustomerDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ location?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "CUSTOMER") {
    redirect("/dashboard");
  }

  const params = searchParams ? await searchParams : {};
  const activeLocation = params?.location?.trim() || "";

  const [bookingsResult, servicesResult, chatResult] = await Promise.all([
    apiFetch<{ bookings: ApiBooking[] }>("/api/customer/dashboard"),
    apiFetch<{ services: ApiServiceDetail[] }>(
      `/api/services${activeLocation ? `?location=${encodeURIComponent(activeLocation)}` : ""}`
    ),
    apiFetch<{ conversations: ApiConversation[] }>("/api/chat/conversations").catch(() => ({
      conversations: [],
    })),
  ]);
  const bookings = bookingsResult?.bookings ?? [];
  const services = servicesResult?.services ?? [];
  const conversations = chatResult?.conversations ?? [];
  const unreadCount = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);

  const upcoming = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "PENDING"
  ).length;
  const spent = bookings
    .filter((b) => b.paymentStatus === "PAID")
    .reduce((sum, b) => sum + Number(b.totalPrice), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 sm:p-8 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            <Sparkles className="size-3" />
            <span>Traveler Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
            Welcome back, {session.user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Manage your booked journeys, communicate directly with licensed agencies, and discover new global destinations.
          </p>
        </div>

        <Button
          render={<Link href="/dashboard/chat" />}
          variant="outline"
          className="gap-2 rounded-xl border-border/80 bg-background/80 font-medium shadow-xs hover:border-primary/40"
        >
          <MessageSquare className="size-4 text-primary" />
          <span>Inquiries &amp; Messages</span>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 ml-0.5">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Bookings"
          value={bookings.length}
          hint={bookings.length > 0 ? "Lifetime reservations" : "No bookings yet"}
          icon={Compass}
        />
        <StatCard
          label="Upcoming Trips"
          value={upcoming}
          hint="Confirmed & Pending"
          icon={CalendarClock}
        />
        <StatCard
          label="Total Completed"
          value={formatMoney(spent)}
          hint="Paid reservations"
          icon={Wallet}
        />
      </div>

      {/* Recent Messages Card */}
      {conversations.length > 0 && (
        <Card className="rounded-3xl border border-border/80 shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/60">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                Recent Agency Inquiries
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Direct conversations with operating agencies.
              </p>
            </div>
            <Link
              href="/dashboard/chat"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open all messages →
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 p-0">
            {conversations.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{c.otherName}</span>
                    {c.unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                        {c.unread} new
                      </Badge>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {c.updatedAt ? formatDate(c.updatedAt) : ""}
                    </span>
                  </div>
                  {c.service?.title && (
                    <p className="text-xs text-primary font-medium truncate mt-0.5">
                      {c.service.title}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {c.lastPreview || "No messages yet"}
                  </p>
                </div>
                <Button
                  render={<Link href={`/dashboard/chat?id=${c.id}`} />}
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs font-semibold shrink-0"
                >
                  Reply
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Discover Offers Section with In-place Search */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
              Discover Agency Offers
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Every package, hotel, and airport transfer published by our accredited partners.
            </p>
          </div>
          <Button
            render={
              <Link
                href={
                  activeLocation
                    ? `/services?location=${encodeURIComponent(activeLocation)}`
                    : "/services"
                }
              />
            }
            variant="ghost"
            size="sm"
            className="font-semibold text-primary hover:text-primary"
          >
            Explore marketplace catalog →
          </Button>
        </div>

        {/* Search Box */}
        <div className="max-w-2xl">
          <LocationSearchBar
            initialValue={activeLocation}
            actionPath="/dashboard/customer"
            placeholder="Search offers by destination, city, country, or agency..."
          />
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Quick destinations:</span>
            {["Nepal", "Thailand", "Kathmandu", "Pokhara", "Phuket"].map((place) => (
              <Link
                key={place}
                href={`/dashboard/customer?location=${encodeURIComponent(place)}`}
                className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
              >
                {place}
              </Link>
            ))}
          </div>
        </div>

        {activeLocation && (
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs sm:text-sm">
            <span>
              Showing results for: <strong className="text-foreground">"{activeLocation}"</strong> ({services.length} found)
            </span>
            <Link
              href="/dashboard/customer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear filter ✕
            </Link>
          </div>
        )}

        {services.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-10 text-center text-xs sm:text-sm text-muted-foreground">
            <p>
              {activeLocation
                ? `No agency offers found matching "${activeLocation}".`
                : "No offers published yet. Our agencies are preparing new listings — check back soon."}
            </p>
            {activeLocation && (
              <div className="mt-4 flex justify-center gap-3">
                <Button render={<Link href="/dashboard/customer" />} variant="outline" size="sm" className="rounded-xl">
                  Clear search
                </Button>
                <Button render={<Link href="/services" />} size="sm" className="rounded-xl">
                  Browse all marketplace services
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <Card className="rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/60 pb-4">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Ticket className="size-4 text-primary" />
            My Bookings &amp; Reservations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-xs sm:text-sm text-muted-foreground">
              <p>You have no active bookings yet.</p>
              <p className="mt-1 text-xs">Browse the offers above to plan and confirm your next trip.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-bold uppercase">Booking #</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Package / Service</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Travel Date</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Guests</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Total</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Booking Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Payment</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="font-semibold text-xs text-foreground">
                      {b.bookingNumber}
                    </TableCell>
                    <TableCell>
                      {b.service ? (
                        <Link
                          href={`/services/${b.service.slug}`}
                          className="font-medium text-xs text-primary hover:underline line-clamp-1"
                        >
                          {b.service.title}
                        </Link>
                      ) : (
                        "—"
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {b.service?.agency?.name ?? ""}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(b.travelDate)}</TableCell>
                    <TableCell className="text-xs font-medium">{b.numTravelers}</TableCell>
                    <TableCell className="text-xs font-bold text-foreground">
                      {formatMoney(b.totalPrice, b.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      {b.status === "PENDING" && b.paymentStatus === "UNPAID" ? (
                        <CancelBookingButton bookingId={b.id} />
                      ) : null}
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
