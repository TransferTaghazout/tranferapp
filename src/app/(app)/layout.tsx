import { AppShell } from "@/components/layout/app-shell";
import { loadWorkspace } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");
  if (session.role === "driver") redirect("/driver");

  const workspace = await loadWorkspace();
  return <AppShell businessName={workspace.settings.businessName}>{children}</AppShell>;
}
