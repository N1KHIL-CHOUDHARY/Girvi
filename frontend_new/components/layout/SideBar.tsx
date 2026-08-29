"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Ticket,
  CreditCard,
  BarChart3,
  Settings,
  UserCog,
  User,
  LogOut,
  Package,
  ArrowLeftRight,
  TrendingUp,
  Bell,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout, setStoredToken } from "@/services/api";

interface NavGroup {
  group: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    badge?: string | number;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Loans", href: "/pawn-tickets", icon: Ticket },
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Inventory", href: "/inventory", icon: Package },
      { label: "Payments", href: "/payments", icon: CreditCard },
      { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
    ],
  },
  {
    group: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Analytics", href: "/analytics", icon: TrendingUp },
    ],
  },
  {
    group: "Management",
    items: [
      { label: "Employees", href: "/employees", icon: UserCog },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Profile", href: "/profile", icon: User },
      { label: "Help & Docs", href: "/help", icon: HelpCircle },
    ],
  },
];

export function Sidebar({
  mobile = false,
  onClose,
}: {
  mobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
    } finally {
      setStoredToken(null);
      if (onClose) onClose();
      router.push("/login");
    }
  };

  const content = (
    <div className="flex h-full flex-col justify-between bg-white text-[#14181F]">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-[#E7E9EC]">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <div className="h-7 w-7 rounded-md bg-[#314259] flex items-center justify-center text-white shrink-0">
              <Ticket className="h-3.5 w-3.5 rotate-12" strokeWidth={2} />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-[#14181F]">
              GRIVI
            </span>
          </Link>
        </div>


        {/* Navigation Sections */}
        <div className="px-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {NAV_GROUPS.map((group) => (
            <div key={group.group} className="space-y-1">
              <span className="px-2.5 text-[10px] font-semibold text-[#8A94A3] uppercase tracking-wider block mb-1">
                {group.group}
              </span>
              {group.items.map(({ label, href, icon: Icon, badge }) => {
                const active =
                  pathname === href ||
                  (href !== "/dashboard" && pathname?.startsWith(href));

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors cursor-pointer",
                      active
                        ? "bg-[#14181F] text-white"
                        : "text-[#55606D] hover:bg-[#F6F7F8] hover:text-[#14181F]"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-white" : "text-[#8A94A3]"
                        )}
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{label}</span>
                    </div>
                    {badge && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[#F6F7F8] text-[#55606D]"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="border-t border-[#E7E9EC] p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#55606D] hover:bg-[#F6F7F8] hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-[#8A94A3]" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  );

  if (mobile) {
    return <aside className="w-64 h-full bg-white">{content}</aside>;
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-[#E7E9EC] bg-white md:flex">
      {content}
    </aside>
  );
}