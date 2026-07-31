import { forwardRef, InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const inputVariants = cva(
  "w-full border bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
  {
    variants: {
      variant: {
        default: "border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900",
        error: "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600",
      },
      size: {
        sm: "h-9 rounded-lg px-3 text-xs",
        md: "h-11 rounded-xl px-3.5 text-sm",
        lg: "h-12 rounded-xl px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";