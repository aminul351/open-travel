import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLE_DASHBOARD_PATH, type Role } from "@/lib/constants";

export default async function DashboardIndexPage() {
  const session = await auth();
  const role = (session?.user?.role as Role | undefined) ?? "CUSTOMER";
  redirect(ROLE_DASHBOARD_PATH[role] ?? "/login");
}