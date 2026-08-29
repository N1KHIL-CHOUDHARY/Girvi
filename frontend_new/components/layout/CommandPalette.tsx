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
  ArrowRight,
  Loader2,
  Package,
  ArrowLeftRight,
  TrendingUp,
  Bell,
  HelpCircle,
  User,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ReactNode;
  category: "navigation" | "customer" | "ticket" | "action";
}

const NAV_RESULTS: SearchResult[] = [
  { id: "nav-dashboard", label: "Overview", sublabel: "Shop operational stats & stream", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, category: "navigation" },
  { id: "nav-loans-new", label: "Create Pawn Ticket", sublabel: "New collateral pledge & loan", href: "/pawn-tickets/new", icon: <Plus className="h-4 w-4" />, category: "action" },
  { id: "nav-pawn-tickets", label: "Active Loans", sublabel: "Loan portfolio & tickets", href: "/pawn-tickets", icon: <Ticket className="h-4 w-4" />, category: "navigation" },
  { id: "nav-customers", label: "Customers", sublabel: "CRM directory & KYC files", href: "/customers", icon: <Users className="h-4 w-4" />, category: "navigation" },
  { id: "nav-customers-new", label: "New Customer", sublabel: "Onboard borrower profile", href: "/customers/new", icon: <Plus className="h-4 w-4" />, category: "action" },
  { id: "nav-inventory", label: "Collateral Vault", sublabel: "Gold, silver, diamonds & pledge assets", href: "/inventory", icon: <Package className="h-4 w-4" />, category: "navigation" },
  { id: "nav-payments", label: "Payments", sublabel: "Record repayments & receipt ledger", href: "/payments", icon: <CreditCard className="h-4 w-4" />, category: "navigation" },
  { id: "nav-transactions", label: "Transactions", sublabel: "Complete audit ledger", href: "/transactions", icon: <ArrowLeftRight className="h-4 w-4" />, category: "navigation" },
  { id: "nav-reports", label: "Reports", sublabel: "Financial statements & compliance", href: "/reports", icon: <BarChart3 className="h-4 w-4" />, category: "navigation" },
  { id: "nav-analytics", label: "Analytics", sublabel: "Risk matrix & capital velocity", href: "/analytics", icon: <TrendingUp className="h-4 w-4" />, category: "navigation" },
  { id: "nav-employees", label: "Employees", sublabel: "Staff access & role controls", href: "/employees", icon: <UserCog className="h-4 w-4" />, category: "navigation" },
  { id: "nav-notifications", label: "Notifications", sublabel: "Alerts & overdue warnings", href: "/notifications", icon: <Bell className="h-4 w-4" />, category: "navigation" },
  { id: "nav-settings", label: "Settings", sublabel: "Store configuration & loan rates", href: "/settings", icon: <Settings className="h-4 w-4" />, category: "navigation" },
  { id: "nav-profile", label: "Profile", sublabel: "Personal account & credentials", href: "/profile", icon: <User className="h-4 w-4" />, category: "navigation" },
  { id: "nav-help", label: "Help & Docs", sublabel: "Operational guides & hotkeys", href: "/help", icon: <HelpCircle className="h-4 w-4" />, category: "navigation" },
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
      return NAV_RESULTS.filter(
        (r) =>
          r.label.toLowerCase().includes(query.toLowerCase()) ||
          r.sublabel?.toLowerCase().includes(query.toLowerCase())
      );
    }

    const dynResults: SearchResult[] = (Array.isArray(globalResults) ? globalResults : []).map((res) => ({
      id: res.id,
      label: res.title,
      sublabel: res.subtitle,
      href: res.href,
      icon: res.type === "customer" ? <Users className="h-4 w-4" /> : <Ticket className="h-4 w-4" />,
      category: res.type as any,
    }));

    if (dynResults.length > 0) return dynResults;

    return NAV_RESULTS.filter(
      (r) =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.sublabel?.toLowerCase().includes(query.toLowerCase())
    );
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

  // Global shortcut cmd+k
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // toggle if already handled by topbar, or open
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, globalResults.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#14181F]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-lg rounded-2xl bg-white border border-[#E7E9EC] shadow-[0_8px_24px_rgba(20,24,31,0.08)] overflow-hidden anim-fade-up"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[#E7E9EC] px-4">
          <Search className="h-4 w-4 shrink-0 text-[#8A94A3]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, customers, loans, or collateral..."
            className="h-12 flex-1 bg-transparent text-sm text-[#14181F] placeholder:text-[#8A94A3] outline-none"
          />
          {isSearchLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-[#8A94A3]" />
          )}
          <button
            onClick={onClose}
            className="flex h-5 items-center rounded border border-[#E7E9EC] px-1.5 text-[10px] font-mono text-[#8A94A3] hover:text-[#14181F] cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto p-2">
          {finalResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8A94A3]">
              No records found for &quot;{query}&quot;
            </div>
          ) : (
            <ul role="listbox" className="space-y-0.5">
              {finalResults.map((result, index) => (
                <li key={result.id} role="option" aria-selected={index === selectedIndex}>
                  <button
                    type="button"
                    onClick={() => navigate(result.href)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer",
                      index === selectedIndex
                        ? "bg-[#14181F] text-white"
                        : "text-[#55606D] hover:bg-[#F6F7F8]"
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0",
                        index === selectedIndex ? "text-white" : "text-[#8A94A3]"
                      )}
                    >
                      {result.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs font-semibold truncate",
                          index === selectedIndex ? "text-white" : "text-[#14181F]"
                        )}
                      >
                        {result.label}
                      </p>
                      {result.sublabel && (
                        <p
                          className={cn(
                            "text-[11px] truncate",
                            index === selectedIndex
                              ? "text-white/70"
                              : "text-[#8A94A3]"
                          )}
                        >
                          {result.sublabel}
                        </p>
                      )}
                    </div>
                    {index === selectedIndex && (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/70" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-[#E7E9EC] bg-[#F6F7F8] px-4 py-2 text-[11px] text-[#8A94A3]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
          </div>
          <span>GIRVI Global Search</span>

        </div>
      </div>
    </div>
  );
}

