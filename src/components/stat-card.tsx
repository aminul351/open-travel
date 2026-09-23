import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden border border-border/80 shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/30", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
          {hint && (
            <p className="text-xs text-muted-foreground font-medium">
              {hint}
            </p>
          )}
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs ring-1 ring-primary/20">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}