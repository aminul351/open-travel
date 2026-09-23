import { Calendar, Compass, MessageSquare, Plane, PlusCircle } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { ROLE_DASHBOARD_PATH, type Role } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/sign-out-button";
import { apiFetch, type ApiConversation } from "@/lib/api";
import { cn } from "@/lib/utils";

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  CUSTOMER: {
    label: "Traveler",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-400",
  },
  AGENCY: {
    label: "Agency Partner",
    className: "bg-violet-500/10 text-violet-700 border-violet-500/25 dark:text-violet-400",
  },
  ADMIN: {
    label: "Platform Admin",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-400",
  },
};

export async function DashboardNav() {
  const session = await auth();
  const user = session?.user;

  if (!user) return null;

  const chatRes = await apiFetch<{ conversations: ApiConversation[] }>(
    "/api/chat/conversations"
  ).catch(() => ({ conversations: [] }));
  const unreadCount =
    chatRes?.conversations?.reduce((acc, c) => acc + (c.unread || 0), 0) || 0;

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleInfo = ROLE_BADGE[user.role] ?? {
    label: user.role.toLowerCase(),
    className: "bg-muted text-muted-foreground",
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Role */}
        <div className="flex items-center gap-3">
          <Link
            href={ROLE_DASHBOARD_PATH[user.role as Role] ?? "/"}
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-primary/20 transition-transform group-hover:scale-105">
              <Plane className="size-4.5 -rotate-12 transition-transform group-hover:rotate-0" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-foreground text-base leading-tight">
                Open Travel
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Portal
              </span>
            </div>
          </Link>

          <Badge
            variant="outline"
            className={cn("hidden sm:inline-flex text-[11px] font-medium px-2 py-0.5 border", roleInfo.className)}
          >
            {roleInfo.label}
          </Badge>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/services"
            className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:block px-2.5 py-1 rounded-lg hover:bg-muted/60"
          >
            All Offers
          </Link>
          <Link
            href="/tours"
            className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:block px-2.5 py-1 rounded-lg hover:bg-muted/60"
          >
            Tours
          </Link>

          {user.role === "AGENCY" && (
            <>
              <Link
                href="/dashboard/agency/bookings"
                className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:block px-2.5 py-1 rounded-lg hover:bg-muted/60"
              >
                Bookings
              </Link>
              <Link
                href="/dashboard/agency/services"
                className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:block px-2.5 py-1 rounded-lg hover:bg-muted/60"
              >
                My Services
              </Link>
              <Link
                href="/dashboard/agency/services/new"
                className="hidden items-center gap-1 text-xs font-medium text-primary md:inline-flex bg-primary/10 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <PlusCircle className="size-3.5" />
                Post Offer
              </Link>
            </>
          )}

          {/* Messages button */}
          <Link
            href="/dashboard/chat"
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/60",
              unreadCount > 0 ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="size-4" />
            <span className="hidden sm:inline">Messages</span>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center font-bold">
                {unreadCount}
              </Badge>
            )}
          </Link>

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="size-9 cursor-pointer ring-2 ring-primary/20 transition-all hover:ring-primary/40">
                <AvatarFallback className="bg-primary/15 font-semibold text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border/80">
              <DropdownMenuLabel className="space-y-0.5 p-3">
                <p className="font-semibold text-foreground text-sm">{user.name}</p>
                <p className="text-xs font-normal text-muted-foreground truncate">
                  {user.email}
                </p>
                <div className="pt-1">
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", roleInfo.className)}>
                    {roleInfo.label}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/dashboard/chat" className="flex items-center justify-between w-full" />}>
                <span>Conversations</span>
                {unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/services" className="w-full" />}>
                Browse Marketplace
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <SignOutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}