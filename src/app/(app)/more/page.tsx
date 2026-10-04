import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { SetupActions } from "@/components/setup/setup-actions";
import { ConnectionBanner } from "@/components/setup/connection-banner";
import { Button } from "@/components/ui/button";
import { loadWorkspace } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { SettingsForm } from "@/app/(app)/more/settings-form";

export default async function MorePage() {
  const { settings } = await loadWorkspace();
  const session = await getSession();

  return (
    <div className="space-y-6">
      <ConnectionBanner />
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">More</p>
        <h1 className="mt-1 font-display text-4xl">Workspace</h1>
        <p className="text-muted-foreground">{session?.email}</p>
      </header>

      <div className="grid gap-3">
        <MoreLink href="/services" title="Services" text="Prices, costs and catalog" />
        <MoreLink href="/customers" title="Customers" text="Repeat guests and history" />
        <MoreLink href="/search" title="Search" text="Find a guest or booking instantly" />
        <MoreLink href="/finance" title="Finance" text="Revenue, cost and profit" />
      </div>

      <section className="rounded-[1.5rem] border bg-card p-5">
        <h2 className="font-display text-3xl">Business settings</h2>
        <SettingsForm settings={settings} />
      </section>

      <section className="rounded-[1.5rem] border bg-card p-5">
        <h2 className="font-display text-3xl">Google Sheets</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Prepare the Tourism Reservation Manager tabs or load clearly marked DEMO bookings.
        </p>
        <div className="mt-4">
          <SetupActions />
        </div>
      </section>

      <form action={logoutAction}>
        <Button type="submit" variant="outline" className="w-full">
          Sign out
        </Button>
      </form>
    </div>
  );
}

function MoreLink({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link href={href} className="rounded-[1.3rem] border bg-card px-5 py-4">
      <p className="font-display text-2xl">{title}</p>
      <p className="text-sm text-muted-foreground">{text}</p>
    </Link>
  );
}

