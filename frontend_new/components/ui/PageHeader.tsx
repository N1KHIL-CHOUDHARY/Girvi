import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col justify-between gap-4 border-b border-[var(--color-border-light)] pb-5 sm:flex-row sm:items-center",
        className
      )}
    >
      <div className="space-y-1.5">
        {breadcrumbs && <div className="text-xs">{breadcrumbs}</div>}
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
