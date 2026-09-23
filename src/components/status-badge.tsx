import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CONFIG: Record<
  string,
  { bg: string; text: string; dot: string; border: string }
> = {
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-500/20",
  },
  CONFIRMED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/20",
  },
  COMPLETED: {
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    border: "border-blue-500/20",
  },
  CANCELLED: {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
    border: "border-rose-500/20",
  },
  DECLINED: {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
    border: "border-rose-500/20",
  },
  REFUNDED: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-700 dark:text-zinc-400",
    dot: "bg-zinc-500",
    border: "border-zinc-500/20",
  },
  UNPAID: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-500/20",
  },
  PARTIAL: {
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400",
    dot: "bg-sky-500",
    border: "border-sky-500/20",
  },
  PAID: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/20",
  },
  PUBLISHED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/20",
  },
  DRAFT: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    border: "border-border",
  },
  ARCHIVED: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    border: "border-border",
  },
  APPROVED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/20",
  },
  REJECTED: {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
    border: "border-rose-500/20",
  },
  ACTIVE: {
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400",
    dot: "bg-sky-500",
    border: "border-sky-500/20",
  },
  HIDDEN: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    border: "border-border",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const conf = CONFIG[status] ?? {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    border: "border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide shadow-none border",
        conf.bg,
        conf.text,
        conf.border
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", conf.dot)} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}