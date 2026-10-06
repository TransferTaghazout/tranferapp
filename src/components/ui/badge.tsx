import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-foreground",
        confirmed: "bg-emerald-100 text-emerald-800",
        pending: "bg-amber-100 text-amber-800",
        completed: "bg-emerald-100 text-emerald-800",
        cancelled: "bg-rose-100 text-rose-800",
        noshow: "bg-stone-200 text-stone-700",
        ontheway: "bg-sky-100 text-sky-800",
        paid: "bg-emerald-100 text-emerald-800",
        deposit: "bg-orange-100 text-orange-800",
        unpaid: "bg-rose-100 text-rose-800",
        refunded: "bg-stone-200 text-stone-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
