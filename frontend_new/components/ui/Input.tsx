import { forwardRef, InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const inputVariants = cva(
  "w-full border bg-white text-sm text-[#14181F] placeholder:text-[#8A94A3] transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-[#F6F7F8] disabled:text-[#8A94A3]",
  {
    variants: {
      variant: {
        default: "border-[#E7E9EC] focus:border-[#14181F] focus:ring-1 focus:ring-[#14181F]",
        error: "border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-600",
      },
      size: {
        sm: "h-9 rounded-lg px-3 text-xs",
        md: "h-10 rounded-xl px-3.5 text-sm",
        lg: "h-11 rounded-xl px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  error?: boolean | string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type = "text", error, helpText, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          type={type}
          className={cn(inputVariants({ variant: error ? "error" : variant, size, className }))}
          {...props}
        />
        {error && typeof error === "string" && (
          <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
        )}
        {!error && helpText && (
          <p className="mt-1 text-xs text-[#8A94A3]">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";