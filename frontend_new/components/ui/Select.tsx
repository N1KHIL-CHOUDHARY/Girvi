import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean | string;
  helpText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, helpText, children, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={cn(
              "h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white pl-3.5 pr-10 text-sm text-[var(--color-text-primary)] transition-all",
              "appearance-none cursor-pointer",
              "focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]",
              "disabled:cursor-not-allowed disabled:bg-[var(--color-bg-muted)] disabled:text-[var(--color-text-muted)]",
              error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)]">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && typeof error === "string" && (
          <p className="mt-1 text-xs font-medium text-[var(--color-danger-text)]">
            {error}
          </p>
        )}
        {!error && helpText && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
