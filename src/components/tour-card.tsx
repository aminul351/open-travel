import { ArrowRight, CalendarDays, MapPin, Star, Users } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatMoney } from "@/lib/format";

export type TourCardTour = {
  slug: string;
  title: string;
  description: string;
  destination: string;
  country: string | null;
  durationDays: number;
  durationNights: number;
  groupSizeMax: number;
  price: { toString(): string };
  currency: string;
  ratingAvg: number;
  ratingCount: number;
  featured: boolean;
  category?: { name: string; icon: string | null } | null;
};

export function TourCard({ tour }: { tour: TourCardTour }) {
  return (
    <Link href={`/tours/${tour.slug}`} className="group flex h-full">
      <Card className="flex w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40">
        <CardHeader className="relative h-48 border-b border-border/60 p-0 overflow-hidden bg-gradient-to-br from-primary/10 via-muted/40 to-primary/5">
          <div className="flex h-full w-full items-center justify-center text-5xl transition-transform duration-500 ease-out group-hover:scale-105">
            <span className="filter drop-shadow-sm">{tour.category?.icon ?? "🏝"}</span>
          </div>

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {tour.featured && (
              <Badge className="bg-amber-500/95 hover:bg-amber-500 text-white font-medium shadow-sm backdrop-blur-sm border-0 text-[11px] px-2.5 py-0.5">
                ★ Featured
              </Badge>
            )}
            {tour.category && (
              <Badge className="bg-background/90 text-foreground font-medium shadow-sm backdrop-blur-md border border-border/60 text-[11px] px-2.5 py-0.5">
                {tour.category.name}
              </Badge>
            )}
          </div>

          {tour.ratingAvg > 0 && (
            <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md border border-border/60">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span>{tour.ratingAvg.toFixed(1)}</span>
              {tour.ratingCount > 0 && (
                <span className="text-[10px] text-muted-foreground">({tour.ratingCount})</span>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-2 p-5">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {tour.destination}
              {tour.country ? `, ${tour.country}` : ""}
            </span>
          </span>

          <h3 className="text-base font-bold text-foreground leading-snug transition-colors group-hover:text-primary line-clamp-1">
            {tour.title}
          </h3>

          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {tour.description}
          </p>

          <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5 text-primary" />
              {formatDuration(tour.durationDays, tour.durationNights)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5 text-primary" />
              Up to {tour.groupSizeMax} travelers
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-5 py-3.5">
          <div>
            <span className="text-lg font-extrabold text-foreground tracking-tight">
              {formatMoney(tour.price, tour.currency)}
            </span>
            <span className="text-[11px] text-muted-foreground"> / person</span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all group-hover:gap-1.5">
            View details
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}