import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { apiFetch, type ApiTour } from "@/lib/api";
import { formatDuration, formatMoney } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = await apiFetch<ApiTour>(`/api/tours/${slug}`).catch(() => null);
  return { title: tour?.title ?? "Tour not found" };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [tour, session] = await Promise.all([
    apiFetch<ApiTour>(`/api/tours/${slug}`).catch(() => null),
    auth(),
  ]);

  if (!tour || tour.status !== "PUBLISHED") {
    notFound();
  }

  const highlights = tour.highlights ?? [];
  const inclusions = tour.inclusions ?? [];
  const exclusions = tour.exclusions ?? [];
  const itinerary = tour.itinerary ?? [];

  const isCustomer = session?.user?.role === "CUSTOMER";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {tour.featured && <Badge variant="secondary">Featured</Badge>}
              {tour.category && (
                <Badge variant="outline">
                  {tour.category.icon} {tour.category.name}
                </Badge>
              )}
              <Badge variant="outline">{tour.status}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {tour.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {tour.destination}
                {tour.country ? `, ${tour.country}` : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {formatDuration(tour.durationDays, tour.durationNights)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" />
                {tour.groupSizeMin}–{tour.groupSizeMax} travelers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {tour.ratingCount > 0
                  ? `${tour.ratingAvg.toFixed(1)} (${tour.ratingCount} reviews)`
                  : "No reviews yet"}
              </span>
            </div>
          </div>

          <section>
            <h2 className="mb-2 text-xl font-semibold">About this tour</h2>
            <p className="text-muted-foreground">{tour.description}</p>
          </section>

          {highlights.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-semibold">Highlights</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm"
                  >
                    <span className="mt-0.5 text-primary">◆</span>
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {itinerary.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-semibold">Itinerary</h2>
              <ol className="space-y-3">
                {itinerary.map((i) => (
                  <li key={i.day} className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i.day}
                    </span>
                    <div className="pt-0.5">
                      <p className="font-medium">{i.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {i.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="grid gap-6 sm:grid-cols-2">
            {inclusions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What&apos;s included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-sm">
                    {inclusions.map((inc) => (
                      <li key={inc} className="flex gap-2">
                        <span className="text-emerald-600">✓</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {exclusions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Not included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-sm">
                    {exclusions.map((exc) => (
                      <li key={exc} className="flex gap-2">
                        <span className="text-destructive">✕</span>
                        {exc}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </section>
        </div>

        <aside className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle className="text-2xl">
                {formatMoney(tour.price, tour.currency)}
                <span className="text-sm font-normal text-muted-foreground"> /person</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Operated by{" "}
                <span className="font-medium text-foreground">
                  {tour.agency?.name ?? "—"}
                </span>
                {tour.agency?.verified && (
                  <span className="ml-1">✓ Verified partner</span>
                )}
              </p>
              {isCustomer ? (
                <Button className="w-full" size="lg">
                  Book this tour
                </Button>
              ) : (
                <>
                  <Button render={<a href="/login" />} className="w-full" size="lg">
                    Sign in to book
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Bookings are available to signed-in customers.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}