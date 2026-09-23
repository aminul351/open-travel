import { NextResponse } from "next/server";

import { apiFetch, ApiError, type ApiUser } from "@/lib/api";
import { adminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { createSessionResponse } from "@/lib/mint-session";

type SessionRequest = {
  idToken?: string;
  name?: string;
  agencyName?: string;
  role?: string;
};

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured) {
    return NextResponse.json(
      {
        error:
          "Firebase admin is not configured. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.",
      },
      { status: 503 }
    );
  }

  let body: SessionRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const idToken = typeof body.idToken === "string" ? body.idToken : "";
  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token." },
      { status: 401 }
    );
  }

  const email = decoded.email?.toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "Account has no email address." },
      { status: 400 }
    );
  }

  const requestedRole = body.role === "AGENCY" ? "AGENCY" : "CUSTOMER";

  try {
    const { user, isNewUser } = await apiFetch<{
      user: ApiUser;
      isNewUser: boolean;
    }>("/api/users/upsert", {
      method: "POST",
      body: {
        email,
        name: decoded.name ?? body.name,
        role: requestedRole,
        image: decoded.picture ?? null,
        emailVerified: decoded.email_verified ? Date.now() : null,
        agencyName: body.agencyName,
      },
    });

    return createSessionResponse(
      { ok: true, isNewUser, role: user.role },
      {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      }
    );
  } catch (error) {
    console.error("[firebase/session] failed to create session:", error);
    const detail =
      error instanceof ApiError
        ? `ApiError(${error.status}) ${error.message}`
        : error instanceof Error
          ? error.message
          : "Unknown error";
    console.error("[firebase/session] detail:", detail);
    return NextResponse.json(
      { error: "Sign-in failed. Please try again." },
      { status: 500 }
    );
  }
}