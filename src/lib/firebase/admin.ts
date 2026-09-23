import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export const isFirebaseAdminConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_SERVICE_ACCOUNT?.trim()
);

export const adminAuth = {
  verifyIdToken: async (idToken: string) => {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error(
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured in environment variables."
      );
    }

    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    return {
      uid: payload.sub as string,
      email: (payload.email as string) || null,
      name: (payload.name as string) || null,
      picture: (payload.picture as string) || null,
      email_verified: Boolean(payload.email_verified),
      ...payload,
    };
  },
};