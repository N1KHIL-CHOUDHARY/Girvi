import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14181F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[#14181F] text-white hover:bg-[#314259] active:bg-[#233041] border border-transparent shadow-none",
        secondary:
          "border border-[#E7E9EC] bg-white text-[#14181F] hover:bg-[#F6F7F8] active:bg-[#E7E9EC]",
        ghost:
          "text-[#55606D] hover:bg-[#F6F7F8] hover:text-[#14181F] active:bg-[#E7E9EC]",
        danger:
          "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 focus-visible:ring-red-600",
        outline:
          "border border-[#E7E9EC] bg-transparent text-[#14181F] hover:bg-[#F6F7F8]",
      },
      size: {
        sm: "h-8 rounded-lg px-3 text-xs gap-1.5 font-medium",
        md: "h-10 rounded-lg px-4 text-sm gap-2 font-semibold",
        lg: "h-11 rounded-lg px-5 text-sm gap-2.5 font-semibold",
        icon: "h-9 w-9 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
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
        className={cn(buttonVariants({ variant, size, className }))}
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

