import { ConnectionBanner } from "@/components/setup/connection-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadWorkspace } from "@/lib/data";
import { DriverForm } from "@/app/(app)/drivers/driver-form";

export default async function DriversPage() {
  const { drivers } = await loadWorkspace();

  return (
    <div className="space-y-6">
      <ConnectionBanner />
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Team</p>
        <h1 className="mt-1 font-display text-4xl">Drivers</h1>
        <p className="text-muted-foreground">
          Smiya, telephone, email. Nta katsift lihom lkedma, howa kaychouf ghi taman service.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Add driver</CardTitle>
        </CardHeader>
        <CardContent>
          <DriverForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {drivers.map((driver) => (
          <Card key={driver.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl">{driver.name}</h2>
                  <p className="text-sm text-muted-foreground">{driver.phone}</p>
                  <p className="text-sm text-muted-foreground">{driver.email || "—"}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase ${
                    driver.active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {driver.active ? "Active" : "Off"}
                </span>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold">Edit</summary>
                <div className="mt-3">
                  <DriverForm driver={driver} />
                </div>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
