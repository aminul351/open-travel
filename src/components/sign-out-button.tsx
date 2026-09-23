"use client";

import { signOut } from "firebase/auth";
import { useTransition } from "react";

import { signOutAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { firebaseAuth } from "@/lib/firebase/client";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    // Per Firebase docs: sign out the Firebase Auth session on the client.
    if (firebaseAuth) {
      signOut(firebaseAuth).catch(() => {});
    }
    startTransition(() => {
      signOutAction();
    });
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      disabled={pending}
      onClick={handleSignOut}
    >
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}