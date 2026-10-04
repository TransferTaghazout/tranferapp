import Link from "next/link";
import { sheetsStatus } from "@/lib/sheets";

export function ConnectionBanner() {
  const status = sheetsStatus();
  if (status.configured) return null;

  return (
    <div className="mb-5 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      Google Sheets is not connected yet. Add your environment variables, then open{" "}
      <Link href="/more" className="font-semibold underline">
        More
      </Link>{" "}
      to prepare the spreadsheet.
      {status.missing.length > 0 ? (
        <span className="mt-1 block text-amber-800">
          Missing: {status.missing.join(", ")}
        </span>
      ) : null}
    </div>
  );
}
