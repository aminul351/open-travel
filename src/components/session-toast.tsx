"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const MESSAGES: Record<string, { title: string; description?: string }> = {
  welcome: { title: "Account created", description: "Welcome to Open Travel!" },
  signedin: { title: "Signed in", description: "You're back on Open Travel." },
};

export function SessionToast() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const [key] of params.entries()) {
      if (!MESSAGES[key]) continue;

      toast.success(MESSAGES[key].title, { description: MESSAGES[key].description });
      params.delete(key);
      const search = params.toString();
      router.replace(search ? `?${search}` : window.location.pathname, {
        scroll: false,
      });
      break;
    }
  }, [router]);

  return null;
}