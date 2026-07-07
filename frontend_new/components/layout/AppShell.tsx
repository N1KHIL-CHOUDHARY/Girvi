"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./SideBar";
import { Topbar } from "./TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define routes where the Dashboard shell layout should NOT be displayed
  const isPublicPage = 
    pathname === "/" || 
    pathname?.startsWith("/auth") || 
    pathname === "/not-found";

  if (isPublicPage) {
    return <div className="min-h-screen bg-[#F7F8FA]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Sidebar />
      <div className="md:pl-60">
        <Topbar />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}