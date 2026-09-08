"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import {
  ArrowRight,
  ChevronRight,
  Coins,
  Heart,
  Home,
  LogOut,
  Package,
  ShoppingCart,
  Sparkles,
  X,
  ShoppingBag,
  HeartHandshake,
  ShoppingBasket,
  Award,
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Settings as SettingsIcon,
  LifeBuoy,
  FileText,
  Lightbulb,
} from "lucide-react";

import Header from "../../../components/common/Header";
import Footer from "../../../components/Footer/Footer";

import { useLogout } from "@/lib/hooks/useLogout";
import { showToast } from "@/lib/slices/toastSlice";

import {
  useGetDashboardQuery,
  useGetUserProfileQuery,
} from "@/lib/redux/api/authApi";

import { useGetProductsQuery } from "@/lib/redux/api/productApi";

import OrdersPage from "@/Screens/order/order";
import WishlistComponent from "@/components/profile/WishlistComponent";
import AddressComponent from "@/components/profile/AddressComponent";
import AccountSettings from "@/components/profile/AccountSettings";
import DistributorStatsPage from "@/components/profile/DistributorStatsPage";

type TabType =
  | "overview"
  | "orders"
  | "wishlist"
  | "address"
  | "settings"
  | "earning"
  | "help"
  | "refund"
  | "suggestions";

type AnyObject = Record<string, any>;

const ALLOWED_TABS: TabType[] = [
  "overview",
  "orders",
  "wishlist",
  "address",
  "settings",
  "earning",
  "help",
  "refund",
  "suggestions",
];

const TAB_LABELS: Record<TabType, string> = {
  overview: "Overview",
  orders: "My Orders",
  wishlist: "Wishlist",
  address: "Manage Address",
  settings: "Account Settings",
  earning: "Earnings",
  help: "Help & Support",
  refund: "Refund Policy",
  suggestions: "Suggestions",
};

const BRAND_GREEN = "#16281C";
const BRAND_GREEN_2 = "#203B28";

const CARD =
  "rounded-[18px] border border-[#E8E8E3] bg-white shadow-[0_8px_35px_-22px_rgba(0,0,0,0.35)]";

const SOFT_CARD =
  "rounded-[18px] border border-[#E8E8E3] bg-[#FCFCFA]";

const SECTION_TITLE =
  "text-[18px] font-semibold tracking-[-0.02em] text-[#171717]";

const LABEL =
  "text-[9px] font-semibold uppercase tracking-[0.16em] text-[#979791]";

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

const getFirstName = (name?: string) => {
  if (!name) return "Guest";

  return name.trim().split(" ")[0] || "Guest";
};

