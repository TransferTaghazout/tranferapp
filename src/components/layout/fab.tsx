"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

export function Fab() {
  const pathname = usePathname();
  if (pathname.startsWith("/reservations/new") || pathname.endsWith("/edit") || pathname.startsWith("/drive/")) {
    return null;
  }

  return (
    <Link
      href="/reservations/new"
      className="fixed right-4 bottom-24 z-40 flex h-16 items-center gap-2 rounded-full bg-primary px-5 text-primary-foreground shadow-[0_12px_30px_rgba(12,61,46,0.35)] md:right-8 md:bottom-8"
    >
      <Plus className="h-6 w-6" />
      <span className="pr-1 text-sm font-bold">Add reservation</span>
    </Link>
  );
}
