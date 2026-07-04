import { cn } from "@/lib/utils";

type BadgeTone = "success" | "danger" | "warning" | "neutral" | "info";

const TONE_STYLES: Record<BadgeTone, string> = {
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-700",
  neutral: "bg-slate-100 text-slate-600",
  info: "bg-blue-50 text-blue-700",
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_STYLES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Maps common status strings to a tone automatically. */
export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone: BadgeTone =
    normalized === "active"
      ? "success"
      : normalized === "overdue" || normalized === "inactive"
      ? "danger"
      : normalized === "closed"
      ? "neutral"
      : "info";

  return <Badge tone={tone}>{status}</Badge>;
}