const getInitials = (name?: string) => {
  if (!name) return "GU";

  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] || ""}${
    parts[parts.length - 1]?.[0] || ""
  }`.toUpperCase();
};

const formatCurrency = (value: any) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const renderRatingStars = (rating: number) => {
  const value = Math.max(
    0,
    Math.min(5, Math.floor(Number(rating) || 0)),
  );

  return "★".repeat(value) + "☆".repeat(Math.max(0, 5 - value));
};

const getActivityTime = (timestamp: any, createdAt?: string) => {
  if (timestamp) {
    return new Date(Number(timestamp) * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  if (createdAt) {
    const date = new Date(createdAt);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  }

  return "--:--";
};

const getActivityDate = (timestamp: any, createdAt?: string) => {
  if (timestamp) {
    return new Date(Number(timestamp) * 1000).toLocaleDateString(
      "en-IN",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );
  }

  if (createdAt) {
    const date = new Date(createdAt);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  return "";
};

/* ========================================================================= */
/* DASHBOARD SIDEBAR                                                         */
/* ========================================================================= */

interface DashboardSidebarProps {
  userData: AnyObject;
  stats: AnyObject;
  accountType: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

function DashboardSidebar({
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
          w-[332px]
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
        {/* MOBILE CLOSE */}
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onMobileToggle}
          className="
            absolute right-4 top-4 z-[180]
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
            lg:hidden
          "
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-screen min-h-0 flex-col px-4 py-5">
          {/* =============================================================== */}
          {/* PROFILE CARD                                                     */}
          {/* =============================================================== */}

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
              pr-[58px]
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
                {isDistributor
                  ? "Verified Distributor"
                  : "Customer"}
              </p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-[#AEAEA7]" />
          </button>

          {/* =============================================================== */}
          {/* ACCOUNT SECTION                                                  */}
          {/* =============================================================== */}

          <div className="mt-6 min-h-0 flex-1 overflow-hidden">
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
                    onClick={() =>
                      handleTabClick(item.tab)
                    }
                    className={`
                      group relative flex w-full
                      items-center justify-between
                      rounded-[12px]
                      px-3.5 py-[9px]
                      text-left
                      transition-all duration-200

                      ${
                        active
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

                          ${
                            active
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

                          ${
                            active
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

            {/* ============================================================= */}
            {/* PREFERENCES                                                    */}
            {/* ============================================================= */}

            <div className="mt-3 border-t border-[#E7E7E1] pt-3">
              <p className="px-3 text-[8px] font-bold uppercase tracking-[0.18em] text-[#9EA099]">
                Preferences
              </p>

              <nav className="mt-2 space-y-[2px]">
                {/* ACCOUNT SETTINGS */}
                <button
                  type="button"
                  onClick={() =>
                    handleTabClick("settings")
                  }
                  className={`
                    flex w-full items-center gap-2.5
                    rounded-[12px]
                    px-3.5 py-[7px]
                    text-left
                    transition-all

                    ${
                      activeTab === "settings"
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

                      ${
                        activeTab === "settings"
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
                    {isLoggingOut
                      ? "Logging Out..."
                      : "Log Out"}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* =============================================================== */}
          {/* BOTTOM ACCOUNT TYPE                                             */}
          {/* =============================================================== */}

          <div className="mt-3 shrink-0 rounded-[16px] border border-[#E6E6E1] bg-white p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#A3A39D]">
                  Account Type
                </p>

                <p className="mt-0.5 text-[11px] font-semibold text-[#171717]">
                  {isDistributor
                    ? "Distributor"
                    : "Customer"}
                </p>
              </div>

              <div
                className="flex h-8 w-8 items-center justify-center rounded-[9px]"
                style={{
                  backgroundColor:
                    isDistributor
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
/* ========================================================================= */
/* STATS CARD                                                                */
/* ========================================================================= */

function StatsCard({
  value,
  label,
  icon: Icon,
  subtitle,
}: {
  value: any;
  label: string;
  icon: React.ElementType;
  color?: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`
        group relative overflow-hidden
        ${CARD}
        p-5
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_40px_-25px_rgba(0,0,0,0.35)]
      `}
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#F4F6F1] blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#9A9A94]">
              {label}
            </p>

            <div className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.04em] text-[#111111]">
              {value}
            </div>

            {subtitle && (
              <div className="mt-2 text-[10px] font-medium text-[#8A8A85]">
                {subtitle}
              </div>
            )}
          </div>

          <div
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-[13px]
              border border-[#E7E9E3]
              text-[#415447]
              shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)]
              transition-all
              duration-300
              group-hover:scale-105
            "
            style={{
              background:
                "linear-gradient(145deg, #F7F9F5 0%, #EDF2EB 100%)",
            }}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="h-[3px] w-10 overflow-hidden rounded-full bg-[#E6E8E2]">
            <div
              className="h-full w-2/3 rounded-full"
              style={{
                backgroundColor:
                  BRAND_GREEN,
              }}
            />
          </div>

          <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#B0B0AA]">
            Updated
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ========================================================================= */
/* LATEST ORDER                                                              */
/* ========================================================================= */

function LatestOrderCard({
  latestOrder,
  onViewOrders,
}: {
  latestOrder: AnyObject;
  onViewOrders: () => void;
}) {
  const orderItem =
    latestOrder?.items?.[0];

  const image =
    orderItem?.images?.[0]
      ?.image_url ||
    orderItem?.image_url ||
    orderItem?.primary_image_url ||
    "";

  const orderStatus =
    latestOrder?.status ||
    "pending";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`${CARD} overflow-hidden`}
    >
      <div className="border-b border-[#ECECE6] px-5 py-4.5">
        <div className="flex items-center justify-between">
          <div>
            <p className={LABEL}>
              Recent Purchase
            </p>

            <h3 className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-[#171717]">
              Latest Order
            </h3>
          </div>

          <button
            type="button"
            onClick={onViewOrders}
            className="
              group flex items-center gap-1.5
              rounded-full
              border border-[#E5E5E0]
              bg-[#FAFAF8]
              px-3 py-1.5
              text-[9px]
              font-semibold
              text-[#333]
            "
          >
            View All
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {latestOrder ? (
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative h-[94px] w-[94px] shrink-0 overflow-hidden rounded-[15px] border border-[#E6E6E0] bg-[#F5F6F2]">
              {image ? (
                <Image
                  src={image}
                  alt={
                    orderItem?.name ||
                    "Order item"
                  }
                  fill
                  sizes="94px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-7 w-7 text-[#B7B8B1]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="line-clamp-2 text-[13px] font-semibold leading-[1.35] text-[#171717]">
                  {orderItem?.name ||
                    "Order"}
                </h4>

                <span
                  className={`
                    inline-flex items-center gap-1.5
                    rounded-full border
                    px-2.5 py-1
                    text-[8px]
                    font-bold uppercase
                    tracking-[0.08em]

                    ${
                      orderStatus ===
                      "confirmed"
                        ? "border-[#CFE0D4] bg-[#F1F7F3] text-[#3F765A]"
                        : "border-[#E8E8E3] bg-[#F9F9F7] text-[#777870]"
                    }
                  `}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {orderStatus}
                </span>
              </div>

              <p className="mt-2 text-[10px] leading-5 text-[#92928C]">
                Order{" "}
                {latestOrder?.order_reference ||
                  "—"}
                <br />
                Placed{" "}
                {latestOrder?.order_date ||
                  "—"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className={`${SOFT_CARD} p-3.5`}>
              <p className={LABEL}>
                Total Paid
              </p>

              <p className="mt-1.5 text-[17px] font-semibold tracking-[-0.02em] text-[#111]">
                {formatCurrency(
                  latestOrder?.total_payable,
                )}
              </p>
            </div>

            <div className={`${SOFT_CARD} p-3.5`}>
              <p className={LABEL}>
                Items
              </p>

              <p className="mt-1.5 text-[17px] font-semibold tracking-[-0.02em] text-[#111]">
                {latestOrder?.items
                  ?.length || 0}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewOrders}
            className="
              mt-4 flex h-[42px] w-full
              items-center justify-center gap-2
              rounded-[11px]
              text-[9px]
              font-bold uppercase
              tracking-[0.13em]
              text-white
              shadow-[0_12px_25px_-15px_rgba(22,40,28,0.8)]
              transition-all
              hover:-translate-y-0.5
              hover:brightness-110
              active:scale-[0.98]
            "
            style={{
              background:
                "linear-gradient(135deg, #294532 0%, #16281C 100%)",
            }}
          >
            Track Order
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#F3F4F0]">
            <Package className="h-6 w-6 text-[#AEB0A8]" />
          </div>

          <p className="mt-4 text-[11px] font-medium text-[#888981]">
            You haven&apos;t placed any
            orders yet.
          </p>

          <Link
            href="/products"
            className="
              mt-4 inline-flex
              items-center gap-1
              text-[9px]
              font-bold uppercase
              tracking-[0.12em]
              text-[#2E5239]
              underline underline-offset-4
            "
          >
            Start Shopping
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

/* ========================================================================= */
/* RECENT ACTIVITY                                                           */
/* ========================================================================= */

function RecentActivity({
  activities,
  activityFilter,
  setActivityFilter,
  isDistributor,
}: {
  activities: AnyObject[];
  activityFilter: string;
  setActivityFilter: (value: string) => void;
  isDistributor: boolean;
}) {
  const filteredActivities = useMemo(() => {
    if (!Array.isArray(activities)) {
      return [];
    }

    if (activityFilter === "all") {
      return activities;
    }

    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const yesterday = new Date(today);

    yesterday.setDate(
      yesterday.getDate() - 1,
    );

    const weekAgo = new Date(today);

    weekAgo.setDate(
      weekAgo.getDate() - 7,
    );

    const monthAgo = new Date(today);

    monthAgo.setMonth(
      monthAgo.getMonth() - 1,
    );

    return activities.filter(
      (activity) => {
        const activityDate =
          activity?.created_timestamp
            ? new Date(
                Number(
                  activity.created_timestamp,
                ) * 1000,
              )
            : new Date(
                activity?.created_at ||
                  "",
              );

        if (
          Number.isNaN(
            activityDate.getTime(),
          )
        ) {
          return true;
        }

        switch (activityFilter) {
          case "today":
            return activityDate >= today;

          case "yesterday":
            return (
              activityDate >=
                yesterday &&
              activityDate < today
            );

          case "week":
            return (
              activityDate >=
              weekAgo
            );

          case "month":
            return (
              activityDate >=
              monthAgo
            );

          default:
            return true;
        }
      },
    );
  }, [activities, activityFilter]);

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={LABEL}>
            Your Journey
          </p>

          <h3
            className={`mt-1 ${SECTION_TITLE}`}
          >
            Recent Activity
          </h3>
        </div>

        <select
          value={activityFilter}
          onChange={(e) =>
            setActivityFilter(
              e.target.value,
            )
          }
          className="
            rounded-[10px]
            border border-[#DCDDD7]
            bg-white
            px-3.5 py-2
            text-[9px]
            font-semibold
            text-[#555750]
            outline-none
            transition
            focus:border-[#AEB1A9]
          "
        >
          <option value="all">
            All Time
          </option>

          <option value="today">
            Today
          </option>

          <option value="yesterday">
            Yesterday
          </option>

          <option value="week">
            This Week
          </option>

          <option value="month">
            This Month
          </option>
        </select>
      </div>

      <div className={`${CARD} p-5`}>
        {filteredActivities.length ===
        0 ? (
          <div className="flex min-h-[220px] items-center justify-center text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#F3F4F0]">
                <Package className="h-6 w-6 text-[#B1B2AB]" />
              </div>

              <p className="mt-4 text-[11px] font-medium text-[#888981]">
                No recent activity to
                show.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="max-h-[370px] overflow-y-auto pr-2">
              {filteredActivities.map(
                (
                  activity,
                  index,
                ) => {
                  const isLast =
                    index ===
                    filteredActivities.length -
                      1;

                  return (
                    <motion.div
                      key={
                        activity?.order_reference ||
                        `${activity?.event || "activity"}-${index}`
                      }
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index *
                          0.05,
                      }}
                      className="grid grid-cols-[54px_20px_1fr_auto] gap-3.5"
                    >
                      <div className="pt-0.5 text-right">
                        <span className="text-[11px] font-semibold text-[#333531]">
                          {getActivityTime(
                            activity?.created_timestamp,
                            activity?.created_at,
                          )}
                        </span>
                      </div>

                      <div className="relative flex justify-center">
                        {!isLast && (
                          <div className="absolute left-1/2 top-5 h-[78px] w-px -translate-x-1/2 bg-[#E4E5DF]" />
                        )}

                        <div
                          className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.4)]"
                          style={{
                            borderColor:
                              BRAND_GREEN,
                          }}
                        >
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                BRAND_GREEN,
                            }}
                          />
                        </div>
                      </div>

                      <div className="pb-7">
                        <p className="text-[11px] font-semibold leading-[1.45] text-[#191A18]">
                          {activity?.event ||
                            "Activity"}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full border border-[#E5E5E0] bg-[#FAFAF8] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-[#70716B]">
                            {activity?.type ===
                            "order"
                              ? "Purchase"
                              : activity?.type ||
                                "Activity"}
                          </span>

                          {isDistributor && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#EBD9B4] bg-[#FBF3E4] px-2.5 py-1 text-[8px] font-bold text-[#A9711F]">
                              <Coins className="h-2.5 w-2.5" />

                              {activity?.points_earned ||
                                0}{" "}
                              Points
                            </span>
                          )}

                          {!isDistributor &&
                            activity?.rating && (
                              <span className="rounded-full bg-[#F7F7F4] px-2 py-1 text-[8px] tracking-[1px] text-[#222]">
                                {renderRatingStars(
                                  activity.rating,
                                )}
                              </span>
                            )}
                        </div>
                      </div>

                      <div className="pt-0.5 text-right">
                        <span className="whitespace-nowrap text-[8px] font-medium text-[#A0A19A]">
                          {getActivityDate(
                            activity?.created_timestamp,
                            activity?.created_at,
                          )}
                        </span>
                      </div>
                    </motion.div>
                  );
                },
              )}
            </div>

            {filteredActivities.length >
              4 && (
              <div className="mt-1 border-t border-[#E9E9E4] pt-3 text-center text-[8px] font-medium uppercase tracking-[0.12em] text-[#A1A19A]">
                Showing{" "}
                {
                  filteredActivities.length
                }{" "}
                activities
              </div>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}

/* ========================================================================= */
/* RECOMMENDED PRODUCTS                                                      */
/* ========================================================================= */

function RecommendedProducts({
  products,
  isLoading,
  onProductClick,
}: {
  products: AnyObject[];
  isLoading: boolean;
  onProductClick: (slug: string) => void;
}) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={LABEL}>
            Handpicked For You
          </p>

          <h3
            className={`mt-1 flex items-center gap-2 ${SECTION_TITLE}`}
          >
            <span>
              Recommended For You
            </span>

            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0F3ED]">
              <Sparkles className="h-3.5 w-3.5 text-[#34513C]" />
            </span>
          </h3>
        </div>

        <Link
          href="/products"
          className="
            group flex items-center gap-1.5
            rounded-full
            border border-[#E4E4DE]
            bg-white
            px-3 py-1.5
            text-[9px]
            font-semibold
            text-[#222]
            transition
            hover:border-[#D2D3CC]
            hover:bg-[#FAFAF8]
          "
        >
          View All

          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="
                  animate-pulse
                  overflow-hidden
                  rounded-[18px]
                  border border-[#E8E8E3]
                  bg-white
                "
              >
                <div className="h-[220px] bg-[#F0F1ED]" />

                <div className="space-y-3 p-4">
                  <div className="h-2.5 w-20 rounded bg-[#E7E8E3]" />

                  <div className="h-3.5 w-3/4 rounded bg-[#E7E8E3]" />

                  <div className="h-3.5 w-20 rounded bg-[#E7E8E3]" />

                  <div className="h-9 rounded-[10px] bg-[#E7E8E3]" />
                </div>
              </div>
            ),
          )}
        </div>
      ) : products.length === 0 ? (
        <div className={`${CARD} px-6 py-14 text-center`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#F3F4F0]">
            <Package className="h-7 w-7 text-[#B6B7B0]" />
          </div>

          <p className="mt-4 text-[11px] font-medium text-[#888981]">
            No recommendations available
            at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {products
            .slice(0, 4)
            .map(
              (
                product: AnyObject,
                index: number,
              ) => {
                const image =
                  product?.primary_image_url ||
                  product?.images?.[0]
                    ?.image_url ||
                  "";

                const price =
                  Number(
                    product?.retail_price ??
                      product?.price ??
                      0,
                  );

                const oldPrice =
                  Number(
                    product?.distributor_price ??
                      product?.mrp ??
                      0,
                  );

                return (
                  <motion.div
                    key={
                      product?.id ||
                      index
                    }
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        index *
                        0.06,
                    }}
                    onClick={() => {
                      if (
                        product?.slug
                      ) {
                        onProductClick(
                          product.slug,
                        );
                      }
                    }}
                    className="
                      group cursor-pointer
                      overflow-hidden
                      rounded-[18px]
                      border border-[#E7E7E2]
                      bg-white
                      shadow-[0_8px_30px_-20px_rgba(0,0,0,0.35)]
                      transition-all duration-300
                      hover:-translate-y-1
                      hover:border-[#D4D5CF]
                      hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.38)]
                    "
                  >
                    <div className="relative h-[220px] overflow-hidden bg-[#F5F6F2]">
                      {image ? (
                        <Image
                          src={image}
                          alt={
                            product?.name ||
                            "Product"
                          }
                          fill
                          className="object-cover p-2 transition-transform duration-500 group-hover:scale-105 rounded-2xl"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-12 w-12 text-[#C0C2BA]" />
                        </div>
                      )}

                      <div className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/85 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#555750] shadow-sm backdrop-blur">
                        {product?.category
                          ?.name ||
                          "Product"}
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#9A9B94]">
                        {product?.category
                          ?.name ||
                          "Collection"}
                      </p>

                      <h4 className="mt-1 line-clamp-2 min-h-[34px] text-[13px] font-semibold leading-[1.35] text-[#181918]">
                        {product?.name ||
                          "Product"}
                      </h4>

                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-[16px] font-bold tracking-[-0.02em] text-[#111111]">
                          {formatCurrency(
                            price,
                          )}
                        </p>

                        {oldPrice >
                          price && (
                          <p className="text-[10px] font-medium text-[#A5A59F] line-through">
                            {formatCurrency(
                              oldPrice,
                            )}
                          </p>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[11px] tracking-[1px] text-[#232423]">
                          {renderRatingStars(
                            product?.rating ||
                              0,
                          )}
                        </span>

                        <span className="text-[9px] text-[#9B9C95]">
                          (
                          {product?.reviews ||
                            0}
                          )
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();

                          if (
                            product?.slug
                          ) {
                            onProductClick(
                              product.slug,
                            );
                          }
                        }}
                        className="
                          mt-4 flex h-[40px]
                          w-full
                          items-center justify-center
                          gap-2
                          rounded-[10px]
                          text-[9px]
                          font-bold uppercase
                          tracking-[0.1em]
                          text-white
                          shadow-[0_10px_22px_-14px_rgba(22,40,28,0.9)]
                          transition-all
                          hover:-translate-y-0.5
                          hover:brightness-110
                          active:scale-[0.98]
                        "
                        style={{
                          background:
                            "linear-gradient(135deg, #294532 0%, #16281C 100%)",
                        }}
                      >
                        Shop Now
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              },
            )}
        </div>
      )}
    </motion.section>
  );
}

/* ========================================================================= */
/* MAIN PROFILE COMPONENT                                                    */
/* ========================================================================= */

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { logout } =
    useLogout();

  const [activeTab, setActiveTab] =
    useState<TabType>("overview");

  const [activityFilter, setActivityFilter] =
    useState("all");

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  /* ========================================================================= */
  /* INITIAL TAB                                                               */
  /* ========================================================================= */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search,
      );

    const tab =
      params.get("tab") as
        | TabType
        | null;

    if (
      tab &&
      ALLOWED_TABS.includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, []);

  /* ========================================================================= */
  /* TAB ROUTING                                                               */
  /* ========================================================================= */

  const handleTabChange = (
    tab: TabType,
  ) => {
    if (tab === "help") {
      router.push("/contact/");
      return;
    }

    if (tab === "refund") {
      router.push(
        "/footer-policy/return-refund-policy/",
      );
      return;
    }

    setActiveTab(tab);

    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search,
      );

    params.set("tab", tab);

    router.push(
      `/profile?${params.toString()}`,
      {
        scroll: false,
      },
    );
  };

  /* ========================================================================= */
  /* API                                                                       */
  /* ========================================================================= */

  const {
    data: dashboardData,
    isLoading:
      isDashboardLoading,
    isError:
      isDashboardError,
    error: dashboardError,
    refetch:
      refetchDashboard,
  } =
    useGetDashboardQuery(
      undefined,
      {
        refetchOnMountOrArgChange: true,
      },
    );

  const {
    data: productsData,
    isLoading:
      isProductsLoading,
  } =
    useGetProductsQuery(
      {
        is_published: true,
        per_page: 10,
        page: 1,
        sort_by: "created_at",
        sort_direction: "desc",
      },
      {
        refetchOnMountOrArgChange: true,
      },
    );

  const {
    data: userProfileData,
    isLoading:
      isUserProfileLoading,
  } =
    useGetUserProfileQuery(
      undefined,
      {
        refetchOnMountOrArgChange: true,
      },
    );

  /* ========================================================================= */
  /* USER DATA                                                                 */
  /* ========================================================================= */

  const apiData =
    dashboardData?.data;

  const dashboardUser =
    apiData?.user || {};

  const profileUser =
    userProfileData?.user ||
    userProfileData?.data?.user ||
    userProfileData?.data ||
    userProfileData ||
    {};

  const profileImage =
    profileUser?.profile_picture ||
    profileUser?.profile_image ||
    profileUser?.user?.profile_picture ||
    profileUser?.user?.profile_image ||
    userProfileData?.user
      ?.profile_picture ||
    userProfileData?.user
      ?.profile_image ||
    userProfileData?.data?.user
      ?.profile_picture ||
    userProfileData?.data?.user
      ?.profile_image ||
    userProfileData?.data
      ?.profile_picture ||
    userProfileData?.data
      ?.profile_image ||
    dashboardUser?.profile_picture ||
    dashboardUser?.profile_image ||
    "";

  const userName =
    profileUser?.full_name ||
    profileUser?.name ||
    dashboardUser?.full_name ||
    dashboardUser?.name ||
    "";

  const userEmail =
    profileUser?.email ||
    dashboardUser?.email ||
    "";

  const userAccountType =
    profileUser?.account_type ||
    dashboardUser?.account_type ||
    "customer";

  const memberSince =
    profileUser?.created_at
      ? new Date(
          profileUser.created_at,
        )
          .getFullYear()
          .toString()
      : dashboardUser?.member_since ||
        "2026";

  const userData = {
    ...dashboardUser,
    ...profileUser,
    name: userName,
    email: userEmail,
    account_type:
      userAccountType,
    member_since:
      memberSince,
    profile_image:
      profileImage,
  };

  const stats =
    apiData?.stats || {};

  const latestOrder =
    apiData?.latest_order ||
    null;

  const recentActivity =
    apiData?.recent_activity ||
    [];

  const commissionData =
    apiData?.commission ||
    null;

  const accountType =
    userData?.account_type ||
    "customer";

  const isDistributor =
    accountType ===
    "distributor";

  const products =
    productsData?.data?.data ||
    productsData?.data ||
    productsData ||
    [];

  /* ========================================================================= */
  /* LOGOUT                                                                    */
  /* ========================================================================= */

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout({
        redirectTo:
          "/login",
        callApi: true,
        clearReduxState:
          true,
        clearPersistedState:
          true,

        onSuccess:
          () => {
            dispatch(
              showToast({
                message:
                  "Successfully logged out! See you soon 👋",
                type: "success",
              }),
            );

            setIsLoggingOut(
              false,
            );
          },

        onError: () => {
          dispatch(
            showToast({
              message:
                "Logout failed. Please try again.",
              type: "error",
            }),
          );

          setIsLoggingOut(
            false,
          );
        },
      });
    } catch {
      dispatch(
        showToast({
          message:
            "Something went wrong. Please try again.",
          type: "error",
        }),
      );

      setIsLoggingOut(
        false,
      );
    }
  };

  /* ========================================================================= */
  /* PRODUCT NAVIGATION                                                        */
  /* ========================================================================= */

  const handleProductClick = (
    slug: string,
  ) => {
    if (!slug) {
      router.push(
        "/products",
      );
      return;
    }

    router.push(
      `/product/${slug}`,
    );
  };

  /* ========================================================================= */
  /* SHELL                                                                     */
  /* ========================================================================= */

  const Shell = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F1] font-sans text-[#171717]">
      <DashboardSidebar
        userData={userData}
        stats={stats}
        accountType={
          accountType
        }
        activeTab={
          activeTab
        }
        onTabChange={
          handleTabChange
        }
        onLogout={
          handleLogout
        }
        isLoggingOut={
          isLoggingOut
        }
        isMobileOpen={
          isSidebarOpen
        }
        onMobileToggle={() =>
          setIsSidebarOpen(
            !isSidebarOpen,
          )
        }
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="z-[100] shrink-0 bg-white shadow-[0_2px_12px_-10px_rgba(0,0,0,0.3)]">
          <Header
            hideAnnouncement={true}
            cartItems={[]}
            cartCount={
              stats?.cart_items ||
              0
            }
            cartSubtotal={0}
            wishlistCount={
              stats?.wishlist ||
              0
            }
            hideMenu={true}
            showSidebarMenu={true}
            onSidebarMenuClick={() =>
              setIsSidebarOpen(
                !isSidebarOpen,
              )
            }
          />
        </div>

        {/* ONLY MAIN CONTENT SCROLLS */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#F4F5F1]">
          {children}
        </main>
      </div>
    </div>
  );

  /* ========================================================================= */
  /* LOADING                                                                   */
  /* ========================================================================= */

  if (
    isDashboardLoading ||
    isProductsLoading ||
    isUserProfileLoading
  ) {
    return (
      <Shell>
        <div className="mx-auto w-full max-w-[1320px] px-5 py-7 md:px-8 xl:px-10">
          <div className="animate-pulse">
            <div className="h-3 w-24 rounded-full bg-[#DFE1DA]" />

            <div className="mt-4 h-9 w-[300px] rounded-xl bg-[#DFE1DA]" />

            <div className="mt-3 h-3 w-[230px] rounded-full bg-[#E8E9E4]" />

            <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1.45fr]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-2">
                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-[165px] rounded-[18px] bg-white"
                    />
                  ),
                )}
              </div>

              <div className="h-[365px] rounded-[18px] bg-white" />
            </div>

            <div className="mt-7 h-[390px] rounded-[18px] bg-white" />

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-[430px] rounded-[18px] bg-white"
                  />
                ),
              )}
            </div>
          </div>
        </div>

        <Footer />
      </Shell>
    );
  }

  /* ========================================================================= */
  /* ERROR                                                                     */
  /* ========================================================================= */

  if (isDashboardError) {
    return (
      <Shell>
        <div className="flex min-h-full items-center justify-center px-5 py-10">
          <div className="w-full max-w-lg rounded-[20px] border border-[#E6E6E1] bg-white p-8 text-center shadow-[0_20px_50px_-30px_rgba(0,0,0,0.3)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[15px] bg-[#FFF4F4]">
              <Package className="h-6 w-6 text-[#B24C4C]" />
            </div>

            <h2 className="mt-5 text-[21px] font-semibold tracking-[-0.03em] text-[#171717]">
              Failed to Load
              Dashboard
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-[11px] leading-5 text-[#8A8A84]">
              {dashboardError?.data
                ?.message ||
                "Something went wrong. Please try again."}
            </p>

            <button
              type="button"
              onClick={() =>
                refetchDashboard()
              }
              className="mt-6 rounded-[11px] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_25px_-14px_rgba(22,40,28,0.9)] transition hover:-translate-y-0.5 hover:brightness-110"
              style={{
                background:
                  "linear-gradient(135deg, #294532 0%, #16281C 100%)",
              }}
            >
              Retry
            </button>
          </div>
        </div>

        <Footer />
      </Shell>
    );
  }

  /* ========================================================================= */
  /* OVERVIEW                                                                  */
  /* ========================================================================= */

  const renderOverview = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren:
              0.05,
          },
        },
      }}
      className="space-y-7"
    >
      {/* HERO */}
      <motion.section
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          relative
          overflow-hidden
          rounded-[22px]
          border border-[#E5E7DF]
          bg-white
          px-5 py-6
          shadow-[0_12px_40px_-25px_rgba(0,0,0,0.25)]
          md:px-7
        "
      >
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#EAF0E8] blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#58745F]" />

              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#7F817A]">
                Account Overview
              </p>
            </div>

            <h1 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] text-[#111111] sm:text-[30px]">
              Welcome back,{" "}
              {getFirstName(
                userData?.name,
              )}
            </h1>

            <p className="mt-2 text-[11px] leading-5 text-[#898A83]">
              Here&apos;s what&apos;s
              happening with your
              account today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-[13px] border border-[#E7E8E2] bg-[#FBFCF9] px-4 py-3">
              <p className={LABEL}>
                Member Since
              </p>

              <p className="mt-1 text-[11px] font-semibold text-[#2A2B28]">
                {userData?.member_since ||
                  "2026"}
              </p>
            </div>

            <div
              className="hidden h-[52px] w-[52px] items-center justify-center rounded-[15px] text-white sm:flex"
              style={{
                background:
                  "linear-gradient(145deg, #294532, #16281C)",
              }}
            >
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* STATS + ORDER */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1.45fr]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-2">
          <StatsCard
            value={
              stats?.total_orders ||
              0
            }
            label="Total Orders"
            icon={ShoppingBag}
            subtitle={
              stats?.total_orders >
              0
                ? "Active orders"
                : "No orders yet"
            }
          />

          <StatsCard
            value={
              stats?.wishlist || 0
            }
            label="Wishlist"
            icon={HeartHandshake}
            subtitle={
              stats?.wishlist > 0
                ? "Items saved"
                : "Start saving"
            }
          />

          <StatsCard
            value={
              stats?.cart_items || 0
            }
            label="Cart Items"
            icon={ShoppingBasket}
            subtitle={
              stats?.cart_items > 0
                ? "Ready to checkout"
                : "Cart is empty"
            }
          />

          <StatsCard
            value={
              isDistributor
                ? commissionData?.total_points ||
                  stats?.points_earned ||
                  0
                : Number(
                    stats?.average_rating ||
                      0,
                  ).toFixed(1)
            }
            label={
              isDistributor
                ? "Points Earned"
                : "Your Rating"
            }
            icon={Award}
            subtitle={
              isDistributor
                ? `${
                    commissionData
                      ?.rank
                      ?.current_rank ||
                    "Bronze"
                  } rank`
                : `${
                    stats?.total_reviews ||
                    0
                  } reviews`
            }
          />
        </div>

        <LatestOrderCard
          latestOrder={
            latestOrder
          }
          onViewOrders={() =>
            handleTabChange(
              "orders",
            )
          }
        />
      </section>

      {/* CART */}
      {Number(
        stats?.cart_items || 0,
      ) > 0 && (
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative overflow-hidden rounded-[16px] border border-[#EBD9B4] bg-[#FBF3E4] px-4 py-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/70">
              <ShoppingCart className="h-4 w-4 text-[#A9711F]" />
            </div>

            <p className="text-[10px] text-[#6B5A38]">
              You have{" "}
              <strong>
                {stats?.cart_items}
              </strong>{" "}
              item
              {Number(
                stats?.cart_items,
              ) > 1
                ? "s"
                : ""}{" "}
              in your cart.
            </p>

            <Link
              href="/cart"
              className="ml-auto rounded-full bg-[#A9711F] px-3.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-white"
            >
              View Cart
            </Link>
          </div>
        </motion.div>
      )}

      {/* COMMISSION */}
      {isDistributor &&
        commissionData && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className={`${CARD} relative overflow-hidden p-5`}
          >
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={LABEL}>
                    Distributor
                    Program
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <Coins className="h-4 w-4 text-[#2F4B37]" />

                    <h3 className="text-[17px] font-semibold text-[#171717]">
                      Commission &
                      Rewards
                    </h3>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-3">
                <div
                  className={`${SOFT_CARD} p-4`}
                >
                  <p className={LABEL}>
                    Current Rank
                  </p>

                  <p className="mt-2 text-[18px] font-semibold text-[#171717]">
                    {commissionData
                      ?.rank
                      ?.current_rank ||
                      "—"}
                  </p>
                </div>

                <div
                  className={`${SOFT_CARD} p-4`}
                >
                  <p className={LABEL}>
                    Commission
                  </p>

                  <p className="mt-2 text-[18px] font-semibold text-[#111]">
                    {formatCurrency(
                      commissionData?.commission,
                    )}
                  </p>
                </div>

                <div
                  className={`${SOFT_CARD} p-4`}
                >
                  <p className={LABEL}>
                    Coins
                  </p>

                  <p className="mt-2 text-[18px] font-semibold text-[#171717]">
                    {commissionData?.coins ||
                      0}
                  </p>
                </div>
              </div>

              {commissionData
                ?.rank
                ?.progress_percentage !==
                undefined && (
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[9px] text-[#8B8C86]">
                      Progress to{" "}
                      {commissionData
                        ?.rank
                        ?.next_rank ||
                        "Next Rank"}
                    </span>

                    <span className="text-[9px] font-bold text-[#252625]">
                      {
                        commissionData
                          ?.rank
                          ?.progress_percentage
                      }
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#E9ECE6]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        background:
                          "linear-gradient(90deg, #3B5B43, #16281C)",
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            Number(
                              commissionData
                                ?.rank
                                ?.progress_percentage ||
                                0,
                            ),
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

      {/* ACTIVITY */}
      <RecentActivity
        activities={
          recentActivity
        }
        activityFilter={
          activityFilter
        }
        setActivityFilter={
          setActivityFilter
        }
        isDistributor={
          isDistributor
        }
      />

      {/* PRODUCTS */}
      <RecommendedProducts
        products={
          Array.isArray(
            products,
          )
            ? products
            : []
        }
        isLoading={
          isProductsLoading
        }
        onProductClick={
          handleProductClick
        }
      />
    </motion.div>
  );

  /* ========================================================================= */
  /* CONTENT                                                                   */
  /* ========================================================================= */

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();

      case "orders":
        return <OrdersPage />;

      case "wishlist":
        return (
          <WishlistComponent />
        );

      case "address":
        return (
          <AddressComponent />
        );

      case "settings":
        return (
          <AccountSettings />
        );

      case "earning":
        return (
          <DistributorStatsPage />
        );

      case "suggestions":
        return (
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <RecommendedProducts
              products={
                Array.isArray(
                  products,
                )
                  ? products
                  : []
              }
              isLoading={
                isProductsLoading
              }
              onProductClick={
                handleProductClick
              }
            />
          </motion.div>
        );

      case "help":
        return null;

      case "refund":
        return null;

      default:
        return renderOverview();
    }
  };

  /* ========================================================================= */
  /* FINAL RETURN                                                              */
  /* ========================================================================= */

  return (
    <Shell>
      <div className="mx-auto w-full max-w-[1320px] px-5 py-7 md:px-8 xl:px-10">
        {/* BREADCRUMB */}
        <div className="mb-6 hidden items-center gap-2 lg:flex">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[10px] font-medium text-[#8C8D86] transition hover:text-[#222]"
          >
            <Home className="h-3 w-3" />

            Home
          </Link>

          <ChevronRight className="h-3 w-3 text-[#CACBC5]" />

          <Link
            href="/profile"
            className="text-[10px] font-medium text-[#8C8D86] transition hover:text-[#222]"
          >
            My Account
          </Link>

          <ChevronRight className="h-3 w-3 text-[#CACBC5]" />

          <span className="text-[10px] font-semibold text-[#262724]">
            {TAB_LABELS[
              activeTab
            ]}
          </span>
        </div>

        {/* MOBILE PROFILE HEADER */}
        <div className="mb-5 flex items-center justify-between rounded-[18px] border border-[#E6E7E1] bg-white p-4 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.25)] lg:hidden">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] text-[13px] font-bold text-white"
              style={{
                background:
                  "linear-gradient(145deg, #294532, #16281C)",
              }}
            >
              {userData?.profile_image ? (
                <img
                  src={
                    userData.profile_image
                  }
                  alt={
                    userData?.name ||
                    "User"
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(
                  userData?.name,
                )
              )}
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#171717]">
                {userData?.name ||
                  "Guest User"}
              </p>

              <p className="mt-0.5 max-w-[180px] truncate text-[9px] text-[#888981]">
                {userData?.email ||
                  "guest@email.com"}
              </p>
            </div>
          </div>

          <span
            className={`
              rounded-full border
              px-2.5 py-1.5
              text-[8px]
              font-bold uppercase
              tracking-[0.1em]

              ${
                isDistributor
                  ? "border-[#EBD9B4] bg-[#FBF3E4] text-[#A9711F]"
                  : "border-[#DFE5DF] bg-[#F4F7F3] text-[#47604E]"
              }
            `}
          >
            {isDistributor
              ? "Distributor"
              : "Customer"}
          </span>
        </div>

        {renderContent()}
      </div>
    </Shell>
  );
}