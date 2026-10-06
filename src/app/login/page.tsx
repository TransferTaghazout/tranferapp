import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession().catch(() => null);
  if (session?.role === "driver") redirect("/driver");
  if (session?.role === "admin") redirect("/");
  const params = await searchParams;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#0c3d2e_0%,#163c33_45%,#c4a574_100%)]" />
      <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-end px-5 pb-10 pt-16">
        <div className="mb-10 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Tourism operations</p>
          <h1 className="mt-3 font-display text-5xl leading-none">Atlas Coast Travel</h1>
          <p className="mt-4 max-w-xs text-white/80">
            Reservations, transfers and daily finance — designed for the field.
          </p>
        </div>
        <form action={loginAction} className="rounded-[1.8rem] bg-card p-6 shadow-2xl">
          {params.error ? (
            <p className="mb-4 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {params.error}
            </p>
          ) : null}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Login</Label>
              <Input
                id="email"
                name="email"
                required
                autoComplete="username"
                placeholder="ahmadabidar"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" size="lg" className="mt-2 w-full">
              Enter dashboard
            </Button>
            <a href="/driver/login" className="text-center text-sm font-semibold text-muted-foreground">
            Driver login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
