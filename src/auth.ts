import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

// MongoDB stores ids as ObjectIds (24 hex chars). Sessions minted before a
// database migration (e.g. old SQLite cuid ids) are stale — treat them as
// unauthenticated instead of crashing backend lookups with a malformed ObjectID.
const isObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

// Session transport only. Sign-in/sign-up happen on the client (Firebase) and
// mint the session cookie via src/lib/mint-session.ts; no provider is used here.
export const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string" && isObjectId(token.id)) {
          session.user.id = token.id;
          session.user.role = (token.role as string) ?? "CUSTOMER";
        } else {
          session.user.id = "";
          session.user.role = "";
        }
      }
      return session;
    },
    ...authConfig.callbacks,
  },
});