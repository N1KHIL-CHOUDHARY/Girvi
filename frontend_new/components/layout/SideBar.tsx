"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Landmark,
  Gem,
  Ticket,
  CreditCard,
  BarChart3,
  Settings,
  ShieldCheck,
  UserCog,
  User,
  LogOut,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Pawn Tickets", href: "/pawn-tickets", icon: Ticket },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Employees", href: "/employees", icon: UserCog },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-100 bg-white px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A66]">
          <Wallet className="h-4 w-4 text-white" strokeWidth={2.2} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-slate-900">
          Pawn Manager
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-[#EEF2FB] text-[#1E3A66]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-100 pt-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        >
          <User className="h-[18px] w-[18px]" strokeWidth={2} />
          Profile
        </Link>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
          Logout
        </button>
      </div>
    </aside>
  );
}