import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  rose: "bg-rose-50 text-rose-600",
};

export function StatCard({
  label,
  value,
  delta,
  deltaDirection = "up",
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  icon: LucideIcon;
  tone?: keyof typeof TONE_STYLES;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", TONE_STYLES[tone])}>
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </div>
        {delta && (
          <span
            className={cn(
              "text-xs font-medium",
              deltaDirection === "up" ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {deltaDirection === "up" ? "+" : "-"}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}