import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

export type MintUser = {
  id: string;
  role: string;
  name: string | null;
  email: string;
  image?: string | null;
};

export function sessionCookieName() {
  const baseUrl = process.env.AUTH_URL;
  const secure = baseUrl
    ? baseUrl.startsWith("https://")
    : process.env.NODE_ENV === "production";
  return {
    cookieName: `${secure ? "__Secure-" : ""}authjs.session-token`,
    secure,
  };
}

export async function createSessionResponse(
  payload: Record<string, unknown>,
  user: MintUser
) {
  const { cookieName, secure } = sessionCookieName();

  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not configured in Vercel environment variables. Please add AUTH_SECRET to Vercel."
    );
  }

  const sessionToken = await encode({
    secret,
    salt: cookieName,
    maxAge: SESSION_MAX_AGE,
    token: {
      sub: user.id,
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      picture: user.image ?? undefined,
    },
  });

  const response = NextResponse.json(payload);
  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}