import { ensureSchema, friendlyDbError } from "@/lib/db/client";

export async function ConnectionBanner() {
  try {
    await ensureSchema();
    return null;
  } catch (error) {
    const message =
      error instanceof Error ? friendlyDbError(error) : "Database connection unavailable.";
    return (
      <div className="mb-5 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        {message}
        <span className="mt-2 block text-amber-800">
          F EasyPanel Postgres → copy <strong>External</strong> host (IP) w port.
          Environment dyal app:{" "}
          <code className="font-semibold">DATABASE_URL=postgres://ahmad:ahmad123@IP:PORT/transferapp?sslmode=disable</code>
        </span>
      </div>
    );
  }
}
