import { auth } from "@/auth";

/**
 * Next.js 16 Proxy (formerly middleware).
 * Runs role-based auth checks defined in src/auth.config.ts#callbacks.authorized.
 */
export default auth;

export const config = {
  matcher: [
    "/login/:path*",
    "/register/:path*",
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/agency/:path*",
  ],
};