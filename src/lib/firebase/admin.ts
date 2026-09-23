import "server-only";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type AppOptions,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT?.trim() ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()
);

function buildOptions(): AppOptions {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();

  if (rawServiceAccount) {
    let raw = rawServiceAccount;
    // Strip wrapping single or double quotes if pasted from .env files
    if (
      (raw.startsWith("'") && raw.endsWith("'")) ||
      (raw.startsWith('"') && raw.endsWith('"'))
    ) {
      raw = raw.slice(1, -1).trim();
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed.private_key && typeof parsed.private_key === "string") {
        // Ensure literal newlines for private key PEM formatting
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      return { credential: cert(parsed), projectId };
    } catch (e) {
      console.warn(
        "[firebase-admin] JSON.parse failed on FIREBASE_SERVICE_ACCOUNT, attempting raw path/cert:",
        (e as Error)?.message
      );
      return { credential: cert(raw), projectId };
    }
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    return { credential: applicationDefault(), projectId };
  }

  return { projectId };
}

export function getAdminAuth() {
  if (getApps().length) {
    return getAuth(getApps()[0]);
  }
  return getAuth(initializeApp(buildOptions()));
}

export const adminAuth = {
  verifyIdToken: async (idToken: string) => {
    const auth = getAdminAuth();
    return auth.verifyIdToken(idToken);
  },
};