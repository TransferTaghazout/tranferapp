import { toMoney } from "@/lib/money";
import { generateId } from "@/lib/utils";
import { Service, ServiceType } from "@/lib/types";
import { ServiceInput } from "@/lib/validations";
import { query, queryOne } from "@/lib/db/client";

type ServiceRow = Record<string, unknown>;

function mapService(row: ServiceRow): Service {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    type: (String(row.type || "Other") as ServiceType),
    defaultPrice: toMoney(row.default_price),
    defaultCost: toMoney(row.default_cost),
    description: String(row.description || ""),
    active: Boolean(row.active),
  };
}

export async function getServices(): Promise<Service[]> {
  const rows = await query("SELECT * FROM services ORDER BY name");
  return rows.map(mapService);
}

export async function getActiveServices() {
  return (await getServices()).filter((service) => service.active);
}

export async function getServiceById(id: string) {
  const row = await queryOne("SELECT * FROM services WHERE id = $1", [id]);
  return row ? mapService(row) : null;
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
  await query(
    `INSERT INTO services (id, name, type, default_price, default_cost, description, active)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      service.id,
      service.name,
      service.type,
      service.defaultPrice,
      service.defaultCost,
      service.description,
      service.active,
    ],
  );
  return service;
}

export async function updateService(id: string, input: ServiceInput) {
  const service: Service = {
    id,
    name: input.name,
    type: input.type,
    defaultPrice: toMoney(input.defaultPrice),
    defaultCost: toMoney(input.defaultCost),
    description: input.description || "",
    active: input.active ?? true,
  };
  await query(
    `UPDATE services SET name=$2, type=$3, default_price=$4, default_cost=$5, description=$6, active=$7
     WHERE id=$1`,
    [
      id,
      service.name,
      service.type,
      service.defaultPrice,
      service.defaultCost,
      service.description,
      service.active,
    ],
  );
  return service;
}
