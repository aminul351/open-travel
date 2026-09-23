import { ArrowRight, CheckCircle2, MapPin, Star } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ApiServiceDetail } from "@/lib/api";
import { formatMoney } from "@/lib/format";

const TYPE_CONFIG: Record<string, { icon: string; label: string; bg: string }> = {
  HOTEL: { icon: "🏨", label: "Hotel & Stay", bg: "from-blue-500/10 to-indigo-500/10" },
  TRANSPORTATION: { icon: "🚐", label: "Transport", bg: "from-sky-500/10 to-teal-500/10" },
  PACKAGE: { icon: "🧳", label: "Tour Package", bg: "from-emerald-500/10 to-cyan-500/10" },
};

export function ServiceCard({
  service,
}: {
  service: ApiServiceDetail;
}) {
  const location =
    typeof service.details?.location === "string" ? service.details.location : null;
  const destination =
    typeof service.details?.destination === "string" ? service.details.destination : null;
  const displayLocation = location || destination;

  const conf = TYPE_CONFIG[service.type] ?? {
    icon: "🧳",
    label: service.type.charAt(0) + service.type.slice(1).toLowerCase(),
    bg: "from-primary/10 to-primary/5",
  };

  return (
    <Link href={`/services/${service.slug}`} className="group flex h-full">
      <Card className="flex w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40">
        <CardHeader className="relative h-48 border-b border-border/60 p-0 overflow-hidden bg-muted/40">
          {service.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={service.imageUrl}
              alt={service.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${conf.bg} text-5xl transition-transform duration-500 group-hover:scale-105`}>
              <span className="filter drop-shadow-sm">{conf.icon}</span>
            </div>
          )}

          {/* Floating Pill Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {service.featured && (
              <Badge className="bg-amber-500/95 hover:bg-amber-500 text-white font-medium shadow-sm backdrop-blur-sm border-0 text-[11px] px-2.5 py-0.5">
                ★ Featured
              </Badge>
            )}
            <Badge className="bg-background/90 text-foreground font-medium shadow-sm backdrop-blur-md border border-border/60 text-[11px] px-2.5 py-0.5">
              {conf.icon} {conf.label}
            </Badge>
          </div>

          {service.ratingAvg > 0 && (
            <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md border border-border/60">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span>{service.ratingAvg.toFixed(1)}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-2 p-5">
          {displayLocation && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </span>
          )}

          <h3 className="text-base font-bold text-foreground leading-snug transition-colors group-hover:text-primary line-clamp-1">
            {service.title}
          </h3>

          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {service.description}
          </p>

          <div className="mt-auto pt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>By</span>
            <span className="font-medium text-foreground truncate max-w-[160px]">
              {service.agency?.name ?? "Partner Agency"}
            </span>
            {service.agency?.verified && (
              <CheckCircle2 className="size-3.5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950 shrink-0" />
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-5 py-3.5">
          <div>
            <span className="text-lg font-extrabold text-foreground tracking-tight">
              {formatMoney(service.price, service.currency)}
            </span>
            <span className="text-[11px] text-muted-foreground"> / person</span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all group-hover:gap-1.5">
            View &amp; book
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}