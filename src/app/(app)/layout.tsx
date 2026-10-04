import { AppShell } from "@/components/layout/app-shell";
import { loadWorkspace } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const workspace = await loadWorkspace();
  return <AppShell businessName={workspace.settings.businessName}>{children}</AppShell>;
}
