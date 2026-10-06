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
    <div className="min-h-dvh bg-[#f4efe4]">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-5 py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sand">Driver board</p>
            <h1 className="truncate font-display text-3xl leading-none">{session.name}</h1>
          </div>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="shrink-0 bg-white/15 text-white hover:bg-white/25"
            >
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-5 pb-16">{children}</main>
    </div>
  );
}
