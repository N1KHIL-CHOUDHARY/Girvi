"use client";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="relative w-full group">
      <div className="relative overflow-hidden rounded-2xl bg-zinc-50 dark:bg-[#1A1A1A] border border-zinc-200/60 dark:border-white/[0.08] transition-all duration-300">
        <input
          type={type}
          className={cn(
            "w-full min-h-[48px] bg-transparent px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-all duration-300",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {/* Animated focus indicator */}
        <motion.div
          initial={false}
          animate={{
            opacity: isFocused ? 1 : 0,
            scaleX: isFocused ? 1 : 0.8
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 h-[2px] w-full bg-zinc-900 dark:bg-white origin-left"
        />
      </div>
    </div>
  );
});

Input.displayName = "Input";

export { Input };