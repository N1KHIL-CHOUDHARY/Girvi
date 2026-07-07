import { cn } from "@/lib/utils";

interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center gap-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-text-muted)] shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
