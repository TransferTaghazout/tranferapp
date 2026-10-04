"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CircleDollarSign,
  Compass,
  ListTodo,
  Search,
  Settings2,
  Sun,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/reservations", label: "Reservations", icon: ListTodo },
  { href: "/finance", label: "Finance", icon: CircleDollarSign },
  { href: "/services", label: "Services", icon: Compass },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/search", label: "Search", icon: Search },
  { href: "/more", label: "More", icon: Settings2 },
];

export function SideNav({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-border bg-primary px-5 py-8 text-primary-foreground md:flex md:flex-col">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Operations</p>
        <h1 className="mt-2 font-display text-3xl leading-none">{businessName}</h1>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl bg-white/10 p-4 text-sm text-white/80">
        <Wallet className="mb-2 h-4 w-4" />
        Field-ready booking desk for transfers, activities and tours.
      </div>
    </aside>
  );
}
