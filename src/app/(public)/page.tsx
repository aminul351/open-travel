import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Globe2,
  Handshake,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { LocationSearchBar } from "@/components/location-search-bar";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiCategory, type ApiServiceDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: Compass,
    title: "Curated experiences",
    text: "Every tour and package is published directly by verified partner agencies and reviewed by authentic travelers.",
  },
  {
    icon: ShieldCheck,
    title: "Verified agencies",
    text: "Only accredited and background-verified agencies can list on Open Travel, so you always travel with peace of mind.",
  },
  {
    icon: MessageSquare,
    title: "Direct agency chat",
    text: "Message the operating agency directly with inquiries, special requests, and itinerary questions before booking.",
  },
];

const TRUST_METRICS = [
  { label: "Agency Rating", value: "4.9/5", icon: Star, color: "text-amber-500" },
  { label: "Verified Operators", value: "100%", icon: ShieldCheck, color: "text-emerald-500" },
  { label: "Direct Messaging", value: "Real-time", icon: MessageSquare, color: "text-primary" },
  { label: "Secure Bookings", value: "Guaranteed", icon: CheckCircle2, color: "text-blue-500" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ location?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const location = params?.location?.trim() || "";

  const { services = [], categories = [] } = await apiFetch<{
    services: ApiServiceDetail[];
    categories: ApiCategory[];
  }>(`/api/home${location ? `?location=${encodeURIComponent(location)}` : ""}`);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/10 via-primary/5 to-background pb-16 pt-12 sm:pb-24 sm:pt-20">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          {/* Trust Badge */}
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/90 px-4 py-1.5 text-xs font-semibold text-foreground shadow-xs backdrop-blur-md">
            <Sparkles className="size-3.5 text-primary" />
            <span>Verified Global Travel Marketplace</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-primary font-bold">2026 Edition</span>
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-tight">
            Explore the world with{" "}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              trusted agencies
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Discover real-time packages, airport transportation, and hotels from verified travel agencies. Message agents directly and book with confidence.
          </p>

          {/* Elevated Search Bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <LocationSearchBar
              size="lg"
              placeholder="Search destination, country, city, or agency (e.g. Nepal, Thailand...)"
              actionPath="/services"
              initialValue={location}
            />

            {/* Quick Destination Chips */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Popular:</span>
              {["Nepal", "Thailand", "Kathmandu", "Pokhara", "Phuket"].map((place) => (
                <Link
                  key={place}
                  href={`/services?location=${encodeURIComponent(place)}`}
                  className="rounded-full border border-border/70 bg-background/80 px-3 py-1 font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                >
                  {place}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              render={<Link href="/services" />}
              size="lg"
              className="gap-2 font-semibold shadow-md transition-all hover:shadow-lg"
            >
              Explore all offers
              <ArrowRight className="size-4" />
            </Button>
            <Button
              render={<Link href="/register?role=AGENCY" />}
              size="lg"
              variant="outline"
              className="gap-2 font-medium bg-background/80"
            >
              <Handshake className="size-4 text-primary" />
              List as an agency
            </Button>
          </div>

          {/* Trust Metrics Strip */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {TRUST_METRICS.map((metric) => (
              <div
                key={metric.label}
                className="flex items-center gap-2.5 rounded-2xl border border-border/70 bg-background/80 p-3 text-left shadow-2xs backdrop-blur-sm"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <metric.icon className={`size-4.5 ${metric.color}`} />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground leading-tight">
                    {metric.value}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {metric.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Explorer */}
      {categories.length > 0 && (
        <section className="border-b border-border/60 bg-muted/20 py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Browse by Travel Style
                </h3>
              </div>
              <Link href="/services" className="text-xs font-semibold text-primary hover:underline">
                All categories →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href="/services"
                  className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl transition-transform group-hover:scale-110">
                    <span aria-hidden>{c.icon ?? "✈️"}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {c.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">Explore packages</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Agency Offers Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
                {location ? `Agency offers for "${location}"` : "Latest agency offers"}
              </h2>
              {location && (
                <Link
                  href="/"
                  className="rounded-full border border-border bg-muted/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filter ✕
                </Link>
              )}
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {location
                ? `Showing ${services.length} offer(s) matching "${location}". Book online or message the agency directly.`
                : "Direct packages published by accredited agencies — compare options and message agencies directly."}
            </p>
          </div>
          <Button
            render={
              <Link href={location ? `/services?location=${encodeURIComponent(location)}` : "/services"} />
            }
            variant="ghost"
            className="gap-1.5 font-semibold text-primary hover:text-primary"
          >
            View marketplace catalog
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Compass className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {location
                ? `No agency offers found for "${location}"`
                : "Agency offers are being prepared"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {location
                ? "Try searching for another country or city, or explore all listings."
                : "Check back soon as verified agencies publish new offerings."}
            </p>
            {location && (
              <div className="mt-5 flex justify-center gap-3">
                <Button render={<Link href="/" />} variant="outline" size="sm">
                  Clear search filter
                </Button>
                <Button render={<Link href="/services" />} size="sm">
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
      </section>

      {/* Agency Partner Callout Banner */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-blue-500/10 p-8 sm:p-12">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Handshake className="size-3.5" />
              For Tour &amp; Travel Operators
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Are you a licensed travel agency or tour operator?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Showcase your packages, hotels, and transfer services directly to thousands of travelers. Manage bookings, receive customer inquiries, and grow your agency.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button render={<Link href="/register?role=AGENCY" />} size="lg" className="font-semibold shadow-sm">
                Register as an Agency Partner
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
              <Button render={<Link href="/login" />} variant="outline" size="lg" className="bg-background/80">
                Agency Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-bold text-foreground text-base">{f.title}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}