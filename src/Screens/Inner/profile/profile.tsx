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
  Menu,
  Package,
  ShoppingCart,
  Sparkles,
  Star,
  X,
  ShoppingBag,
  HeartHandshake,
  ShoppingBasket,
  Award,
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Settings as SettingsIcon,
} from "lucide-react";

import Header from "../../../components/common/Header";
import Footer from "../../../components/Footer/Footer";

import { useLogout } from "@/lib/hooks/useLogout";
import { showToast } from "@/lib/slices/toastSlice";

import { useGetDashboardQuery } from "@/lib/redux/api/authApi";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";

import OrdersPage from "@/Screens/order/order";
import WishlistComponent from "@/components/profile/WishlistComponent";
import AddressComponent from "@/components/profile/AddressComponent";
import AccountSettings from "@/components/profile/AccountSettings";
import DistributorStatsPage from "@/components/profile/DistributorStatsPage";
import { useGetUserProfileQuery } from "@/lib/redux/api/Profile/userApi";

type TabType =
  "overview" | "orders" | "wishlist" | "address" | "settings" | "earning";

type AnyObject = Record<string, any>;

const ALLOWED_TABS: TabType[] = [
  "overview",
  "orders",
  "wishlist",
  "address",
  "settings",
  "earning",
];

const TAB_LABELS: Record<TabType, string> = {
  overview: "Overview",
  orders: "My Orders",
  wishlist: "Wishlist",
  address: "Manage Address",
  settings: "Account Settings",
  earning: "Earnings",
};

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

  return `${parts[0]?.[0] || ""}${parts[parts.length - 1]?.[0] || ""
    }`.toUpperCase();
};

