import Link from "next/link";
import { dbStatus } from "@/lib/db/client";

export function ConnectionBanner() {
  const status = dbStatus();
  if (status.configured) return null;

  return (
    <div className="mb-5 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      Database ma connectatch. Zid{" "}
      <code className="font-semibold">DATABASE_URL</code> f environment.
      {status.missing.length > 0 ? (
        <span className="mt-1 block text-amber-800">
          Missing: {status.missing.join(", ")}
        </span>
      ) : null}{" "}
      <Link href="/more" className="font-semibold underline">
        More
      </Link>
    </div>
  );
}
