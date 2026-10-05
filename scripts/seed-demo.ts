import { config } from "dotenv";
import { seedDemoData } from "../src/lib/db";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const result = await seedDemoData();
  console.log(result.message);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Seeding failed.");
  process.exit(1);
});
