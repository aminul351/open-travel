import { Compass, Filter, Sparkles } from "lucide-react";
import Link from "next/link";

import { LocationSearchBar } from "@/components/location-search-bar";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiServiceDetail } from "@/lib/api";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SERVICE_TYPES = [
  { key: "PACKAGE", label: "Tour Packages", icon: "🧳" },
  { key: "HOTEL", label: "Hotels & Stays", icon: "🏨" },
  { key: "TRANSPORTATION", label: "Transportation", icon: "🚐" },
] as const;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; location?: string }>;
}) {
  const { type, location } = await searchParams;
  const activeType = SERVICE_TYPES.find((t) => t.key === type)?.key;
  const activeLocation = location?.trim() || "";

  const queryParams = new URLSearchParams();
  if (activeType) queryParams.set("type", activeType);
  if (activeLocation) queryParams.set("location", activeLocation);

  const { services = [] } = await apiFetch<{ services: ApiServiceDetail[] }>(
    `/api/services${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
  );

  const makeTypeHref = (t?: string) => {
    const params = new URLSearchParams();
    if (activeLocation) params.set("location", activeLocation);
    if (t) params.set("type", t);
    return `/services${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const makeClearLocationHref = () => {
    const params = new URLSearchParams();
    if (activeType) params.set("type", activeType);
    return `/services${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          <span>Marketplace Catalog</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Services from our agencies
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Browse verified hotels, airport transfers, and comprehensive tour packages published directly by licensed partner agencies.
        </p>
      </div>

      {/* Filter and Search Container */}
      <div className="mb-8 space-y-4 rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <div className="max-w-2xl">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Search by Place or Agency
          </label>
          <LocationSearchBar
            initialValue={activeLocation}
            actionPath="/services"
            placeholder="Search destination, city, country, or agency name..."
          />
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Popular:</span>
            {["Nepal", "Thailand", "Kathmandu", "Pokhara", "Phuket"].map((place) => (
              <Link
                key={place}
                href={`/services?location=${encodeURIComponent(place)}${activeType ? `&type=${activeType}` : ""}`}
                className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
              >
                {place}
              </Link>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="border-t border-border/60 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              render={<Link href={makeTypeHref()} scroll={false} />}
              variant={activeType ? "ghost" : "default"}
              size="sm"
              className={cn("rounded-xl text-xs font-semibold", !activeType && "shadow-xs")}
            >
              All Services
            </Button>
            {SERVICE_TYPES.map((t) => (
              <Button
                key={t.key}
                render={<Link href={makeTypeHref(t.key)} scroll={false} />}
                variant={activeType === t.key ? "default" : "outline"}
                size="sm"
                className={cn(
                  "gap-1.5 rounded-xl text-xs font-semibold border-border/80",
                  activeType === t.key && "shadow-xs border-primary"
                )}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Search Indicator Banner */}
      {activeLocation && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            <span>
              Showing results matching <strong className="text-foreground">"{activeLocation}"</strong>
              <span className="ml-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                {services.length} offer{services.length === 1 ? "" : "s"}
              </span>
            </span>
          </div>
          <Link
            href={makeClearLocationHref()}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Clear filter ✕
          </Link>
        </div>
      )}

      {/* Results Grid */}
      {services.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-14 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No services found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeLocation
              ? `No offerings found matching "${activeLocation}"${activeType ? ` in ${activeType}` : ""}.`
              : "No services published under this category yet."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {activeLocation && (
              <Button render={<Link href={makeClearLocationHref()} />} variant="outline" size="sm" className="rounded-xl">
                Clear location filter
              </Button>
            )}
            <Button render={<Link href="/services" />} size="sm" className="rounded-xl">
              View all services
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}