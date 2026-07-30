"use client";

import { Search, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/services/api";

interface UserProfileResponse {
  full_name: string;
  role: string;
  email: string;
}

export function Topbar({
  userName = "",
  userRole = "",
}: {
  userName?: string;
  userRole?: string;
}) {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await getProfile<UserProfileResponse>();
      return res.data;
    },
    retry: false,
  });

  const displayUserName = profile?.full_name ?? userName;
  const displayUserRole = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : userRole;

  const initials = displayUserName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
  const initials = userName
    ? userName
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur md:px-8">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search customers, tickets, loans..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A66] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A66]"
        />
      </div>

      <div className="flex items-center gap-4 pl-4">
        <button
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3A66] text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-[13px] font-medium text-slate-900">{displayUserName}</p>
            <p className="text-xs text-slate-400">{displayUserRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}