"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Coins, Heart, LogOut, X, ShoppingBag, LayoutDashboard, ClipboardList, MapPin, Settings as SettingsIcon, LifeBuoy, FileText, Lightbulb } from "lucide-react";
import { DashboardSidebarProps, TabType, getInitials } from "@/features/profile/screens/profile.parts/support";


export function DashboardSidebar({
  userData,
  stats,
  accountType,
  activeTab,
  onTabChange,
  onLogout,
  isLoggingOut,
  isMobileOpen = false,
  onMobileToggle,
}: DashboardSidebarProps) {
  const isDistributor = accountType === "distributor";

  const menuItems = useMemo(() => {
    const items = [
      {
        label: "Overview",
        tab: "overview" as TabType,
        icon: LayoutDashboard,
        count: null,
      },
      {
        label: "My Orders",
        tab: "orders" as TabType,
        icon: ClipboardList,
        count: stats?.total_orders || 0,
      },
      {
        label: "Wishlist",
        tab: "wishlist" as TabType,
        icon: Heart,
        count: stats?.wishlist || 0,
      },
      {
        label: "Manage Address",
        tab: "address" as TabType,
        icon: MapPin,
        count: null,
      },
    ];

    if (isDistributor) {
      items.push({
        label: "Earnings",
        tab: "earning" as TabType,
        icon: Coins,
        count: null,
      });
    }

    items.push({
      label: "Help & Support",
      tab: "help" as TabType,
      icon: LifeBuoy,
      count: null,
    });

    items.push({
      label: "Refund Policy",
      tab: "refund" as TabType,
      icon: FileText,
      count: null,
    });

    items.push({
      label: "Suggestions",
      tab: "suggestions" as TabType,
      icon: Lightbulb,
      count: null,
    });

    return items;
  }, [stats, isDistributor]);

  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);

    if (onMobileToggle) {
      onMobileToggle();
    }
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[145] bg-black/40 backdrop-blur-[3px] lg:hidden"
            onClick={onMobileToggle}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[160]
          h-screen
          w-[300px]
          max-w-[88vw]
          overflow-hidden
          border-r border-[#E7E8E2]
          bg-[#FBFBF8]
          shadow-[12px_0_45px_-25px_rgba(0,0,0,0.22)]
          transition-transform duration-300

          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}

          lg:sticky
          lg:top-0
          lg:z-auto
          lg:h-screen
          lg:w-[272px]
          lg:max-w-none
          lg:flex-shrink-0
          lg:translate-x-0
          lg:shadow-none
        `}
      >
        <div className="flex h-screen min-h-0 flex-col px-4 py-5">
          {/* MOBILE CLOSE */}
          <div className="mb-4 flex shrink-0 items-center justify-end lg:hidden">
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={onMobileToggle}
              className="
                flex h-9 w-9 items-center justify-center
                rounded-full
                border border-[#E4E5DF]
                bg-white
                text-[#666862]
                shadow-[0_8px_20px_-12px_rgba(0,0,0,0.35)]
                transition-all duration-200
                hover:bg-[#F4F5F1]
                hover:text-[#1B1B1A]
                active:scale-95
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* PROFILE CARD */}
          <button
            type="button"
            onClick={() => handleTabClick("settings")}
            className="
              shrink-0
              flex items-center gap-3
              rounded-[16px]
              border border-[#E8E8E4]
              bg-white
              px-3.5 py-3
              text-left
              shadow-[0_6px_20px_-18px_rgba(0,0,0,0.25)]
              transition
              hover:border-[#D8D8D2]
              hover:shadow-sm
            "
          >
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                overflow-hidden
                rounded-[11px]
                text-[11px]
                font-bold
                text-white
              "
              style={{
                background:
                  "linear-gradient(145deg, #274430 0%, #16281C 100%)",
              }}
            >
              {userData?.profile_image ? (
                <img
                  src={userData.profile_image}
                  alt={userData?.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(userData?.name)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-[#171717]">
                {userData?.name || "Guest User"}
              </p>

              <p className="mt-0.5 truncate text-[9px] text-[#92928C]">
                {isDistributor ? "Verified Distributor" : "Customer"}
              </p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-[#AEAEA7]" />
          </button>

          {/* ACCOUNT SECTION */}
          <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
            <p className="px-3 text-[8px] font-bold uppercase tracking-[0.18em] text-[#9EA099]">
              Account
            </p>

            <nav className="mt-2.5 space-y-[2px]">
              {menuItems.map((item) => {
                const active = activeTab === item.tab;
                const Icon = item.icon;

                return (
                  <button
                    key={item.tab}
                    type="button"
                    onClick={() => handleTabClick(item.tab)}
                    className={`
                      group relative flex w-full
                      items-center justify-between
                      rounded-[12px]
                      px-3.5 py-[9px]
                      text-left
                      transition-all duration-200

                      ${active
                        ? "text-white shadow-[0_8px_20px_-13px_rgba(22,40,28,0.85)]"
                        : "text-[#62635E] hover:bg-[#F0F1EC]"
                      }
                    `}
                    style={
                      active
                        ? {
                          background:
                            "linear-gradient(135deg, #203B28 0%, #16281C 100%)",
                        }
                        : undefined
                    }
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-white/90" />
                    )}

                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`
                          flex h-8 w-8 shrink-0
                          items-center justify-center
                          rounded-[9px]
                          transition-all

                          ${active
                            ? "bg-white/10 text-white"
                            : "bg-white text-[#898A84] shadow-[0_3px_11px_-8px_rgba(0,0,0,0.45)]"
                          }
                        `}
                      >
                        <Icon className="h-[15px] w-[15px]" />
                      </span>

                      <span className="truncate text-[12px] font-semibold tracking-[-0.01em]">
                        {item.label}
                      </span>
                    </span>

                    {item.count !== null && (
                      <span
                        className={`
                          min-w-[24px]
                          shrink-0
                          rounded-full
                          px-1.5 py-[3px]
                          text-center
                          text-[8px]
                          font-bold

                          ${active
                            ? "bg-white/15 text-white"
                            : "bg-[#EFF0EB] text-[#7B7D76]"
                          }
                        `}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* PREFERENCES */}
            <div className="mt-3 border-t border-[#E7E7E1] pt-3">
              <p className="px-3 text-[8px] font-bold uppercase tracking-[0.18em] text-[#9EA099]">
                Preferences
              </p>

              <nav className="mt-2 space-y-[2px]">
                {/* ACCOUNT SETTINGS */}
                <button
                  type="button"
                  onClick={() => handleTabClick("settings")}
                  className={`
                    flex w-full items-center gap-2.5
                    rounded-[12px]
                    px-3.5 py-[7px]
                    text-left
                    transition-all

                    ${activeTab === "settings"
                      ? "text-white shadow-[0_8px_20px_-13px_rgba(22,40,28,0.85)]"
                      : "text-[#62635E] hover:bg-[#F0F1EC]"
                    }
                  `}
                  style={
                    activeTab === "settings"
                      ? {
                        background:
                          "linear-gradient(135deg, #203B28 0%, #16281C 100%)",
                      }
                      : undefined
                  }
                >
                  <span
                    className={`
                      flex h-8 w-8 shrink-0
                      items-center justify-center
                      rounded-[9px]

                      ${activeTab === "settings"
                        ? "bg-white/10"
                        : "bg-white shadow-[0_3px_11px_-8px_rgba(0,0,0,0.45)]"
                      }
                    `}
                  >
                    <SettingsIcon
                      className="h-[15px] w-[15px]"
                      style={{
                        color:
                          activeTab === "settings"
                            ? "#fff"
                            : "#898A84",
                      }}
                    />
                  </span>

                  <span className="text-[12px] font-semibold">
                    Account Settings
                  </span>
                </button>

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className="
                    flex w-full items-center gap-2.5
                    rounded-[12px]
                    px-3.5 py-[7px]
                    text-left
                    text-[#A85050]
                    transition
                    hover:bg-[#FFF3F3]
                    disabled:opacity-60
                  "
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#FFF5F5]">
                    <LogOut className="h-[15px] w-[15px]" />
                  </span>

                  <span className="text-[12px] font-semibold">
                    {isLoggingOut ? "Logging Out..." : "Log Out"}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* ACCOUNT TYPE */}
          <div className="mt-3 shrink-0 rounded-[16px] border border-[#E6E6E1] bg-white p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#A3A39D]">
                  Account Type
                </p>

                <p className="mt-0.5 text-[11px] font-semibold text-[#171717]">
                  {isDistributor ? "Distributor" : "Customer"}
                </p>
              </div>

              <div
                className="flex h-8 w-8 items-center justify-center rounded-[9px]"
                style={{
                  backgroundColor: isDistributor
                    ? "#FBF3E4"
                    : "#F0F2ED",
                }}
              >
                {isDistributor ? (
                  <Coins className="h-3.5 w-3.5 text-[#A9711F]" />
                ) : (
                  <ShoppingBag className="h-3.5 w-3.5 text-[#3E5E47]" />
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
