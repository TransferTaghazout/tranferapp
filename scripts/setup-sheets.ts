import { config } from "dotenv";
import { ensureSpreadsheetStructure } from "../src/lib/sheets/setup";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const result = await ensureSpreadsheetStructure();
  console.log("Spreadsheet ready:", result.title);
  if (result.created.length) {
    console.log("Created tabs:", result.created.join(", "));
  } else {
    console.log("All required tabs already exist.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Setup failed.");
  process.exit(1);
});
