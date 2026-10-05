import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { requireDriverSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const session = await requireDriverSession().catch(() => null);
  if (!session) {
    return children;
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-10 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Driver</p>
          <h1 className="font-display text-3xl">{session.name}</h1>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </header>
      {children}
    </div>
  );
}
