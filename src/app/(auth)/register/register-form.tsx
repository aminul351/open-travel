"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, validatePassword } from "firebase/auth";

import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { mapFirebaseAuthError } from "@/lib/firebase/errors";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string>(
    searchParams.get("role") === "AGENCY" ? "AGENCY" : "CUSTOMER"
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFirebaseConfigured || !firebaseAuth) {
      setError("Sign-up is not configured yet.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const agencyName = String(formData.get("agencyName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setPending(true);
    setError(null);
    try {
      // Validate the password against the Firebase password policy (if any).
      const policy = await validatePassword(firebaseAuth, password);
      if (policy.isValid === false) {
        setError(
          "That password does not meet the required password policy. Include a lowercase letter, an uppercase letter, a number, and a special character, and keep it between 6 and 30 characters."
        );
        return;
      }

      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/auth/firebase/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, name, role, agencyName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not create the account. Please try again.");
        return;
      }

      const landingRole = role === "AGENCY" ? "agency" : "customer";
      router.push(`/dashboard/${landingRole}?welcome=1`);
      router.refresh();
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <GoogleSignInButton />
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          or sign up with email
        </span>
        <Separator className="flex-1" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <fieldset className="grid grid-cols-2 gap-2">
          {(["CUSTOMER", "AGENCY"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                role === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {r === "CUSTOMER" ? "Traveler" : "Agency"}
            </button>
          ))}
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="name">
            {role === "AGENCY" ? "Contact name" : "Full name"}
          </Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder={role === "AGENCY" ? "Jane Doe" : "Jane Traveler"}
            required
          />
        </div>

        {role === "AGENCY" && (
          <div className="space-y-2">
            <Label htmlFor="agencyName">Agency name</Label>
            <Input
              id="agencyName"
              name="agencyName"
              autoComplete="organization"
              placeholder="Summit Expeditions"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending
            ? "Creating account..."
            : role === "AGENCY"
              ? "Create agency account"
              : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}