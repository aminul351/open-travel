"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";

import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { mapFirebaseAuthError } from "@/lib/firebase/errors";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { ROLE_DASHBOARD_PATH, type Role } from "@/lib/constants";

export function LoginForm() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetPending, setResetPending] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFirebaseConfigured || !firebaseAuth) {
      setError("Sign-in is not configured yet.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    setPending(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/auth/firebase/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed. Please try again.");
        return;
      }

      const path =
        ROLE_DASHBOARD_PATH[(data.role as Role) ?? "CUSTOMER"] ?? "/dashboard/customer";
      router.push(`${path}?signedin=1`);
      router.refresh();
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setPending(false);
    }
  }

  async function handleForgotPassword() {
    if (!isFirebaseConfigured || !firebaseAuth) {
      setError("Password reset is not configured yet.");
      return;
    }
    const email = emailRef.current?.value.trim() ?? "";
    setResetMessage(null);
    setError(null);
    if (!email) {
      setError("Enter your email address first, then click \"Forgot password?\".");
      return;
    }
    setResetPending(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setResetMessage(`Password reset email sent to ${email}. Check your inbox.`);
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setResetPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <GoogleSignInButton />
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          or with email
        </span>
        <Separator className="flex-1" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {resetMessage && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {resetMessage}
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetPending}
              className="text-xs font-medium text-primary hover:underline"
            >
              {resetPending ? "Sending..." : "Forgot password?"}
            </button>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}