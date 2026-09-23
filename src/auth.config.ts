import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

import { ROLE_DASHBOARD_PATH, type Role } from "@/lib/constants";

/**
 * Shared NextAuth configuration used by both the server config (src/auth.ts)
 * and the Next.js Proxy (src/proxy.ts) so role-based routing works in one place.
 * This file must stay dependency-light: it is imported by the Proxy runtime.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth: session, request }) {
      const path = request.nextUrl.pathname;

      // Public auth pages — bounce signed-in users to their dashboard.
      if (path.startsWith("/login") || path.startsWith("/register")) {
        const user = session?.user;
        if (user?.role) {
          const target = ROLE_DASHBOARD_PATH[user.role as Role];
          return NextResponse.redirect(
            new URL(target + request.nextUrl.search, request.nextUrl)
          );
        }
        return true;
      }

      // Role-scoped dashboards.
      if (path.startsWith("/dashboard")) {
        const user = session?.user;
        if (!user?.role) {
          return NextResponse.redirect(new URL("/login", request.nextUrl));
        }

        // Shared dashboard routes accessible by any authenticated role (e.g. Chat/Messages).
        if (path.startsWith("/dashboard/chat")) {
          return true;
        }

        const match = path.match(/^\/dashboard\/(customer|agency|admin)(?:\/|$)/);
        if (!match) {
          const target = ROLE_DASHBOARD_PATH[user.role as Role];
          return NextResponse.redirect(
            new URL(target + request.nextUrl.search, request.nextUrl)
          );
        }

        if (match[1].toUpperCase() !== user.role) {
          const target = ROLE_DASHBOARD_PATH[user.role as Role];
          return NextResponse.redirect(
            new URL(target + request.nextUrl.search, request.nextUrl)
          );
        }
        return true;
      }

      // Role-scoped API routes.
      if (path.startsWith("/api/admin")) {
        if (session?.user?.role !== "ADMIN") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return true;
      }
      if (path.startsWith("/api/agency")) {
        if (session?.user?.role !== "AGENCY") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return true;
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;