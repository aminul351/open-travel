"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="size-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        We encountered an unexpected error while loading this page. This could be due to a temporary backend network issue or cold start.
      </p>

      {error?.digest && (
        <p className="mt-2 text-xs font-mono text-muted-foreground/80">
          Error Digest: {error.digest}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCw className="size-4" />
          Try again
        </Button>
        <Button render={<Link href="/" />} variant="outline" className="gap-2">
          <Home className="size-4" />
          Go to Home
        </Button>
      </div>
    </div>
  );
}
