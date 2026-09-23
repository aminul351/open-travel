import "server-only";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type AppOptions,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const hasServiceAccount = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT?.trim());
const hasCredentialPath = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim());

export const isFirebaseAdminConfigured = hasServiceAccount || hasCredentialPath;

function buildOptions(): AppOptions {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (hasServiceAccount) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT!.trim();
    try {
      return { credential: cert(JSON.parse(raw)), projectId };
    } catch {
      return { credential: cert(raw), projectId };
    }
  }
  if (hasCredentialPath) {
    return { credential: applicationDefault(), projectId };
  }
  return { projectId };
}

export const adminAuth = getAuth(
  getApps().length ? getApps()[0] : initializeApp(buildOptions())
);