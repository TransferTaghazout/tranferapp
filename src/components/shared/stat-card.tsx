import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "sand" | "ocean" | "forest";
}) {
  return (
    <Card
      className={cn(
        tone === "sand" && "bg-[#f3e6cf]",
        tone === "ocean" && "bg-[#e7f3f8]",
        tone === "forest" && "bg-primary text-primary-foreground",
      )}
    >
      <CardContent className="p-4">
        <p className={cn("text-xs font-semibold uppercase tracking-wider", tone === "forest" ? "text-white/70" : "text-muted-foreground")}>
          {label}
        </p>
        <p className="mt-1 font-display text-3xl leading-none">{value}</p>
        {hint ? <p className="mt-2 text-xs opacity-70">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
