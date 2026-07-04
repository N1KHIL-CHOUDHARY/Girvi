import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  rose: "bg-rose-50 text-rose-600",
};

export function StatCardSkeleton({
  tone = "blue",
}: {
  tone?: keyof typeof TONE_STYLES;
}) {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "h-9 w-9 rounded-xl bg-slate-100",
            TONE_STYLES[tone].split(" ")[0]
          )}
        />
        <div className="h-4 w-16 rounded bg-slate-100" />
      </div>
      <div className="mt-4 h-4 w-24 rounded bg-slate-100" />
      <div className="mt-2 h-8 w-32 rounded bg-slate-100" />
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaDirection = "up",
  icon: Icon,
  tone = "blue",
  isLoading = false,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  icon: LucideIcon;
  tone?: keyof typeof TONE_STYLES;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <StatCardSkeleton tone={tone} />;
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            TONE_STYLES[tone]
          )}
        >
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
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}