const formatCurrency = (value: any) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const renderRatingStars = (rating: number) => {
  const value = Math.max(0, Math.min(5, Math.floor(Number(rating) || 0)));

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
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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


const BRAND_GREEN = "#16281C";
const BRAND_GREEN_SOFT = "#1E3524";

interface DashboardSidebarProps {
  userData: AnyObject;
  stats: AnyObject;
  accountType: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

function DashboardSidebar({
  userData,
  stats,
  accountType,
  activeTab,
  onTabChange,
  onLogout,
  isLoggingOut,
}: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

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

    return items;
  }, [stats, isDistributor]);

  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* MOBILE TOGGLE */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-[150] flex h-11 w-11 items-center justify-center rounded-[10px] shadow-xl lg:hidden"
        style={{ backgroundColor: BRAND_GREEN, color: "#fff" }}
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[145] bg-black/35 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          w-[250px]
          h-full
          bg-white

          fixed
          inset-y-0
          left-0
          z-[160]
          overflow-y-auto
          transition-transform
          duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

          lg:sticky
          lg:top-0
          lg:z-auto
          lg:h-screen
          lg:w-[250px]
          lg:flex-shrink-0
          lg:translate-x-0
        `}
      >
        <div className="flex h-full min-h-full flex-col bg-white px-4">
          {/* LOGO ROW */}
          <div className="flex items-center justify-between px-2 pb-5 pt-6">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: BRAND_GREEN }}
              >
                <ShoppingBag className="h-4.5 w-4.5 text-white" />
              </div>

              <div className="leading-tight">
                <p className="text-[15px] font-bold text-[#171717]">
                  IndieKonnect
                </p>
                <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-[#999999]">
                  Account
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-[6px] p-1.5 text-[#777777] hover:bg-[#FAFAF9] lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="mt-1 space-y-1.5">
            {menuItems.map((item) => {
              const active = activeTab === item.tab;
              const Icon = item.icon;

              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => handleTabClick(item.tab)}
                  className="group flex w-full items-center justify-between rounded-full px-4 py-3 text-left transition-all duration-200"
                  style={
                    active
                      ? { backgroundColor: BRAND_GREEN, color: "#fff" }
                      : { color: "#5B5B58" }
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className="h-4 w-4"
                      style={{ color: active ? "#fff" : "#8A8A86" }}
                    />

                    <span className="text-[13px] font-medium">
                      {item.label}
                    </span>
                  </span>

                  {item.count !== null && Number(item.count) > 0 && (
                    <span
                      className="min-w-[26px] rounded-full px-2 py-0.5 text-center text-[10px]"
                      style={
                        active
                          ? { backgroundColor: "rgba(255,255,255,0.18)", color: "#fff" }
                          : { backgroundColor: "#F1F1F0", color: "#777777" }
                      }
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* DIVIDER */}
          <div className="mx-2 mt-5 border-t border-[#ECECEA]" />

          {/* SETTINGS + LOGOUT */}
          <nav className="mt-4 space-y-1.5">
            <button
              type="button"
              onClick={() => handleTabClick("settings")}
              className="group flex w-full items-center gap-3 rounded-full px-4 py-3 text-left transition-all duration-200"
              style={
                activeTab === "settings"
                  ? { backgroundColor: BRAND_GREEN, color: "#fff" }
                  : { color: "#5B5B58" }
              }
            >
              <SettingsIcon
                className="h-4 w-4"
                style={{ color: activeTab === "settings" ? "#fff" : "#8A8A86" }}
              />
              <span className="text-[13px] font-medium">Setting</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-[#B24C4C] transition-all hover:bg-[#FDF2F2]"
            >
              <LogOut className="h-4 w-4 opacity-70" />
              <span className="text-[13px] font-medium">
                {isLoggingOut ? "Logging Out..." : "Log Out"}
              </span>
            </button>
          </nav>

          {/* SPACER pushes upgrade card to bottom */}
          <div className="flex-1" />
          {/* PROFILE FOOTER (kept for account switching) */}
          <button
            type="button"
            onClick={() => handleTabClick("settings")}
            className="mb-4 flex w-full items-center gap-3 rounded-[10px] border border-[#ECECEA] bg-white px-3 py-3 text-left transition hover:bg-[#FAFAF9]"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-medium text-white"
              style={{ backgroundColor: BRAND_GREEN }}
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
              <p className="truncate text-[9px] text-[#888888]">
                {isDistributor ? "Distributor" : "Customer"}
              </p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-[#AAAAAA]" />
          </button>
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative min-h-[150px] rounded-[8px] border border-[#E4E4E2] bg-white p-5 transition hover:border-[#CFCFCC]"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[30px] font-semibold leading-none text-[#111111]">
              {value}
            </div>

            {subtitle && (
              <div className="mt-2 text-[11px] font-medium text-[#888888]">
                {subtitle}
              </div>
            )}
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#F1F1F0] text-[#555555]">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#999999]">
          {label}
        </p>

        <div className="mt-auto pt-3">
          <div className="h-px w-6 bg-[#DCDCDA]" />
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
  const orderItem = latestOrder?.items?.[0];

  const image =
    orderItem?.images?.[0]?.image_url ||
    orderItem?.image_url ||
    orderItem?.primary_image_url ||
    "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[8px] border border-[#E4E4E2] bg-white p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[#171717]">
          Latest Order
        </h3>

        <button
          type="button"
          onClick={onViewOrders}
          className="group flex items-center gap-1 text-[10px] font-medium text-[#111111] underline underline-offset-2"
        >
          View All
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {latestOrder ? (
        <>
          <div className="mt-4 flex items-center gap-3.5">
            <div className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]">
              {image ? (
                <Image
                  src={image}
                  alt={orderItem?.name || "Order item"}
                  fill
                  sizes="86px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-6 w-6 text-[#999999]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="line-clamp-2 text-[13px] font-medium text-[#171717]">
                {orderItem?.name || "Order"}
              </h4>

              <p className="mt-1.5 text-[11px] text-[#888888]">
                Order {latestOrder?.order_reference || "—"} • Placed{" "}
                {latestOrder?.order_date || "—"}
              </p>

              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] ${latestOrder?.status === "confirmed"
                    ? "border-[#CFE0D4] bg-[#F1F7F3] text-[#3F765A]"
                    : "border-[#E4E4E2] bg-[#FAFAF9] text-[#777777]"
                  }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                {latestOrder?.status
                  ? latestOrder.status.charAt(0).toUpperCase() +
                  latestOrder.status.slice(1)
                  : "Pending"}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 border-y border-[#E6E6E4] py-3.5">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#888888]">
                Total
              </p>

              <p className="mt-1 text-[16px] font-semibold text-[#111111]">
                {formatCurrency(latestOrder?.total_payable)}
              </p>
            </div>

            <div className="border-l border-[#E6E6E4] pl-4">
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#888888]">
                Items
              </p>

              <p className="mt-1 text-[16px] font-semibold text-[#171717]">
                {latestOrder?.items?.length || 0}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewOrders}
            className="mt-4 flex h-[38px] w-full items-center justify-center rounded-[6px] text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            Track Order
          </button>
        </>
      ) : (
        <div className="py-8 text-center">
          <Package className="mx-auto h-7 w-7 text-[#C2C2C0]" />

          <p className="mt-3 text-[11px] text-[#888888]">
            You haven&apos;t placed any orders yet.
          </p>
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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return activities.filter((activity) => {
      const activityDate = activity?.created_timestamp
        ? new Date(Number(activity.created_timestamp) * 1000)
        : new Date(activity?.created_at || "");

      if (Number.isNaN(activityDate.getTime())) {
        return true;
      }

      switch (activityFilter) {
        case "today":
          return activityDate >= today;
        case "yesterday":
          return activityDate >= yesterday && activityDate < today;
        case "week":
          return activityDate >= weekAgo;
        case "month":
          return activityDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [activities, activityFilter]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-[18px] font-semibold text-[#171717]">
          Recent Activity
        </h3>

        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          className="rounded-[6px] border border-[#D7D7D5] bg-white px-3 py-1.5 text-[10px] font-medium text-[#555555] outline-none focus:border-[#999999]"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="rounded-[8px] border border-[#E4E4E2] bg-white p-5">
        {filteredActivities.length === 0 ? (
          <div className="flex min-h-[170px] items-center justify-center text-center">
            <div>
              <Package className="mx-auto h-7 w-7 text-[#C2C2C0]" />
              <p className="mt-3 text-[11px] text-[#888888]">
                No recent activity to show.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="max-h-[340px] overflow-y-auto pr-2">
              {filteredActivities.map((activity, index) => {
                const isLast = index === filteredActivities.length - 1;

                return (
                  <motion.div
                    key={
                      activity?.order_reference ||
                      `${activity?.event || "activity"}-${index}`
                    }
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-[56px_20px_1fr_auto] items-start gap-3.5"
                  >
                    <div className="pt-0.5 text-right">
                      <span className="text-[13px] font-medium text-[#171717]">
                        {getActivityTime(
                          activity?.created_timestamp,
                          activity?.created_at,
                        )}
                      </span>
                    </div>

                    <div className="relative flex justify-center">
                      {!isLast && (
                        <div className="absolute left-1/2 top-4 h-[64px] w-px -translate-x-1/2 bg-[#E4E4E2]" />
                      )}

                      <div
                        className="relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 bg-white"
                        style={{ borderColor: BRAND_GREEN }}
                      >
                        <div
                          className="h-1 w-1 rounded-full"
                          style={{ backgroundColor: BRAND_GREEN }}
                        />
                      </div>
                    </div>

                    <div className="pb-6">
                      <p className="text-[12px] font-medium leading-[1.4] text-[#171717]">
                        {activity?.event || "Activity"}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-[#E4E4E2] bg-[#FAFAF9] px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-[#666666]">
                          {activity?.type === "order"
                            ? "Purchase"
                            : activity?.type || "Activity"}
                        </span>

                        {isDistributor && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#EBD9B4] bg-[#FBF3E4] px-2 py-0.5 text-[9px] font-medium text-[#A9711F]">
                            <Coins className="h-2.5 w-2.5" />
                            {activity?.points_earned || 0} Points
                          </span>
                        )}

                        {!isDistributor && activity?.rating && (
                          <span className="text-[9px] tracking-[1px] text-[#111111]">
                            {renderRatingStars(activity.rating)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="whitespace-nowrap pt-0.5 text-right">
                      <span className="text-[9px] text-[#999999]">
                        {getActivityDate(
                          activity?.created_timestamp,
                          activity?.created_at,
                        )}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredActivities.length > 4 && (
              <div className="border-t border-[#E6E6E4] pt-3 text-center text-[9px] text-[#999999]">
                Showing {filteredActivities.length} activities. Scroll to see
                all.
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[18px] font-semibold text-[#171717]">
          <Sparkles className="h-4 w-4 text-[#111111]" />
          Recommended For You
        </h3>

        <Link
          href="/products"
          className="flex items-center gap-1 text-[10px] font-medium text-[#111111] underline underline-offset-2"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white"
            >
              <div className="h-[200px] bg-[#F1F1F0]" />
              <div className="space-y-2.5 p-3.5">
                <div className="h-2.5 w-20 rounded bg-[#EEEEEC]" />
                <div className="h-3.5 w-3/4 rounded bg-[#EEEEEC]" />
                <div className="h-3.5 w-20 rounded bg-[#EEEEEC]" />
                <div className="h-8 rounded-[6px] bg-[#EEEEEC]" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[8px] border border-[#E4E4E2] bg-white px-6 py-14 text-center">
          <Package className="mx-auto h-7 w-7 text-[#C2C2C0]" />
          <p className="mt-3 text-[11px] text-[#888888]">
            No recommendations available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 4).map((product: AnyObject, index: number) => {
            const image =
              product?.primary_image_url ||
              product?.images?.[0]?.image_url ||
              "";

            const price = Number(product?.retail_price ?? product?.price ?? 0);
            const oldPrice = Number(
              product?.distributor_price ?? product?.mrp ?? 0,
            );

            return (
              <motion.div
                key={product?.id || index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => {
                  if (product?.slug) {
                    onProductClick(product.slug);
                  }
                }}
                className="group cursor-pointer overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white transition hover:border-[#CFCFCC]"
              >
                <div className="relative h-[200px] overflow-hidden bg-[#F7F7F6]">
                  {image ? (
                    <Image
                      src={image}
                      alt={product?.name || "Product"}
                      fill
                      className="object-cover p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-12 w-12 text-[#C2C2C0]" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E4E2] bg-white/90 opacity-0 shadow-sm transition group-hover:opacity-100"
                  >
                    <Heart className="h-4 w-4 text-[#111111]" />
                  </button>
                </div>

                <div className="p-3.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#888888]">
                    {product?.category?.name || "Product"}
                  </p>

                  <h4 className="mt-1.5 line-clamp-2 min-h-[32px] text-[13px] font-medium leading-[1.3] text-[#171717]">
                    {product?.name || "Product"}
                  </h4>

                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-[#111111]">
                      {formatCurrency(price)}
                    </p>

                    {oldPrice > price && (
                      <p className="text-[10px] text-[#AAAAAA] line-through">
                        {formatCurrency(oldPrice)}
                      </p>
                    )}
                  </div>

                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="text-[9px] tracking-[1px] text-[#111111]">
                      {renderRatingStars(product?.rating || 0)}
                    </span>
                    <span className="text-[9px] text-[#999999]">
                      ({product?.reviews || 0})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product?.slug) {
                        onProductClick(product.slug);
                      }
                    }}
                    className="mt-3 flex h-[36px] w-full items-center justify-center rounded-[6px] text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition"
                    style={{ backgroundColor: BRAND_GREEN }}
                  >
                    Shop Now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

/* ========================================================================= */
/* PROFILE                                                                   */
/* ========================================================================= */

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { logout } = useLogout();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [activityFilter, setActivityFilter] = useState("all");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as TabType | null;
    if (tab && ALLOWED_TABS.includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.push(`/profile?${params.toString()}`, { scroll: false });
  };

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetDashboardQuery(undefined, { refetchOnMountOrArgChange: true });

  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductsQuery(
      {
        is_published: true,
        per_page: 10,
        page: 1,
        sort_by: "created_at",
        sort_direction: "desc",
      },
      { refetchOnMountOrArgChange: true },
    );

  const { data: userProfileData, isLoading: isUserProfileLoading } =
    useGetUserProfileQuery(undefined, { refetchOnMountOrArgChange: true });

  const apiData = dashboardData?.data;
  const dashboardUser = apiData?.user || {};

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
    userProfileData?.user?.profile_picture ||
    userProfileData?.user?.profile_image ||
    userProfileData?.data?.user?.profile_picture ||
    userProfileData?.data?.user?.profile_image ||
    userProfileData?.data?.profile_picture ||
    userProfileData?.data?.profile_image ||
    dashboardUser?.profile_picture ||
    dashboardUser?.profile_image ||
    "";

  const userName =
    profileUser?.full_name ||
    profileUser?.name ||
    dashboardUser?.full_name ||
    dashboardUser?.name ||
    "";

  const userEmail = profileUser?.email || dashboardUser?.email || "";
  const userAccountType =
    profileUser?.account_type || dashboardUser?.account_type || "customer";

  const memberSince = profileUser?.created_at
    ? new Date(profileUser.created_at).getFullYear().toString()
    : dashboardUser?.member_since || "2026";

  const userData = {
    ...dashboardUser,
    ...profileUser,
    name: userName,
    email: userEmail,
    account_type: userAccountType,
    member_since: memberSince,
    profile_image: profileImage,
  };

  const stats = apiData?.stats || {};
  const latestOrder = apiData?.latest_order || null;
  const recentActivity = apiData?.recent_activity || [];
  const commissionData = apiData?.commission || null;
  const accountType = userData?.account_type || "customer";
  const isDistributor = accountType === "distributor";

  const products =
    productsData?.data?.data || productsData?.data || productsData || [];

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logout({
        redirectTo: "/login",
        callApi: true,
        clearReduxState: true,
        clearPersistedState: true,
        onSuccess: () => {
          dispatch(
            showToast({
              message: "Successfully logged out! See you soon 👋",
              type: "success",
            }),
          );
          setIsLoggingOut(false);
        },
        onError: () => {
          dispatch(
            showToast({ message: "Logout failed. Please try again.", type: "error" }),
          );
          setIsLoggingOut(false);
        },
      });
    } catch {
      dispatch(
        showToast({ message: "Something went wrong. Please try again.", type: "error" }),
      );
      setIsLoggingOut(false);
    }
  };

  const handleProductClick = (slug: string) => {
    if (!slug) {
      router.push("/products");
      return;
    }
    router.push(`/product/${slug}`);
  };


  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F6] font-sans text-[#171717]">
      <DashboardSidebar
        userData={userData}
        stats={stats}
        accountType={accountType}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="z-[100] shrink-0 bg-white">
          <Header
            hideAnnouncement={true}
            cartItems={[]}
            cartCount={stats?.cart_items || 0}
            cartSubtotal={0}
            wishlistCount={stats?.wishlist || 0}
          />
        </div>

        <main className="flex-1 overflow-y-auto bg-[#F7F7F6]">
          {children}
        </main>
      </div>
    </div>
  );

  if (isDashboardLoading || isProductsLoading || isUserProfileLoading) {
    return (
      <Shell>
        <div className="mx-auto max-w-[1230px] animate-pulse px-5 py-8 md:px-8 xl:px-10">
          <div className="h-2.5 w-24 rounded bg-[#E4E4E2]" />
          <div className="mt-4 h-10 w-80 rounded bg-[#E4E4E2]" />
          <div className="mt-3 h-3 w-60 rounded bg-[#EEEEEC]" />

          <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1.55fr]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-[150px] rounded-[8px] bg-white" />
              ))}
            </div>
            <div className="h-[340px] rounded-[8px] bg-white" />
          </div>

          <div className="mt-7 h-[360px] rounded-[8px] bg-white" />

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-[380px] rounded-[8px] bg-white" />
            ))}
          </div>
        </div>
        <Footer />
      </Shell>
    );
  }

  if (isDashboardError) {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <div className="w-full max-w-lg rounded-[8px] border border-[#E4E4E2] bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF2F2]">
              <Package className="h-5 w-5 text-[#B24C4C]" />
            </div>
            <h2 className="mt-4 text-[20px] font-semibold text-[#171717]">
              Failed to Load Dashboard
            </h2>
            <p className="mt-2 text-[12px] text-[#888888]">
              {dashboardError?.data?.message ||
                "Something went wrong. Please try again."}
            </p>
            <button
              type="button"
              onClick={() => refetchDashboard()}
              className="mt-5 rounded-[6px] px-6 py-2.5 text-[11px] font-semibold text-white transition"
              style={{ backgroundColor: BRAND_GREEN }}
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </Shell>
    );
  }

  const renderOverview = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
      className="space-y-6"
    >
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.01em] text-[#111111] sm:text-[26px]">
            Welcome back, {getFirstName(userData?.name)}
          </h1>
          <p className="mt-1.5 text-[12px] text-[#888888]">
            Here&apos;s what&apos;s happening with your account.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-[7px] border border-[#E4E4E2] bg-white px-4 py-2">
          <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#777777]">
            Member since {userData?.member_since || "2026"}
          </span>
        </div>
      </motion.section>

      <section className="grid grid-cols-1 gap-3.5 xl:grid-cols-[1fr_1fr_1.55fr]">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:col-span-2">
          <StatsCard
            value={stats?.total_orders || 0}
            label="Total Orders"
            icon={ShoppingBag}
            subtitle={`${stats?.total_orders > 0 ? "Active orders" : "No orders yet"}`}
          />
          <StatsCard
            value={stats?.wishlist || 0}
            label="Wishlist"
            icon={HeartHandshake}
            subtitle={`${stats?.wishlist > 0 ? "Items saved" : "Start saving"}`}
          />
          <StatsCard
            value={stats?.cart_items || 0}
            label="Cart Items"
            icon={ShoppingBasket}
            subtitle={`${stats?.cart_items > 0 ? "Ready to checkout" : "Cart is empty"}`}
          />
          <StatsCard
            value={
              isDistributor
                ? commissionData?.total_points || stats?.points_earned || 0
                : Number(stats?.average_rating || 0).toFixed(1)
            }
            label={isDistributor ? "Points Earned" : "Your Rating"}
            icon={Award}
            subtitle={
              isDistributor
                ? `${commissionData?.rank?.current_rank || "Bronze"} rank`
                : `${stats?.total_reviews || 0} reviews`
            }
          />
        </div>

        <LatestOrderCard
          latestOrder={latestOrder}
          onViewOrders={() => handleTabChange("orders")}
        />
      </section>

      {Number(stats?.cart_items || 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 rounded-[8px] border border-[#EBD9B4] bg-[#FBF3E4] px-4 py-3.5"
        >
          <ShoppingCart className="h-4 w-4 text-[#A9711F]" />
          <p className="text-[11px] text-[#6B5A38]">
            You have <strong>{stats?.cart_items}</strong> item
            {Number(stats?.cart_items) > 1 ? "s" : ""} in your cart.
          </p>
          <Link
            href="/cart"
            className="ml-auto text-[10px] font-semibold text-[#A9711F] underline underline-offset-2"
          >
            View Cart →
          </Link>
        </motion.div>
      )}

      {isDistributor && commissionData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[8px] border border-[#E4E4E2] bg-white p-5"
        >
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#111111]" />
            <h3 className="text-[16px] font-semibold text-[#171717]">
              Commission & Rewards
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-3">
            <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#888888]">
                Current Rank
              </p>
              <p className="mt-1.5 text-[16px] font-semibold text-[#171717]">
                {commissionData?.rank?.current_rank || "—"}
              </p>
            </div>
            <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#888888]">
                Commission
              </p>
              <p className="mt-1.5 text-[16px] font-semibold text-[#111111]">
                {formatCurrency(commissionData?.commission)}
              </p>
            </div>
            <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#888888]">
                Coins
              </p>
              <p className="mt-1.5 text-[16px] font-semibold text-[#171717]">
                {commissionData?.coins || 0}
              </p>
            </div>
          </div>

          {commissionData?.rank?.progress_percentage !== undefined && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] text-[#888888]">
                  Progress to {commissionData?.rank?.next_rank || "Next Rank"}
                </span>
                <span className="text-[10px] font-semibold text-[#111111]">
                  {commissionData?.rank?.progress_percentage}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#EEEEEC]">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: BRAND_GREEN,
                    width: `${Math.min(
                      100,
                      Math.max(0, Number(commissionData?.rank?.progress_percentage || 0)),
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      <RecentActivity
        activities={recentActivity}
        activityFilter={activityFilter}
        setActivityFilter={setActivityFilter}
        isDistributor={isDistributor}
      />

      <RecommendedProducts
        products={Array.isArray(products) ? products : []}
        isLoading={isProductsLoading}
        onProductClick={handleProductClick}
      />
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "orders":
        return <OrdersPage />;
      case "wishlist":
        return <WishlistComponent />;
      case "address":
        return <AddressComponent />;
      case "settings":
        return <AccountSettings />;
      case "earning":
        return <DistributorStatsPage />;
      default:
        return renderOverview();
    }
  };

  return (
    <Shell>
      <div className="mx-auto w-full max-w-[1230px] px-5 py-8 md:px-8 xl:px-10">
        <div className="mb-6 hidden items-center gap-1.5 lg:flex">
          <Link
            href="/"
            className="flex items-center gap-1 text-[11px] text-[#777777] transition hover:text-[#111111]"
          >
            <Home className="h-3 w-3" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#CCCCCC]" />
          <Link
            href="/profile"
            className="text-[11px] text-[#777777] transition hover:text-[#111111]"
          >
            My Account
          </Link>
          <ChevronRight className="h-3 w-3 text-[#CCCCCC]" />
          <span className="text-[11px] font-medium text-[#111111]">
            {TAB_LABELS[activeTab]}
          </span>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-[8px] border border-[#E4E4E2] bg-white p-4 lg:hidden">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[8px] text-[14px] font-medium text-white"
              style={{ backgroundColor: BRAND_GREEN }}
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
            <div>
              <p className="text-[13px] font-semibold text-[#171717]">
                {userData?.name || "Guest User"}
              </p>
              <p className="text-[10px] text-[#888888]">
                {userData?.email || "guest@email.com"}
              </p>
            </div>
          </div>

          <span className="rounded-full border border-[#E4E4E2] bg-[#FAFAF9] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-[#555555]">
            {isDistributor ? "Distributor" : "Customer"}
          </span>
        </div>

        {renderContent()}
      </div>
    </Shell>
  );
}