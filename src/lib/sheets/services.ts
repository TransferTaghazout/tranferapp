import { toMoney } from "@/lib/money";
import { generateId } from "@/lib/utils";
import { Service, ServiceType } from "@/lib/types";
import { ServiceInput } from "@/lib/validations";
import { cached, cacheClear } from "@/lib/sheets/cache";
import {
  appendValues,
  cell,
  getValues,
  SHEETS,
  updateValues,
} from "@/lib/sheets/client";
import { SERVICE_HEADERS } from "@/lib/sheets/columns";

function parseService(row: string[]): Service {
  return {
    id: cell(row, 0),
    name: cell(row, 1),
    type: (cell(row, 2) || "Other") as ServiceType,
    defaultPrice: toMoney(cell(row, 3)),
    defaultCost: toMoney(cell(row, 4)),
    description: cell(row, 5),
    active: cell(row, 6).toLowerCase() !== "false" && cell(row, 6) !== "0",
  };
}

function toRow(service: Service): (string | number)[] {
  return [
    service.id,
    service.name,
    service.type,
    service.defaultPrice,
    service.defaultCost,
    service.description,
    service.active ? "TRUE" : "FALSE",
  ];
}

async function readServiceRows() {
  const values = await getValues(SHEETS.services, "A:G");
  return values.slice(1).map((row, index) => ({
    rowNumber: index + 2,
    service: parseService(row.map(String)),
  }));
}

export async function getServices(): Promise<Service[]> {
  return cached("services:all", async () => {
    const rows = await readServiceRows();
    return rows
      .map((r) => r.service)
      .filter((s) => s.id)
      .sort((a, b) => a.name.localeCompare(b.name));
  });
}

export async function getActiveServices() {
  const services = await getServices();
  return services.filter((service) => service.active);
}

export async function getServiceById(id: string) {
  const services = await getServices();
  return services.find((item) => item.id === id) ?? null;
}

export async function createService(input: ServiceInput) {
  const service: Service = {
    id: input.id || generateId("SRV"),
    name: input.name,
    type: input.type,
    defaultPrice: toMoney(input.defaultPrice),
    defaultCost: toMoney(input.defaultCost),
    description: input.description || "",
    active: input.active ?? true,
  };
  await appendValues(SHEETS.services, [toRow(service)]);
  cacheClear("services");
  return service;
}

export async function updateService(id: string, input: ServiceInput) {
  const rows = await readServiceRows();
  const match = rows.find((row) => row.service.id === id);
  if (!match) throw new Error("Service not found.");
  const service: Service = {
    id,
    name: input.name,
    type: input.type,
    defaultPrice: toMoney(input.defaultPrice),
    defaultCost: toMoney(input.defaultCost),
    description: input.description || "",
    active: input.active ?? true,
  };
  await updateValues(SHEETS.services, `A${match.rowNumber}:G${match.rowNumber}`, [
    toRow(service),
  ]);
  cacheClear("services");
  return service;
}

export { SERVICE_HEADERS };
