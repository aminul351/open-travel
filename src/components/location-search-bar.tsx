"use client";

import { MapPin, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LocationSearchBarProps {
  initialValue?: string;
  placeholder?: string;
  actionPath?: string;
  className?: string;
  size?: "default" | "lg";
}

export function LocationSearchBar({
  initialValue = "",
  placeholder = "Search destination, city, country, or agency...",
  actionPath = "/services",
  className,
  size = "default",
}: LocationSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialValue || searchParams.get("location") || "");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("location", trimmed);
      } else {
        params.delete("location");
      }

      const targetBase = actionPath;
      const targetUrl = params.toString() ? `${targetBase}?${params.toString()}` : targetBase;
      router.push(targetUrl);
    });
  };

  const handleClear = () => {
    setQuery("");
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("location");
      const targetUrl = params.toString() ? `${actionPath}?${params.toString()}` : actionPath;
      router.push(targetUrl);
    });
  };

  const isLarge = size === "lg";

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "relative flex w-full items-center gap-2 rounded-2xl border border-border/80 bg-background/95 p-1.5 shadow-sm backdrop-blur-md transition-all duration-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 hover:border-primary/40",
        isLarge && "p-2 sm:p-2.5 shadow-lg",
        className
      )}
    >
      <div className="relative flex flex-1 items-center">
        <div
          className={cn(
            "pointer-events-none absolute left-2.5 flex items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors",
            isLarge ? "size-9" : "size-7"
          )}
        >
          <MapPin className={cn(isLarge ? "size-5" : "size-4")} />
        </div>

        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-10 border-0 bg-transparent pl-11 pr-9 shadow-none text-foreground placeholder:text-muted-foreground/80 focus-visible:ring-0",
            isLarge && "h-12 pl-14 text-base"
          )}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <Button
        type="submit"
        size={isLarge ? "lg" : "default"}
        disabled={isPending}
        className={cn(
          "shrink-0 gap-2 rounded-xl font-semibold shadow-xs transition-all hover:shadow-md active:scale-95",
          isLarge && "h-12 px-6 text-sm"
        )}
      >
        <Search className={cn(isLarge ? "size-4.5" : "size-4")} />
        <span>{isPending ? "Searching..." : "Search"}</span>
      </Button>
    </form>
  );
}
