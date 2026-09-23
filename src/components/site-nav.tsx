import { Compass, Globe2, Plane, Sparkles, User } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

async function getUserMenu() {
  const session = await auth();
  if (!session?.user) return null;
  const path = `/dashboard/${session.user.role.toLowerCase()}`;
  return { name: session.user.name, href: path, role: session.user.role };
}

export async function SiteNav() {
  const user = await getUserMenu();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-primary/20 transition-transform group-hover:scale-105">
            <Plane className="size-4.5 -rotate-12 transition-transform group-hover:rotate-0" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-foreground text-lg leading-tight flex items-center gap-1.5">
              Open Travel
              <span className="hidden sm:inline-flex rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                PRO
              </span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
              Global Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          <Link
            href="/services"
            className="rounded-lg px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            Agency Offers
          </Link>
          <Link
            href="/tours"
            className="rounded-lg px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            Explore Tours
          </Link>
          <Link
            href="/register?role=AGENCY"
            className="inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-primary"
          >
            <Sparkles className="size-3.5 text-amber-500" />
            For Agencies
          </Link>
        </nav>

        {/* Auth CTA Actions */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <Button
              render={<Link href={user.href} />}
              size="sm"
              className="gap-2 font-medium shadow-xs"
            >
              <User className="size-3.5" />
              <span>Dashboard</span>
            </Button>
          ) : (
            <>
              <Button
                render={<Link href="/login" />}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                Sign in
              </Button>
              <Button
                render={<Link href="/register" />}
                size="sm"
                className="gap-1.5 font-medium shadow-xs"
              >
                <span>Get started</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}