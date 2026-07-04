import { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-medium text-slate-500", className)}
      {...props}
    >
      {children}
    </label>
  );
}