import { ServiceForm } from "@/components/services/service-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateProfit, formatMoney } from "@/lib/money";
import { loadWorkspace } from "@/lib/data";

export default async function ServicesPage() {
  const { services } = await loadWorkspace();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand">Catalog</p>
        <h1 className="mt-1 font-display text-4xl">Services</h1>
        <p className="text-muted-foreground">
          Selecting a service on a reservation fills price and cost automatically.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Add a service</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm />
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-sand">{service.type}</p>
                  <h2 className="font-display text-2xl">{service.name}</h2>
                </div>
                <span className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase ${service.active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}>
                  {service.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <p>Price: {formatMoney(service.defaultPrice)}</p>
                <p>Cost: {formatMoney(service.defaultCost)}</p>
                <p className="font-semibold text-accent">
                  Profit: {formatMoney(calculateProfit(service.defaultPrice, service.defaultCost))}
                </p>
              </div>
              {service.description ? (
                <p className="mt-3 text-sm text-muted-foreground">{service.description}</p>
              ) : null}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold">Edit</summary>
                <div className="mt-3">
                  <ServiceForm service={service} />
                </div>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
