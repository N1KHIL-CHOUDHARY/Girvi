import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E7E9EC] bg-white py-14 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F6F7F8] text-[#314259]">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#14181F]">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-[#55606D] leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

