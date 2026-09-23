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
  const secure = baseUrl ? baseUrl.startsWith("https://") : false;
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

  const sessionToken = await encode({
    secret: process.env.AUTH_SECRET ?? "",
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