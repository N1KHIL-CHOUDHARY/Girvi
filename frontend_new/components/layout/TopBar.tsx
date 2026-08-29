"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Bell, Menu, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/services/api";
import { CommandPalette } from "./CommandPalette";
import { RecordPaymentModal } from "../ui/RecordPaymentModal";

interface UserProfileResponse {
  user?: {
    full_name?: string;
    role?: string;
    email?: string;
    shop?: {
      name?: string;
    };
  };
  full_name?: string;
  role?: string;
  email?: string;
}

export function Topbar({
  userName = "",
  userRole = "",
  onToggleMobileNav,
}: {
  userName?: string;
  userRole?: string;
  onToggleMobileNav?: () => void;
}) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await getProfile<UserProfileResponse>();
      return res.data;
    },
    retry: false,
  });

  const displayUserName =
    profileData?.user?.full_name || profileData?.full_name || userName || "Store Manager";
  const displayUserRole =
    profileData?.user?.role || profileData?.role || userRole || "Manager";


  const initials =
    displayUserName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PM";

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#E7E9EC] bg-white px-4 md:px-6">
        {/* Left: Mobile Menu Toggle & Search Bar Trigger */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {onToggleMobileNav && (
            <button
              onClick={onToggleMobileNav}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-[#55606D] hover:bg-[#F6F7F8]"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex h-9 w-full items-center justify-between rounded-lg border border-[#E7E9EC] bg-[#F6F7F8] px-3 text-xs text-[#8A94A3] hover:border-[#8A94A3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[#8A94A3]" />
              <span className="truncate">Search customers, loans, vault...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[#E7E9EC] bg-white px-1.5 py-0.5 text-[10px] font-mono text-[#55606D]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Action, Notifications, User */}
        <div className="flex items-center gap-2.5 sm:gap-3 pl-3">
          <Link
            href="/pawn-tickets/new"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#14181F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#314259] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Ticket</span>
          </Link>

          <button
            type="button"
            onClick={() => setPaymentModalOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-[#E7E9EC] bg-white px-3 py-1.5 text-xs font-semibold text-[#14181F] hover:bg-[#F6F7F8] transition-colors cursor-pointer"
          >
            <span>Record Payment</span>
          </button>

          {/* Notifications Link */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#55606D] hover:bg-[#F6F7F8] hover:text-[#14181F] transition-colors"
          >
            <Bell className="h-4 w-4" strokeWidth={1.75} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#D97706]" />
          </Link>

          {/* User / Profile link */}
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-[#F6F7F8] transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14181F] text-[11px] font-semibold text-white">
              {initials}
            </div>
            <div className="hidden lg:block leading-tight text-left">
              <p className="text-[13px] font-medium text-[#14181F] truncate max-w-[120px]">
                {displayUserName}
              </p>
              <p className="text-[10px] text-[#8A94A3] capitalize">
                {displayUserRole}
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Global Quick Record Payment Modal */}
      <RecordPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />
    </>
  );
}