import { cn } from "@/lib/utils";

export type BadgeTone = "success" | "danger" | "warning" | "neutral" | "info";

const TONE_STYLES: Record<BadgeTone, string> = {
  success: "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]/60",
  danger: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]/60",
  warning: "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]/60",
  info: "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]/60",
  neutral: "bg-[#F6F7F8] text-[#55606D] border border-[#E7E9EC]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight",
        TONE_STYLES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Maps common status strings to a functional tone automatically with text label */
export function StatusBadge({ status }: { status: string }) {
  const normalized = (status || "").toLowerCase();
  
  let tone: BadgeTone = "neutral";
  if (normalized === "active" || normalized === "verified" || normalized === "settled" || normalized === "completed" || normalized === "paid") {
    tone = "success";
  } else if (normalized === "overdue" || normalized === "defaulted" || normalized === "inactive" || normalized === "rejected") {
    tone = "danger";
  } else if (normalized === "pending" || normalized === "due soon" || normalized === "pending docs" || normalized === "held") {
    tone = "warning";
  } else if (normalized === "restricted" || normalized === "auditor" || normalized === "info") {
    tone = "info";
  }

  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

  return <Badge tone={tone}>{label}</Badge>;
}