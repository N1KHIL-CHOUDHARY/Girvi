import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col justify-between gap-4 border-b border-[#E7E9EC] pb-5 sm:flex-row sm:items-center",
        className
      )}
    >
      <div className="space-y-1">
        {breadcrumbs && <div className="text-xs mb-1">{breadcrumbs}</div>}
        {eyebrow && (
          <span className="block text-[12px] font-medium text-[#8A94A3]">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-[#14181F]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#55606D] leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}

