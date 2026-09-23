import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { SessionToast } from "@/components/session-toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SessionToast />
      <DashboardNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}