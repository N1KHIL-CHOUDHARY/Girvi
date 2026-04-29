// Input component extends from shadcnui - https://ui.shadcn.com/docs/components/input
"use client";
import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
      <input
        type={type}
        className={cn(
          'w-full min-h-[44px] rounded-2xl border-none bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition',
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";

export { Input };
