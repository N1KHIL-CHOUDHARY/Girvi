import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  emerald: { bg: "bg-[#ECFDF5]", text: "text-[#059669]", icon: "text-[#059669]" },
  blue: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", icon: "text-[#2563EB]" },
  navy: { bg: "bg-[#F6F7F8]", text: "text-[#314259]", icon: "text-[#314259]" },
  violet: { bg: "bg-[#F6F7F8]", text: "text-[#14181F]", icon: "text-[#314259]" },
  rose: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", icon: "text-[#DC2626]" },
};

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[#E7E9EC] bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="h-4 w-24 rounded bg-[#F6F7F8]" />
        <div className="h-8 w-8 rounded-lg bg-[#F6F7F8]" />
      </div>
      <div className="mt-3 h-7 w-32 rounded bg-[#F6F7F8]" />
      <div className="mt-2 h-3.5 w-20 rounded bg-[#F6F7F8]" />
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaDirection = "up",
  subtitle,
  icon: Icon,
  tone = "navy",
  isLoading = false,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  subtitle?: string;
  icon?: LucideIcon;
  tone?: "emerald" | "blue" | "navy" | "violet" | "rose";
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <StatCardSkeleton />;
  }

  const toneConfig = TONE_STYLES[tone] || TONE_STYLES.navy;

  return (
    <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#8A94A3]">{label}</span>
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6F7F8]",
              toneConfig.icon
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>
        )}
      </div>

      <p className="mt-2 text-2xl font-semibold font-mono text-[#14181F] tracking-tight">
        {value}
      </p>

      {(delta || subtitle) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[12px]">
          {delta && (
            <span
              className={cn(
                "font-semibold",
                deltaDirection === "up" ? "text-[#059669]" : "text-[#DC2626]"
              )}
            >
              {deltaDirection === "up" ? "↑ " : "↓ "}
              {delta}
            </span>
          )}
          {subtitle && <span className="text-[#8A94A3]">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

