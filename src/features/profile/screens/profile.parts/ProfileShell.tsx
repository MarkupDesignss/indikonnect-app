"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import Header from "@/components/common/Header";
import { DashboardSidebar } from "./DashboardSidebar";
import type { DashboardSidebarProps } from "./support";

type ProfileShellProps = Omit<DashboardSidebarProps, "isMobileOpen" | "onMobileToggle"> & {
  children: ReactNode;
  isSidebarOpen: boolean;
  onMobileToggle: () => void;
};

export function ProfileShell({ children, userData, stats, accountType, activeTab, onTabChange: handleTabChange, onLogout: handleLogout, isLoggingOut, isSidebarOpen, onMobileToggle }: ProfileShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F1] font-sans text-[#171717]">
      {/* SIDEBAR */}
      <DashboardSidebar
        userData={userData}
        stats={stats}
        accountType={accountType}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        isMobileOpen={isSidebarOpen}
        onMobileToggle={onMobileToggle}
      />

      {/* RIGHT SIDE: HEADER + MAIN */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <div
          className="
            relative z-[100] shrink-0
            bg-white
            shadow-[0_2px_12px_-10px_rgba(0,0,0,0.3)]
            [&_header]:!static
            [&_header]:!inset-auto
            [&_header]:!w-full
            [&_header]:!max-w-full
            [&_.premium-header-spacer]:!hidden
            [&_.premium-mobile-menu]:!hidden
          "
        >
          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            aria-label="Open account menu"
            aria-expanded={isSidebarOpen}
            onClick={onMobileToggle}
            className="
              absolute
              left-16
              top-1/2
              z-[130]
              flex
              h-9
              w-9
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-[#E3E4DE]
              bg-white
              text-[#1B1B1B]
              shadow-[0_6px_18px_-12px_rgba(0,0,0,0.35)]
              transition-all
              active:scale-95
              lg:hidden
            "
          >
            <Menu className="h-[19px] w-[19px]" />
          </button>

          <Header
            hideAnnouncement={true}
            hideMenu={true}
            showSidebarMenu={false}
          />
        </div>

        {/* ONLY MAIN CONTENT SCROLLS */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#F4F5F1]">
          {children}
        </main>
      </div>
    </div>
  );
}
