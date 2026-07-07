"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  className?: string;
  customLabels?: Record<string, string>;
}

export function Breadcrumbs({ className, customLabels = {} }: BreadcrumbsProps) {
  const pathname = usePathname();
  if (!pathname || pathname === "/" || pathname === "/dashboard") return null;

  const segments = pathname.split("/").filter(Boolean);

  const getLabel = (segment: string) => {
    if (customLabels[segment]) return customLabels[segment];
    
    // Check if it looks like a UUID or ID (e.g. for detail pages)
    const isId =
      segment.length > 20 ||
      /^[0-9a-fA-F-]{8,36}$/.test(segment) ||
      !isNaN(Number(segment));
      
    if (isId) {
      return "Detail";
    }

    // Capitalize and replace hyphens/underscores
    return segment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1.5 text-xs text-[var(--color-text-muted)] font-medium", className)}>
      <Link
        href="/dashboard"
        className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const label = getLabel(segment);

        return (
          <div key={href} className="flex items-center space-x-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-[var(--color-text-placeholder)] shrink-0" />
            {isLast ? (
              <span className="text-[var(--color-text-primary)] font-semibold truncate max-w-[120px] md:max-w-none" aria-current="page">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-[var(--color-text-primary)] transition-colors truncate max-w-[120px] md:max-w-none"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
export default Breadcrumbs;
