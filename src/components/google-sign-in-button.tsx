"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

export function GoogleSignInButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    if (!isFirebaseConfigured || !firebaseAuth) {
      setError("Google sign-in is not configured yet.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/firebase/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const rawText = await res.text().catch(() => "");
        let errorMsg = "";
        try {
          const parsed = JSON.parse(rawText);
          errorMsg = parsed.error;
        } catch {
          errorMsg = rawText;
        }
        setError(errorMsg || `Google sign-in failed (status ${res.status}). Please try again.`);
        return;
      }

      const data = await res.json();
      router.push(`/dashboard?${data.isNewUser ? "welcome=1" : "signedin=1"}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in was cancelled. Please try again."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={handleGoogle}
      >
        <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z"
          />
        </svg>
        {pending ? "Opening Google account chooser..." : "Continue with Google"}
      </Button>
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </>
  );
}