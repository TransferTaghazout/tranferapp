import { BottomNav } from "@/components/layout/bottom-nav";
import { Fab } from "@/components/layout/fab";
import { SideNav } from "@/components/layout/side-nav";

export function AppShell({
  children,
  businessName,
}: {
  children: React.ReactNode;
  businessName: string;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1400px]">
      <SideNav businessName={businessName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 pb-32 pt-5 md:px-8 md:pb-16 md:pt-8">{children}</main>
        <BottomNav />
        <Fab />
      </div>
    </div>
  );
}
