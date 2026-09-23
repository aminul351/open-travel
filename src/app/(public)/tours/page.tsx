import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";

import { TourCard } from "@/components/tour-card";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiCategory, type ApiTour } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Tours",
  description: "Discover curated tours and packages from trusted travel agencies.",
};

export default async function ToursPage() {
  const { tours = [], categories = [] } = await apiFetch<{
    tours: ApiTour[];
    categories: ApiCategory[];
  }>("/api/tours");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          <span>Curated Excursions</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Explore Guided Tours
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Hand-picked cultural, adventure, and beach excursions operated directly by licensed travel agencies worldwide.
        </p>
      </div>

      {/* Categories Bar */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3.5 py-1.5 text-xs font-medium text-foreground shadow-2xs transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span aria-hidden className="text-sm">{c.icon ?? "🏝"}</span>
              <span>{c.name}</span>
            </span>
          ))}
        </div>
      )}

      {/* Tours Grid */}
      {tours.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-14 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No tours published yet</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Our partner agencies are currently updating seasonal itineraries. Explore live offers on the marketplace in the meantime.
          </p>
          <div className="mt-5">
            <Button render={<Link href="/services" />} size="sm" className="rounded-xl">
              Browse agency offers
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}