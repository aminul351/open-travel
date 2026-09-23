import {
  CheckCircle2,
  DollarSign,
  MapPin,
  MessageSquare,
  Package,
  PlusCircle,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
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
  type ApiAgency,
  type ApiBooking,
  type ApiConversation,
  type ApiService,
} from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<string, string> = {
  HOTEL: "🏨",
  TRANSPORTATION: "🚐",
  PACKAGE: "🧳",
};

function getServiceLocation(service: ApiService) {
  const details = service.details;
  if (details && typeof details.location === "string") return details.location;
  if (details && typeof details.destination === "string") return details.destination;
  return null;
}

export default async function AgencyDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "AGENCY") {
    redirect("/dashboard");
  }

  const [dashboardData, chatData] = await Promise.all([
    apiFetch<{
      agency: ApiAgency;
      services: ApiService[];
      bookings: ApiBooking[];
    }>("/api/agency/dashboard").catch((err: unknown) => {
      if ((err as { status?: number }).status === 404) {
        redirect("/register?role=AGENCY");
      }
      throw err;
    }),
    apiFetch<{ conversations: ApiConversation[] }>("/api/chat/conversations").catch(() => ({
      conversations: [],
    })),
  ]);

  const { agency: profile, services, bookings } = dashboardData;
  const conversations = chatData?.conversations ?? [];
  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);

  const revenue = bookings
    .filter((b) => b.status !== "CANCELLED" && b.status !== "DECLINED")
    .reduce((sum, b) => sum + Number(b.totalPrice), 0);

  const recentBookings = bookings.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Agency Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-gradient-to-r from-violet-500/10 via-primary/5 to-background p-6 sm:p-8 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-400">
              <Sparkles className="size-3" />
              Agency Management Portal
            </span>
            {profile.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                Verified
              </span>
            )}
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
            {profile.name}
          </h1>

          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-primary" />
            <span>
              {profile.city ? `${profile.city}, ` : ""}
              {profile.country || "Global Operator"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            render={<Link href="/dashboard/agency/services/new" />}
            className="gap-2 font-semibold shadow-xs"
          >
            <PlusCircle className="size-4" />
            <span>Post New Offer</span>
          </Button>

          <Button
            render={<Link href="/dashboard/chat" />}
            variant="outline"
            className="gap-2 rounded-xl border-border/80 bg-background/80 font-medium hover:border-primary/40"
          >
            <MessageSquare className="size-4 text-primary" />
            <span>Inquiries</span>
            {totalUnreadMessages > 0 && (
              <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                {totalUnreadMessages}
              </Badge>
            )}
          </Button>

          <Button render={<Link href="/services" />} variant="ghost" className="text-xs">
            Marketplace
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Services"
          value={services.length}
          hint="Published packages"
          icon={Package}
        />
        <StatCard
          label="Total Bookings"
          value={bookings.length}
          hint="Customer reservations"
          icon={Users}
        />
        <StatCard
          label="Estimated Revenue"
          value={formatMoney(revenue)}
          hint="Gross confirmed"
          icon={DollarSign}
        />
        <StatCard
          label="Customer Inquiries"
          value={conversations.length}
          hint={totalUnreadMessages > 0 ? `${totalUnreadMessages} new messages` : "All answered"}
          icon={MessageSquare}
        />
      </div>

      {/* Customer Inquiries Card */}
      {conversations.length > 0 && (
        <Card className="rounded-3xl border border-border/80 shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/60">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                Customer Inquiries &amp; Messages
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Questions from travelers regarding your published tours and services.
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
            {conversations.slice(0, 5).map((c) => (
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

      {/* Recent Bookings Table Card */}
      <Card className="rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b border-border/60 pb-4">
          <CardTitle className="text-base font-bold text-foreground">
            Recent Customer Bookings
          </CardTitle>
          {bookings.length > 0 && (
            <Link
              href="/dashboard/agency/bookings"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all ({bookings.length}) →
            </Link>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {recentBookings.length === 0 ? (
            <p className="p-12 text-center text-xs text-muted-foreground">
              No bookings yet. As customers book your tours, they will appear here.
            </p>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-bold uppercase">Booking #</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Service</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Customer</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Travel Date</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Total</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((b) => (
                  <TableRow key={b.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="font-semibold text-xs text-foreground">
                      {b.bookingNumber}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {b.service?.title ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.customer?.user?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(b.travelDate)}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-foreground">
                      {formatMoney(b.totalPrice, b.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* My Published Services Section */}
      <Card className="rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b border-border/60 pb-4">
          <CardTitle className="text-base font-bold text-foreground">
            My Published Listings ({services.length})
          </CardTitle>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/agency/services/new"
              className="text-xs font-semibold text-primary hover:underline"
            >
              + Create new
            </Link>
            {services.length > 0 && (
              <Link
                href="/dashboard/agency/services"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Manage all →
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {services.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <p>You have not published any services yet.</p>
              <Button
                render={<Link href="/dashboard/agency/services/new" />}
                size="sm"
                className="mt-4 rounded-xl font-semibold"
              >
                Create your first listing
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((t) => (
                <Card
                  key={t.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xs transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <Link href={`/dashboard/agency/services/${t.id}/edit`}>
                    <div className="relative h-40 border-b border-border/60 overflow-hidden bg-muted/30">
                      {t.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.imageUrl}
                          alt={t.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted/40 to-primary/5 text-4xl">
                          {TYPE_ICON[t.type] ?? "🧳"}
                        </div>
                      )}
                      <div className="absolute left-3 top-3">
                        <Badge className="bg-background/90 text-foreground font-medium shadow-xs backdrop-blur-md text-[11px] px-2 py-0.5">
                          {TYPE_ICON[t.type] ?? "🧳"}{" "}
                          {t.type.charAt(0) + t.type.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="flex flex-1 flex-col gap-1.5 p-4">
                      <h3 className="font-bold text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
                        {t.title}
                      </h3>
                      <p className="line-clamp-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="size-3 text-primary shrink-0" />
                        {getServiceLocation(t) || "—"}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {t.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                        <span className="text-base font-extrabold text-foreground">
                          {formatMoney(t.price, t.currency)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}