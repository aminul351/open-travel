import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Open Travel account.",
};

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6 space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue to your dashboard.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}