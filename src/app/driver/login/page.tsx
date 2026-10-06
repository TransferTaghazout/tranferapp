import { driverLoginAction } from "@/app/actions/driver-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DriverLoginPage({
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
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-end px-5 pb-10 pt-16">
        <div className="mb-10 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Driver</p>
          <h1 className="mt-3 font-display text-5xl leading-none">My jobs</h1>
          <p className="mt-4 max-w-xs text-white/80">
            Today, tomorrow and every assigned job — plus the commission we will pay you.
          </p>
        </div>
        <form
          action={async (formData) => {
            "use server";
            const result = await driverLoginAction(undefined, formData);
            if (result?.error) {
              redirect(`/driver/login?error=${encodeURIComponent(result.error)}`);
            }
          }}
          className="rounded-[1.8rem] bg-card p-6 shadow-2xl"
        >
          {params.error ? (
            <p className="mb-4 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{params.error}</p>
          ) : null}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="login">Phone or email</Label>
              <Input id="login" name="login" required placeholder="Phone or email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Sign in
            </Button>
            <Link href="/login" className="text-center text-sm font-semibold text-muted-foreground">
              Admin login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
