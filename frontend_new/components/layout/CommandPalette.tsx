"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Ticket,
  CreditCard,
  LayoutDashboard,
  UserCog,
  BarChart3,
  Settings,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn, formatShortcutKey } from "@/lib/utils";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ReactNode;
  category: "navigation" | "customer" | "ticket";
}

const NAV_RESULTS: SearchResult[] = [
  { id: "nav-dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, category: "navigation" },
  { id: "nav-customers", label: "Customers", sublabel: "Manage client profiles", href: "/customers", icon: <Users className="h-4 w-4" />, category: "navigation" },
  { id: "nav-customers-new", label: "New Customer", sublabel: "Create a customer profile", href: "/customers/new", icon: <Users className="h-4 w-4" />, category: "navigation" },
  { id: "nav-pawn-tickets", label: "Pawn Tickets", sublabel: "Manage pledges", href: "/pawn-tickets", icon: <Ticket className="h-4 w-4" />, category: "navigation" },
  { id: "nav-tickets-new", label: "New Pawn Ticket", sublabel: "Create a pawn ticket", href: "/pawn-tickets/new", icon: <Ticket className="h-4 w-4" />, category: "navigation" },
  { id: "nav-payments", label: "Payments & Ledger", sublabel: "Track transactions", href: "/payments", icon: <CreditCard className="h-4 w-4" />, category: "navigation" },
  { id: "nav-employees", label: "Employees", sublabel: "Manage staff", href: "/employees", icon: <UserCog className="h-4 w-4" />, category: "navigation" },
  { id: "nav-reports", label: "Reports", sublabel: "Financial reports", href: "/reports", icon: <BarChart3 className="h-4 w-4" />, category: "navigation" },
  { id: "nav-settings", label: "Settings", sublabel: "Preferences", href: "/settings", icon: <Settings className="h-4 w-4" />, category: "navigation" },
];

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global search hook
  const { data: globalResults = [], isLoading: isSearchLoading } = useGlobalSearch(query);

  const getResultsList = (): SearchResult[] => {
    if (!query.trim()) {
      return NAV_RESULTS;
    }

    if (query.trim().length < 2) {
      // Filter nav items by sublabel/label locally first if < 2 chars
      return NAV_RESULTS.filter(
        (r) =>
          r.label.toLowerCase().includes(query.toLowerCase()) ||
          r.sublabel?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Wrap global results
    return globalResults.map((res) => ({
      id: res.id,
      label: res.title,
      sublabel: res.subtitle,
      href: res.href,
      icon: res.type === "customer" ? <Users className="h-4 w-4" /> : <Ticket className="h-4 w-4" />,
      category: res.type,
    }));
  };

  const finalResults = getResultsList();

  const navigate = useCallback(
    (href: string) => {
      onClose();
      setQuery("");
      setSelectedIndex(0);
      router.push(href);
    },
    [onClose, router]
  );

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, finalResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && finalResults[selectedIndex]) {
        e.preventDefault();
        navigate(finalResults[selectedIndex].href);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [finalResults, selectedIndex, navigate, onClose]
  );

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, globalResults.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-command-palette)] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-overlay"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-lg rounded-[var(--radius-xl)] bg-[var(--color-bg-card)] shadow-[var(--shadow-overlay)] overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4">
          <Search className="h-4.5 w-4.5 shrink-0 text-[var(--color-text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, customers, tickets..."
            className="h-12 flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] outline-none"
          />
          {isSearchLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
          )}
          <button
            onClick={onClose}
            className="flex h-6 items-center rounded border border-[var(--color-border)] px-1.5 text-[10px] font-medium text-[var(--color-text-muted)]"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto p-2">
          {finalResults.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <ul role="listbox">
              {finalResults.map((result, index) => (
                <li key={result.id} role="option" aria-selected={index === selectedIndex}>
                  <button
                    type="button"
                    onClick={() => navigate(result.href)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors",
                      index === selectedIndex
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]"
                    )}
                  >
                    <span className={cn(
                      "shrink-0",
                      index === selectedIndex ? "text-white/80" : "text-[var(--color-text-muted)]"
                    )}>
                      {result.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.label}</p>
                      {result.sublabel && (
                        <p className={cn(
                          "text-xs truncate",
                          index === selectedIndex ? "text-white/60" : "text-[var(--color-text-muted)]"
                        )}>
                          {result.sublabel}
                        </p>
                      )}
                    </div>
                    {index === selectedIndex && (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/60" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-[var(--color-border)] px-4 py-2 text-[11px] text-[var(--color-text-muted)]">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
