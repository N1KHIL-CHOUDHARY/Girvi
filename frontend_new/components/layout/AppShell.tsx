"use client";

import React, { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "./SideBar";
import { Topbar } from "./TopBar";
import { getProfile } from "@/services/api";

interface UserProfile {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    language: string;
  };
}

const AppShellContext = createContext(false);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInside = useContext(AppShellContext);

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await getProfile<UserProfile>();
      return res.data;
    },
    retry: false,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("auth_token"),
  });

  if (isInside) {
    return <>{children}</>;
  }

  const isPublicPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/not-found";

  if (isPublicPage) {
    return <div className="min-h-screen bg-[#F7F8FA]">{children}</div>;
  }

  const userName = profileData?.user?.full_name ?? "";
  const userRole = profileData?.user?.role ?? "";

  return (
    <AppShellContext.Provider value={true}>
      <div className="min-h-screen bg-[#F7F8FA]">
        <Sidebar />
        <div className="md:pl-60">
          <Topbar userName={userName} userRole={userRole} />
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}