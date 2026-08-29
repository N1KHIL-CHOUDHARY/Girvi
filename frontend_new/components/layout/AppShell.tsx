"use client";

import React, { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "./SideBar";
import { Topbar } from "./TopBar";
import { getProfile } from "@/services/api";
import { X } from "lucide-react";

interface UserProfile {
  user?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    language: string;
  };
  full_name?: string;
  role?: string;
}

const AppShellContext = createContext(false);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInside = useContext(AppShellContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await getProfile<UserProfile>();
      return res.data;
    },
    retry: false,
  });

  if (isInside) {
    return <>{children}</>;
  }

  const isPublicPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/onboarding" ||
    pathname === "/not-found";

  if (isPublicPage) {
    return <div className="min-h-screen bg-[#F6F7F8]">{children}</div>;
  }

  const userName =
    profileData?.user?.full_name || profileData?.full_name || "Store Manager";
  const userRole = profileData?.user?.role || profileData?.role || "Manager";

  return (
    <AppShellContext.Provider value={true}>
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-[#14181F]/40 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-white shadow-xl z-10 anim-fade-up">
              <Sidebar mobile={true} onClose={() => setMobileNavOpen(false)} />
              <button
                onClick={() => setMobileNavOpen(false)}
                className="absolute right-3 top-3 p-1 text-[#8A94A3] hover:text-[#14181F]"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="md:pl-56 flex flex-col flex-1">
          <Topbar
            userName={userName}
            userRole={userRole}
            onToggleMobileNav={() => setMobileNavOpen(true)}
          />
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}