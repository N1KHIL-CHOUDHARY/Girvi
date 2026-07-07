import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-[var(--transition-fast)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          // Variants
          variant === "primary" && [
            "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
            "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
          ],
          variant === "secondary" && [
            "border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]",
            "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
          ],
          variant === "ghost" && [
            "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]",
            "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
          ],
          variant === "danger" && [
            "bg-[var(--color-danger)] text-white hover:bg-red-700",
            "focus-visible:ring-2 focus-visible:ring-[var(--color-danger)] focus-visible:ring-offset-2",
          ],
          // Sizes
          size === "sm" && "h-8 rounded-[var(--radius-sm)] px-3 text-xs gap-1.5",
          size === "md" && "h-10 rounded-[var(--radius-md)] px-4 text-sm gap-2",
          size === "lg" && "h-12 rounded-[var(--radius-lg)] px-6 text-sm gap-2.5",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
