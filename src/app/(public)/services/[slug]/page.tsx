import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, Compass, Home, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { apiFetch, type ApiServiceDetail } from "@/lib/api";
import { formatMoney } from "@/lib/format";

import { BookingForm } from "./booking-form";
import { ContactAgencyButton } from "./contact-agency";

const TYPE_CONFIG: Record<string, { icon: string; label: string; bg: string }> = {
  HOTEL: { icon: "🏨", label: "Hotel & Stay", bg: "from-blue-500/10 via-indigo-500/10 to-primary/5" },
  TRANSPORTATION: { icon: "🚐", label: "Transportation", bg: "from-sky-500/10 via-teal-500/10 to-primary/5" },
  PACKAGE: { icon: "🧳", label: "Tour Package", bg: "from-emerald-500/10 via-cyan-500/10 to-primary/5" },
};

function humanize(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await apiFetch<ApiServiceDetail>(
    `/api/services/${slug}`
  ).catch(() => null);
  return { title: service?.title ?? "Service Details" };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, session] = await Promise.all([
    apiFetch<ApiServiceDetail>(`/api/services/${slug}`).catch(() => null),
    auth(),
  ]);

  if (!service) {
    notFound();
  }

  const isCustomer = session?.user?.role === "CUSTOMER";
  const isSignedIn = !!session?.user;
  const location =
    typeof service.details?.location === "string" ? service.details.location : null;
  const destination =
    typeof service.details?.destination === "string" ? service.details.destination : null;
  const displayLocation = location || destination;

  const details = Object.entries(service.details ?? {}).filter(
    ([key, value]) =>
      key !== "location" && key !== "destination" && value !== null && value !== undefined && value !== ""
  );

  const conf = TYPE_CONFIG[service.type] ?? {
    icon: "🧳",
    label: service.type,
    bg: "from-primary/10 via-muted/40 to-primary/5",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Home className="size-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/60" />
        <Link href="/services" className="hover:text-foreground">
          Services
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/60" />
        <Link
          href={`/services?type=${service.type}`}
          className="hover:text-foreground"
        >
          {conf.label}
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/60" />
        <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
          {service.title}
        </span>
      </nav>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Media & Information */}
        <div className="space-y-8 lg:col-span-2">
          {/* Header Title Section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {service.featured && (
                <Badge className="bg-amber-500 text-white border-0 text-xs px-2.5 py-0.5 shadow-2xs">
                  ★ Featured Listing
                </Badge>
              )}
              <Badge variant="outline" className="border-border/80 bg-background/80 text-xs px-2.5 py-0.5">
                {conf.icon} {conf.label}
              </Badge>
              {service.agency?.verified && (
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs px-2.5 py-0.5">
                  ✓ Verified Agency
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {service.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {displayLocation && (
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <MapPin className="size-4 text-primary" />
                  {displayLocation}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {service.ratingAvg > 0
                  ? `${service.ratingAvg.toFixed(1)} (${service.ratingCount} reviews)`
                  : "New offer"}
              </span>
              <span>·</span>
              <span>Operated by <strong className="text-foreground">{service.agency?.name ?? "Partner"}</strong></span>
            </div>
          </div>

          {/* Visual Banner */}
          <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-3xl border border-border/80 bg-muted/40 shadow-xs">
            {service.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.imageUrl}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${conf.bg} text-7xl`}>
                <span className="filter drop-shadow-md">{conf.icon}</span>
              </div>
            )}
          </div>

          {/* About Section */}
          <section className="space-y-3 rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Compass className="size-5 text-primary" />
              About this experience
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {service.description}
            </p>
          </section>

          {/* Key Details Grid */}
          {details.length > 0 && (
            <section className="space-y-3 rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              <h2 className="text-lg font-bold text-foreground">Package Specifications</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                {details.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-border/60 bg-muted/30 p-3.5"
                  >
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {humanize(key)}
                    </dt>
                    <dd className="mt-1 font-semibold text-foreground text-sm">
                      {typeof value === "string" ? value : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Operated by Agency Card */}
          <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-lg font-bold text-foreground mb-4">Tour Operator</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-foreground">
                    {service.agency?.name ?? "Partner Agency"}
                  </span>
                  {service.agency?.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Licensed partner agency. Approves bookings and coordinates inquiries directly with travelers.
                </p>
              </div>

              <div className="shrink-0">
                <ContactAgencyButton
                  serviceId={service.id}
                  serviceTitle={service.title}
                  agencyName={service.agency?.name ?? "Agency"}
                  isSignedIn={isSignedIn}
                  isCustomer={isCustomer}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <aside className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24 rounded-3xl border border-border/80 bg-card shadow-lg">
            <CardHeader className="border-b border-border/60 pb-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    {formatMoney(service.price, service.currency)}
                  </span>
                  <span className="text-xs text-muted-foreground font-normal"> / person</span>
                </div>
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[11px] font-semibold">
                  Instant Booking
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
              {isCustomer ? (
                <BookingForm
                  serviceId={service.id}
                  price={service.price}
                  currency={service.currency}
                />
              ) : (
                <div className="space-y-3">
                  <Button
                    render={<a href={isSignedIn ? "/dashboard" : "/login"} />}
                    className="w-full font-semibold shadow-xs"
                    size="lg"
                  >
                    {isSignedIn ? "Customer Account Required" : "Sign in to Book"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    {isSignedIn
                      ? "Agencies and admins cannot place consumer bookings. Use a traveler account."
                      : "Create a free traveler account or sign in to complete your booking."}
                  </p>
                </div>
              )}

              {/* Direct Agency Inquiry Button */}
              <div className="border-t border-border/60 pt-4">
                <ContactAgencyButton
                  serviceId={service.id}
                  serviceTitle={service.title}
                  agencyName={service.agency?.name ?? "Agency"}
                  isSignedIn={isSignedIn}
                  isCustomer={isCustomer}
                />
              </div>

              {/* Trust Guarantees */}
              <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>Direct booking confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary shrink-0" />
                  <span>No hidden markups or booking fees</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}