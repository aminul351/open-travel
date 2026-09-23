import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join Open Travel as a traveler or agency.",
};

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-6 space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Join as a traveler or register your travel agency.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}