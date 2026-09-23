import "server-only";

export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT?.trim() ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()
);

function buildOptions(cert: any, applicationDefault: any) {
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
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      return { credential: cert(parsed), projectId };
    } catch (e) {
      console.warn(
        "[firebase-admin] JSON.parse failed on FIREBASE_SERVICE_ACCOUNT, falling back to cert(raw):",
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

let authInstance: any = null;

export const adminAuth = {
  verifyIdToken: async (idToken: string) => {
    if (authInstance) {
      return authInstance.verifyIdToken(idToken);
    }
    const { getApps, initializeApp, cert, applicationDefault } = await import(
      "firebase-admin/app"
    );
    const { getAuth } = await import("firebase-admin/auth");

    const apps = getApps();
    const app = apps.length
      ? apps[0]
      : initializeApp(buildOptions(cert, applicationDefault));
    authInstance = getAuth(app);
    return authInstance.verifyIdToken(idToken);
  },
};