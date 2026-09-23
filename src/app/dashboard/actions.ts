"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { sessionCookieName } from "@/lib/mint-session";

export async function signOutAction() {
  const { cookieName, secure } = sessionCookieName();
  const store = await cookies();
  store.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });
  redirect("/");
}