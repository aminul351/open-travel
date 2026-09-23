import { Plane, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-gradient-to-b from-primary/10 via-primary/5 to-background">
      {/* Subtle decorative glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-primary/20 transition-transform group-hover:scale-105">
            <Plane className="size-4.5 -rotate-12" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-foreground text-base leading-tight">
              Open Travel
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Marketplace
            </span>
          </div>
        </Link>
        <Link
          href="/services"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Browse marketplace →
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card/95 p-6 sm:p-8 shadow-xl backdrop-blur-md">
          {children}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        <div className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-emerald-600" />
          <span>Secure authentication powered by Firebase &amp; NextAuth</span>
        </div>
      </footer>
    </div>
  );
}