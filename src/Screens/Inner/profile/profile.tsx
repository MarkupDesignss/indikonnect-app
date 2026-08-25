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
  | "overview"
  | "orders"
  | "wishlist"
  | "address"
  | "settings"
  | "earning";

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
/* CONSTANTS                                                                 */
/* ========================================================================= */

const HEADER_HEIGHT = 96;

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
    Math.min(5, Math.floor(Number(rating) || 0))
  );

  return (
    "★".repeat(value) +
    "☆".repeat(Math.max(0, 5 - value))
  );
};

const getActivityTime = (
  timestamp: any,
  createdAt?: string
) => {
  if (timestamp) {
    return new Date(
      Number(timestamp) * 1000
    ).toLocaleTimeString([], {
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

const getActivityDate = (
  timestamp: any,
  createdAt?: string
) => {
  if (timestamp) {
    return new Date(
      Number(timestamp) * 1000
    ).toLocaleDateString("en-IN", {
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

  const isDistributor =
    accountType === "distributor";

  const menuItems = useMemo(() => {
    const items = [
      {
        label: "Overview",
        tab: "overview" as TabType,
        count: null,
      },
      {
        label: "My Orders",
        tab: "orders" as TabType,
        count: stats?.total_orders || 0,
      },
      {
        label: "Wishlist",
        tab: "wishlist" as TabType,
        count: stats?.wishlist || 0,
      },
      {
        label: "Manage Address",
        tab: "address" as TabType,
        count: null,
      },
      {
        label: "Account Settings",
        tab: "settings" as TabType,
        count: null,
      },
    ];

    if (isDistributor) {
      items.push({
        label: "Earnings",
        tab: "earning" as TabType,
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
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-[150] flex h-11 w-11 items-center justify-center rounded-xl bg-[#071a41] text-white shadow-xl lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[145] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          w-[262px]
          border-r
          border-[#E7DBC0]/60
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
          lg:inset-y-auto
          lg:left-auto
          lg:z-auto
          lg:w-[262px]
          lg:flex-shrink-0
          lg:translate-x-0
          lg:self-start
          lg:overflow-visible
        `}
        style={{
          top: `${HEADER_HEIGHT}px`,
        }}
      >
        <div className="flex flex-col">
          <div className="flex justify-end px-5 pt-5 lg:hidden">
            <button
              type="button"
              onClick={() =>
                setMobileOpen(false)
              }
              className="rounded-full p-2 text-[#8a7f6e] hover:bg-[#FBF6EC]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 pb-5 pt-6 lg:pt-8">
            <div className="flex items-center gap-3">
              {/* Profile Image or Initials */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#071a41] text-[15px] font-medium text-white">
                {userData?.profile_image ? (
                  <img
                    src={userData.profile_image}
                    alt={
                      userData?.name ||
                      "User"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(
                    userData?.name
                  )
                )}
              </div>

              <div className="min-w-0">
                <p
                  className="truncate text-[15px] font-semibold text-[#2B2420]"
                  style={{
                    fontFamily:
                      "Jost, sans-serif",
                  }}
                >
                  {userData?.name ||
                    "Guest User"}
                </p>

                <p
                  className="truncate text-[10px] text-[#8a7f6e]"
                  style={{
                    fontFamily:
                      "Jost, sans-serif",
                  }}
                >
                  {userData?.email ||
                    "guest@email.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px bg-[#EFE6D3]" />

          {/* RATING / TYPE */}
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-current text-[#2B2420]" />

              <span
                className="text-[11px] text-[#8a7f6e]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                {Number(
                  stats?.average_rating ||
                    0
                ).toFixed(1)}
              </span>
            </div>

            <div className="h-4 w-px bg-[#E7DBC0]" />

            <span
              className="rounded-full border border-[#CFE0DA] bg-[#F4F8F5] px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#477A72]"
              style={{
                fontFamily:
                  "Jost, sans-serif",
              }}
            >
              {isDistributor
                ? "Distributor"
                : "Customer"}
            </span>
          </div>

          {/* NAVIGATION */}
          <div className="px-4">

            <div className="space-y-1">
              {menuItems.map((item) => {
                const active =
                  activeTab === item.tab;

                return (
                  <button
                    key={item.tab}
                    type="button"
                    onClick={() =>
                      handleTabClick(
                        item.tab
                      )
                    }
                    className={`
                      group
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-[13px]
                      px-4
                      py-3
                      text-left
                      transition-all
                      duration-200

                      ${
                        active
                          ? "bg-[#071a41] text-white shadow-[0_8px_18px_rgba(26,26,46,0.14)]"
                          : "text-black hover:bg-[#FBF6EC] hover:text-[#2B2420]"
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`
                          h-1.5
                          w-1.5
                          rounded-full

                          ${
                            active
                              ? "bg-[#7FD7CB]"
                              : "bg-[#B8B0A4]"
                          }
                        `}
                      />

                      <span
                        className="text-[12px] font-medium"
                        style={{
                          fontFamily:
                            "Jost, sans-serif",
                        }}
                      >
                        {item.label}
                      </span>
                    </span>

                    {item.count !== null && (
                      <span
                        className={`
                          min-w-[34px]
                          rounded-full
                          px-2
                          py-1
                          text-center
                          text-[10px]

                          ${
                            active
                              ? "bg-white/10 text-white"
                              : "bg-[#EEF1EE] text-[#7F847D]"
                          }
                        `}
                        style={{
                          fontFamily:
                            "Jost, sans-serif",
                        }}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACCOUNT */}
          <div className="mx-6 mt-5 border-t border-[#EFE6D3] pt-4">
            <p
              className="px-3 pb-2 text-[8px] uppercase tracking-[0.30em] text-[#A19A8E]"
              style={{
                fontFamily:
                  "Jost, sans-serif",
              }}
            >
              Account
            </p>

            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-[#B85F59] transition-all hover:bg-[#FFF7F5]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#D18680]" />

              <span
                className="text-[12px] font-medium"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                {isLoggingOut
                  ? "Logging Out..."
                  : "Log Out"}
              </span>

              <LogOut className="ml-auto h-3.5 w-3.5 opacity-60" />
            </button>
          </div>

          {/* SPACE */}
          <div className="h-14" />

          {/* PREMIUM */}
          <div className="px-[18px] pb-7">
            <div className="relative overflow-hidden rounded-[17px] bg-[#071a41] px-5 py-5 shadow-[0_14px_35px_rgba(26,26,46,0.20)]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#C9A227]/20 blur-2xl" />

              <div className="relative z-10">
                <p
                  className="text-[9px] font-medium text-[#C9A227]"
                  style={{
                    fontFamily:
                      "Jost, sans-serif",
                  }}
                >
                  ✨ Premium Benefits
                </p>

                <h4
                  className="mt-3 max-w-[165px] text-[13px] leading-[1.45] text-white"
                  style={{
                    fontFamily:
                      "Jost, sans-serif",
                  }}
                >
                  Unlock exclusive rewards &
                  offers
                </h4>

                <button
                  type="button"
                  className="mt-4 flex h-[35px] w-full items-center justify-center rounded-full bg-white text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1A1A2E] transition hover:bg-[#FBF8F2]"
                  style={{
                    fontFamily:
                      "Jost, sans-serif",
                  }}
                >
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


function StatsCard({
  value,
  label,
  icon: Icon,
  color = "#24887C",
  subtitle,
}: {
  value: any;
  label: string;
  icon: React.ElementType;
  color?: string;
  subtitle?: string;
}) {
  const [isHovered, setIsHovered] =
    useState(false);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.3 },
      }}
      onHoverStart={() =>
        setIsHovered(true)
      }
      onHoverEnd={() =>
        setIsHovered(false)
      }
      className="group relative min-h-[169px] cursor-pointer overflow-hidden rounded-[20px] border border-[#E7DBC0]/70 bg-white p-6 shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(43,36,32,0.15)]"
    >
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${color}15, transparent 70%)`,
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.4 }}
      />

      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full border-2 border-dashed opacity-10"
        style={{
          borderColor: color,
        }}
      />

      <div
        className="absolute -right-4 -top-4 h-14 w-14 rounded-full border-2 border-dashed opacity-10"
        style={{
          borderColor: color,
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div
              className="text-[43px] font-light leading-none text-[#2B2420]"
              style={{
                fontFamily:
                  "Cormorant Garamond, Georgia, serif",
              }}
            >
              {value}
            </div>

            {subtitle && (
              <div
                className="mt-2 text-[14px] font-medium text-[#8a7f6e]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                {subtitle}
              </div>
            )}
          </div>

          <motion.div
            className="rounded-full p-2.5 shadow-sm"
            style={{
              backgroundColor:
                `${color}15`,
              border: `1px solid ${color}25`,
            }}
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <Icon
              className="h-5 w-5"
              style={{
                color,
              }}
            />
          </motion.div>
        </div>

        <p
          className="mt-2 text-[10px] uppercase tracking-[0.28em] text-[#8a7f6e]"
          style={{
            fontFamily:
              "Jost, sans-serif",
          }}
        >
          {label}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <motion.div
            className="h-px"
            style={{
              width: isHovered
                ? "60px"
                : "29px",
              backgroundColor: color,
            }}
            animate={{
              width: isHovered
                ? 60
                : 29,
            }}
            transition={{
              duration: 0.4,
            }}
          />

          <motion.div
            className="h-1 w-1 rounded-full"
            style={{
              backgroundColor: color,
            }}
            animate={{
              scale: isHovered
                ? 1.5
                : 1,
              opacity:
                isHovered
                  ? 1
                  : 0.3,
            }}
          />
        </div>

        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[20px]"
          animate={{
            boxShadow: isHovered
              ? `inset 0 0 30px ${color}15`
              : "none",
          }}
          transition={{
            duration: 0.4,
          }}
        />
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

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-[20px] border border-[#E7DBC0]/70 bg-white p-6 shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)]"
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-[19px] font-semibold text-[#2B2420]"
          style={{
            fontFamily:
              "Cormorant Garamond, Georgia, serif",
          }}
        >
          Latest Order
        </h3>

        <button
          type="button"
          onClick={onViewOrders}
          className="group flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.18em] text-[#C9A227]"
          style={{
            fontFamily:
              "Jost, sans-serif",
          }}
        >
          View All
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {latestOrder ? (
        <>
          <div className="mt-5 flex items-center gap-4">
            <div className="relative h-[103px] w-[103px] shrink-0 overflow-hidden rounded-[16px] bg-[#E8EDE9]">
              {image ? (
                <Image
                  src={image}
                  alt={
                    orderItem?.name ||
                    "Order item"
                  }
                  fill
                  sizes="103px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-8 w-8 text-[#A7AEA9]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4
                className="line-clamp-2 text-[18px] leading-[1.1] text-[#2B2420]"
                style={{
                  fontFamily:
                    "Cormorant Garamond, Georgia, serif",
                }}
              >
                {orderItem?.name ||
                  "Order"}
              </h4>

              <p
                className="mt-2 text-[12px] text-[#8a7f6e]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                Order{" "}
                {latestOrder?.order_reference ||
                  "—"}{" "}
                • Placed{" "}
                {latestOrder?.order_date ||
                  "—"}
              </p>

              <span
                className={`
                  mt-2
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-3
                  py-1
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.16em]

                  ${
                    latestOrder?.status ===
                    "confirmed"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : "border-[#E7DBC0] bg-[#FBF6EC] text-[#92403F]"
                  }
                `}
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                {latestOrder?.status
                  ? latestOrder.status
                      .charAt(0)
                      .toUpperCase() +
                    latestOrder.status.slice(
                      1
                    )
                  : "Pending"}
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 border-y border-[#EFE6D3] py-4">
            <div>
              <p
                className="text-[12px] uppercase tracking-[0.20em] text-[#8a7f6e]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                Total
              </p>

              <p
                className="mt-1 text-[21px] font-medium text-[#24887C]"
                style={{
                  fontFamily:
                    "Cormorant Garamond, Georgia, serif",
                }}
              >
                {formatCurrency(
                  latestOrder?.total_payable
                )}
              </p>
            </div>

            <div className="border-l border-[#EFE6D3] pl-4">
              <p
                className="text-[12px] uppercase tracking-[0.20em] text-[#8a7f6e]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                Items
              </p>

              <p
                className="mt-1 text-[21px] font-medium text-[#2B2420]"
                style={{
                  fontFamily:
                    "Cormorant Garamond, Georgia, serif",
                }}
              >
                {latestOrder?.items?.length ||
                  0}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewOrders}
            className="mt-5 flex h-[40px] w-full items-center justify-center rounded-full bg-[#071a41] text-[9px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#071a40]"
            style={{
              fontFamily:
                "Jost, sans-serif",
            }}
          >
            Track Order
          </button>
        </>
      ) : (
        <div className="py-10 text-center">
          <Package className="mx-auto h-8 w-8 text-[#B9AEA0]" />

          <p
            className="mt-3 text-[12px] text-[#8a7f6e]"
            style={{
              fontFamily:
                "Jost, sans-serif",
            }}
          >
            You haven&apos;t placed
            any orders yet.
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
  setActivityFilter: (
    value: string
  ) => void;
  isDistributor: boolean;
}) {
  const filteredActivities =
    useMemo(() => {
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
        now.getDate()
      );

      const yesterday =
        new Date(today);

      yesterday.setDate(
        yesterday.getDate() - 1
      );

      const weekAgo =
        new Date(today);

      weekAgo.setDate(
        weekAgo.getDate() - 7
      );

      const monthAgo =
        new Date(today);

      monthAgo.setMonth(
        monthAgo.getMonth() - 1
      );

      return activities.filter(
        (activity) => {
          const activityDate =
            activity?.created_timestamp
              ? new Date(
                  Number(
                    activity.created_timestamp
                  ) * 1000
                )
              : new Date(
                  activity?.created_at ||
                    ""
                );

          if (
            Number.isNaN(
              activityDate.getTime()
            )
          ) {
            return true;
          }

          switch (
            activityFilter
          ) {
            case "today":
              return (
                activityDate >= today
              );

            case "yesterday":
              return (
                activityDate >=
                  yesterday &&
                activityDate < today
              );

            case "week":
              return (
                activityDate >= weekAgo
              );

            case "month":
              return (
                activityDate >=
                monthAgo
              );

            default:
              return true;
          }
        }
      );
    }, [
      activities,
      activityFilter,
    ]);

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="text-[24px] font-semibold text-[#2B2420]"
          style={{
            fontFamily:
              "Cormorant Garamond, Georgia, serif",
          }}
        >
          Recent Activity
        </h3>

        <select
          value={activityFilter}
          onChange={(e) =>
            setActivityFilter(
              e.target.value
            )
          }
          className="rounded-full border border-[#E7DBC0] bg-white px-4 py-2 text-[8px] uppercase tracking-[0.18em] text-[#8a7f6e] outline-none focus:border-[#C9A227]"
          style={{
            fontFamily:
              "Jost, sans-serif",
          }}
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

      <div className="rounded-[20px] border border-[#E7DBC0]/70 bg-white p-6 shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)]">
        {filteredActivities.length ===
        0 ? (
          <div className="flex min-h-[190px] items-center justify-center text-center">
            <div>
              <Package className="mx-auto h-8 w-8 text-[#B9AEA0]" />

              <p
                className="mt-3 text-[12px] text-[#8a7f6e]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                No recent activity
                to show.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="max-h-[350px] overflow-y-auto pr-2">
              {filteredActivities.map(
                (
                  activity,
                  index
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
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.06,
                      }}
                      className="grid grid-cols-[60px_24px_1fr_auto] items-start gap-4"
                    >
                      <div className="pt-1 text-right">
                        <span
                          className="text-[18px] font-light text-[#2B2420]"
                          style={{
                            fontFamily:
                              "Cormorant Garamond, Georgia, serif",
                          }}
                        >
                          {getActivityTime(
                            activity?.created_timestamp,
                            activity?.created_at
                          )}
                        </span>
                      </div>

                      <div className="relative flex justify-center">
                        {!isLast && (
                          <div className="absolute left-1/2 top-4 h-[74px] w-px -translate-x-1/2 bg-[#E7DBC0]" />
                        )}

                        <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#17766C] bg-white">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#17766C]" />
                        </div>
                      </div>

                      <div className="pb-7">
                        <p
                          className="text-[12px] font-medium leading-[1.45] text-[#2B2420]"
                          style={{
                            fontFamily:
                              "Jost, sans-serif",
                          }}
                        >
                          {activity?.event ||
                            "Activity"}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-full border border-[#D7E5E1] bg-[#F4F8F5] px-3 py-1 text-[7px] uppercase tracking-[0.20em] text-[#477A72]"
                            style={{
                              fontFamily:
                                "Jost, sans-serif",
                            }}
                          >
                            {activity?.type ===
                            "order"
                              ? "Purchase"
                              : activity?.type ||
                                "Activity"}
                          </span>

                          {isDistributor && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-[#FFF8E0] px-2.5 py-1 text-[7px] uppercase tracking-[0.15em] text-[#A07C13]"
                              style={{
                                fontFamily:
                                  "Jost, sans-serif",
                              }}
                            >
                              <Coins className="h-2.5 w-2.5" />

                              {activity?.points_earned ||
                                0}{" "}
                              Points
                            </span>
                          )}

                          {!isDistributor &&
                            activity?.rating && (
                              <span className="text-[9px] tracking-[1px] text-[#C9A227]">
                                {renderRatingStars(
                                  activity.rating
                                )}
                              </span>
                            )}
                        </div>
                      </div>

                      <div className="whitespace-nowrap pt-1 text-right">
                        <span
                          className="text-[8px] text-[#8a7f6e]"
                          style={{
                            fontFamily:
                              "Jost, sans-serif",
                          }}
                        >
                          {getActivityDate(
                            activity?.created_timestamp,
                            activity?.created_at
                          )}
                        </span>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </div>

            {filteredActivities.length >
              4 && (
              <div
                className="border-t border-[#EFE6D3] pt-3 text-center text-[8px] text-[#8a7f6e]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                Showing{" "}
                {
                  filteredActivities.length
                }{" "}
                activities. Scroll to see
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
  onProductClick: (
    slug: string
  ) => void;
}) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <h3
          className="flex items-center gap-2 text-[24px] font-semibold text-[#2B2420]"
          style={{
            fontFamily:
              "Cormorant Garamond, Georgia, serif",
          }}
        >
          <Sparkles className="h-4 w-4 fill-current text-[#2B2420]" />
          Recommended For You
        </h3>

        <Link
          href="/products"
          className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.18em] text-[#C9A227] transition hover:text-[#92403F]"
          style={{
            fontFamily:
              "Jost, sans-serif",
          }}
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-[16px] border border-[#E7DBC0]/60 bg-white"
              >
                <div className="h-[225px] bg-[#EFEAE0]" />

                <div className="space-y-3 p-4">
                  <div className="h-2.5 w-20 rounded bg-[#E4DED2]" />
                  <div className="h-4 w-3/4 rounded bg-[#E4DED2]" />
                  <div className="h-4 w-20 rounded bg-[#E4DED2]" />
                  <div className="h-9 rounded-full bg-[#E4DED2]" />
                </div>
              </div>
            )
          )}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[20px] border border-[#E7DBC0]/70 bg-white px-6 py-14 text-center">
          <Package className="mx-auto h-8 w-8 text-[#B9AEA0]" />

          <p
            className="mt-3 text-[12px] text-[#8a7f6e]"
            style={{
              fontFamily:
                "Jost, sans-serif",
            }}
          >
            No recommendations
            available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {products
            .slice(0, 4)
            .map(
              (
                product: AnyObject,
                index: number
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
                      0
                  );

                const oldPrice =
                  Number(
                    product?.distributor_price ??
                      product?.mrp ??
                      0
                  );

                return (
                  <motion.div
                    key={
                      product?.id ||
                      index
                    }
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        index * 0.07,
                    }}
                    onClick={() => {
                      if (
                        product?.slug
                      ) {
                        onProductClick(
                          product.slug
                        );
                      }
                    }}
                    className="group cursor-pointer overflow-hidden rounded-[16px] border border-[#E7DBC0]/70 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(43,36,32,0.08)]"
                  >
                    <div className="relative h-[225px] overflow-hidden bg-[#F0EEE8]">
                      {image ? (
                        <Image
                          src={image}
                          alt={
                            product?.name ||
                            "Product"
                          }
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-14 w-14 text-[#C2BCB0]" />
                        </div>
                      )}

                      <div className="absolute left-3 top-3">
                        <span
                          className="rounded-sm border border-[#E4E0D5] bg-white/95 px-3 py-2 text-[7px] uppercase tracking-[0.18em] text-[#557E76] shadow-sm"
                          style={{
                            fontFamily:
                              "Jost, sans-serif",
                          }}
                        >
                          Quick View
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm transition group-hover:opacity-100"
                      >
                        <Heart className="h-4 w-4 text-[#2B2420]" />
                      </button>
                    </div>

                    <div className="p-4">
                      <p
                        className="text-[8px] uppercase tracking-[0.22em] text-[#8a7f6e]"
                        style={{
                          fontFamily:
                            "Jost, sans-serif",
                        }}
                      >
                        {product?.category
                          ?.name ||
                          "Product"}
                      </p>

                      <h4
                        className="mt-2 min-h-[36px] line-clamp-2 text-[17px] font-semibold leading-[1.1] text-[#2B2420]"
                        style={{
                          fontFamily:
                            "Cormorant Garamond, Georgia, serif",
                        }}
                      >
                        {product?.name ||
                          "Product"}
                      </h4>

                      <div className="mt-3 flex items-center gap-2">
                        <p
                          className="text-[18px] font-medium text-[#2B2420]"
                          style={{
                            fontFamily:
                              "Cormorant Garamond, Georgia, serif",
                          }}
                        >
                          {formatCurrency(
                            price
                          )}
                        </p>

                        {oldPrice >
                          price && (
                          <p
                            className="text-[10px] text-[#B0AAA0] line-through"
                            style={{
                              fontFamily:
                                "Jost, sans-serif",
                            }}
                          >
                            {formatCurrency(
                              oldPrice
                            )}
                          </p>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-[9px] tracking-[1px] text-[#C9A227]">
                          {renderRatingStars(
                            product?.rating ||
                              0
                          )}
                        </span>

                        <span
                          className="text-[8px] text-[#8a7f6e]"
                          style={{
                            fontFamily:
                              "Jost, sans-serif",
                          }}
                        >
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
                              product.slug
                            );
                          }
                        }}
                        className="mt-3 flex h-[38px] w-full items-center justify-center rounded-full bg-[#071a41] text-[8px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#071a40]"
                        style={{
                          fontFamily:
                            "Jost, sans-serif",
                        }}
                      >
                        Shop Now
                      </button>
                    </div>
                  </motion.div>
                );
              }
            )}
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

  const [activeTab, setActiveTab] =
    useState<TabType>("overview");

  const [
    activityFilter,
    setActivityFilter,
  ] = useState("all");

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* URL                                                                     */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
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

  const handleTabChange = (
    tab: TabType
  ) => {
    setActiveTab(tab);

    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    params.set("tab", tab);

    router.push(
      `/profile?${params.toString()}`,
      {
        scroll: false,
      }
    );
  };

  /* ---------------------------------------------------------------------- */
  /* DASHBOARD                                                              */
  /* ---------------------------------------------------------------------- */

  const {
    data: dashboardData,
    isLoading:
      isDashboardLoading,
    isError:
      isDashboardError,
    error:
      dashboardError,
    refetch:
      refetchDashboard,
  } = useGetDashboardQuery(
    undefined,
    {
      refetchOnMountOrArgChange:
        true,
    }
  );

  /* ---------------------------------------------------------------------- */
  /* PRODUCTS                                                               */
  /* ---------------------------------------------------------------------- */

  const {
    data: productsData,
    isLoading:
      isProductsLoading,
  } = useGetProductsQuery(
    {
      is_published: true,
      per_page: 10,
      page: 1,
      sort_by:
        "created_at",
      sort_direction:
        "desc",
    },
    {
      refetchOnMountOrArgChange:
        true,
    }
  );

  /* ---------------------------------------------------------------------- */
  /* USER PROFILE                                                           */
  /* ---------------------------------------------------------------------- */

  const {
    data: userProfileData,
    isLoading:
      isUserProfileLoading,
  } = useGetUserProfileQuery(
    undefined,
    {
      refetchOnMountOrArgChange:
        true,
    }
  );

  /* ---------------------------------------------------------------------- */
  /* DATA                                                                   */
  /* ---------------------------------------------------------------------- */

  const apiData =
    dashboardData?.data;

  const dashboardUser =
    apiData?.user || {};

  /*
   * Supports:
   *
   * { user: {...} }
   * { data: { user: {...} } }
   * { data: {...} }
   * { ... }
   */

  const profileUser =
    userProfileData?.user ||
    userProfileData?.data?.user ||
    userProfileData?.data ||
    userProfileData ||
    {};

  const profileImage =
    profileUser?.profile_picture ||
    profileUser?.profile_image ||
    profileUser?.user
      ?.profile_picture ||
    profileUser?.user
      ?.profile_image ||
    userProfileData?.user
      ?.profile_picture ||
    userProfileData?.user
      ?.profile_image ||
    userProfileData?.data
      ?.user?.profile_picture ||
    userProfileData?.data
      ?.user?.profile_image ||
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
          profileUser.created_at
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

  console.log(
    "========== PROFILE DEBUG =========="
  );
  console.log(
    "FULL PROFILE API:",
    userProfileData
  );
  console.log(
    "PROFILE USER:",
    profileUser
  );
  console.log(
    "PROFILE PICTURE:",
    profileImage
  );
  console.log(
    "FINAL USER DATA:",
    userData
  );
  console.log(
    "==================================="
  );

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

  /* ---------------------------------------------------------------------- */
  /* LOGOUT                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleLogout =
    async () => {
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

          onSuccess: () => {
            dispatch(
              showToast({
                message:
                  "Successfully logged out! See you soon 👋",
                type: "success",
              })
            );

            setIsLoggingOut(
              false
            );
          },

          onError: () => {
            dispatch(
              showToast({
                message:
                  "Logout failed. Please try again.",
                type: "error",
              })
            );

            setIsLoggingOut(
              false
            );
          },
        });
      } catch {
        dispatch(
          showToast({
            message:
              "Something went wrong. Please try again.",
            type: "error",
          })
        );

        setIsLoggingOut(
          false
        );
      }
    };

  /* ---------------------------------------------------------------------- */
  /* PRODUCT CLICK                                                          */
  /* ---------------------------------------------------------------------- */

  const handleProductClick = (
    slug: string
  ) => {
    if (!slug) {
      router.push(
        "/products"
      );
      return;
    }

    router.push(
      `/product/${slug}`
    );
  };

  /* ---------------------------------------------------------------------- */
  /* LOADING                                                                */
  /* ---------------------------------------------------------------------- */

  if (
    isDashboardLoading ||
    isProductsLoading ||
    isUserProfileLoading
  ) {
    return (
      <div className="min-h-screen bg-[#FBF8F2]">
        <div className="sticky top-0 z-[100] bg-white">
          <Header
            cartItems={[]}
            cartCount={0}
            cartSubtotal={0}
            wishlistCount={0}
          />
        </div>

        <div className="flex items-start">
          <div className="hidden w-[262px] flex-shrink-0 bg-white lg:block">
            <div className="min-h-[900px]" />
          </div>

          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-[1230px] animate-pulse px-5 py-8 md:px-8 xl:px-10">
              <div className="h-2.5 w-24 rounded bg-[#E7DBC0]" />

              <div className="mt-4 h-12 w-80 rounded bg-[#E7DBC0]" />

              <div className="mt-3 h-3 w-60 rounded bg-[#EFE6D3]" />

              <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1.55fr]">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-2">
                  {[1, 2, 3, 4].map(
                    (item) => (
                      <div
                        key={item}
                        className="h-[169px] rounded-[20px] bg-white"
                      />
                    )
                  )}
                </div>

                <div className="h-[360px] rounded-[20px] bg-white" />
              </div>

              <div className="mt-7 h-[390px] rounded-[20px] bg-white" />

              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-[420px] rounded-[16px] bg-white"
                    />
                  )
                )}
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* ERROR                                                                  */
  /* ---------------------------------------------------------------------- */

  if (
    isDashboardError
  ) {
    return (
      <div className="min-h-screen bg-[#FBF8F2]">
        <div className="sticky top-0 z-[100] bg-white">
          <Header
            cartItems={[]}
            cartCount={0}
            cartSubtotal={0}
            wishlistCount={0}
          />
        </div>

        <div className="flex items-start">
          <div className="hidden w-[262px] flex-shrink-0 bg-white lg:block">
            <div className="min-h-[650px]" />
          </div>

          <main className="flex min-h-[650px] flex-1 items-center justify-center px-5 py-10">
            <div className="w-full max-w-lg rounded-[22px] border border-[#E7DBC0] bg-white p-8 text-center shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4F1]">
                <Package className="h-6 w-6 text-[#B85F59]" />
              </div>

              <h2
                className="mt-4 text-[28px] font-semibold text-[#2B2420]"
                style={{
                  fontFamily:
                    "Cormorant Garamond, Georgia, serif",
                }}
              >
                Failed to Load Dashboard
              </h2>

              <p
                className="mt-2 text-[12px] text-[#8a7f6e]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                {dashboardError?.data
                  ?.message ||
                  "Something went wrong. Please try again."}
              </p>

              <button
                type="button"
                onClick={() =>
                  refetchDashboard()
                }
                className="mt-5 rounded-full bg-[#2B2420] px-7 py-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#92403F]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                Retry
              </button>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    );
  }

  /* ========================================================================= */
  /* OVERVIEW                                                                 */
  /* ========================================================================= */

  const renderOverview =
    () => (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren:
                0.06,
            },
          },
        }}
        className="space-y-7"
      >
        {/* WELCOME */}
        <motion.section
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h1
              className="text-[34px] font-semibold leading-none text-[#2B2420] md:text-[35px]"
              style={{
                fontFamily:
                  "Cormorant Garamond, Georgia, serif",
              }}
            >
              Welcome back,{" "}
              {getFirstName(
                userData?.name
              )}
            </h1>

            <p
              className="mt-2 text-[12px] text-[#8a7f6e]"
              style={{
                fontFamily:
                  "Jost, sans-serif",
              }}
            >
              Here&apos;s what&apos;s happening
              with your account.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#E7DBC0] bg-white px-5 py-2.5 shadow-[0_2px_8px_rgba(43,36,32,0.04)]">
            <span
              className="text-[8px] uppercase tracking-[0.35em] text-[#C9A227]"
              style={{
                fontFamily:
                  "Jost, sans-serif",
              }}
            >
              MEMBER SINCE{" "}
              {userData?.member_since ||
                "2026"}
            </span>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1.55fr]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-2">
            <StatsCard
              value={
                stats?.total_orders ||
                0
              }
              label="Total Orders"
              icon={ShoppingBag}
              color="#24887C"
              subtitle={`${
                stats?.total_orders > 0
                  ? "Active orders"
                  : "No orders yet"
              }`}
            />

            <StatsCard
              value={
                stats?.wishlist ||
                0
              }
              label="Wishlist"
              icon={HeartHandshake}
              color="#C9A227"
              subtitle={`${
                stats?.wishlist > 0
                  ? "Items saved"
                  : "Start saving"
              }`}
            />

            <StatsCard
              value={
                stats?.cart_items ||
                0
              }
              label="Cart Items"
              icon={ShoppingBasket}
              color="#92403F"
              subtitle={`${
                stats?.cart_items > 0
                  ? "Ready to checkout"
                  : "Cart is empty"
              }`}
            />

            <StatsCard
              value={
                isDistributor
                  ? commissionData?.total_points ||
                    stats?.points_earned ||
                    0
                  : Number(
                      stats?.average_rating ||
                        0
                    ).toFixed(1)
              }
              label={
                isDistributor
                  ? "Points Earned"
                  : "Your Rating"
              }
              icon={Award}
              color="#8B6B4D"
              subtitle={
                isDistributor
                  ? `${
                      commissionData?.rank
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
                "orders"
              )
            }
          />
        </section>

        {/* CART */}
        {Number(
          stats?.cart_items || 0
        ) > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="flex flex-wrap items-center gap-3 rounded-[16px] border border-[#FDCB00]/30 bg-[#FFF9E8] px-5 py-4"
          >
            <ShoppingCart className="h-5 w-5 text-[#C9A227]" />

            <p
              className="text-[11px] text-[#5E574A]"
              style={{
                fontFamily:
                  "Jost, sans-serif",
              }}
            >
              You have{" "}
              <strong>
                {stats?.cart_items}
              </strong>{" "}
              item
              {Number(
                stats?.cart_items
              ) > 1
                ? "s"
                : ""}{" "}
              in your cart.
            </p>

            <Link
              href="/cart"
              className="ml-auto text-[9px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]"
              style={{
                fontFamily:
                  "Jost, sans-serif",
              }}
            >
              View Cart →
            </Link>
          </motion.div>
        )}

        {/* DISTRIBUTOR */}
        {isDistributor &&
          commissionData && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-[20px] border border-[#E7DBC0]/70 bg-white p-6 shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)]"
            >
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-[#C9A227]" />

                <h3
                  className="text-[20px] font-semibold text-[#2B2420]"
                  style={{
                    fontFamily:
                      "Cormorant Garamond, Georgia, serif",
                  }}
                >
                  Commission & Rewards
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-[14px] bg-[#FBF6EC] p-4">
                  <p
                    className="text-[8px] uppercase tracking-[0.18em] text-[#8a7f6e]"
                    style={{
                      fontFamily:
                        "Jost, sans-serif",
                    }}
                  >
                    Current Rank
                  </p>

                  <p
                    className="mt-2 text-[20px] text-[#2B2420]"
                    style={{
                      fontFamily:
                        "Cormorant Garamond, Georgia, serif",
                    }}
                  >
                    {commissionData
                      ?.rank
                      ?.current_rank ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-[14px] bg-[#FBF6EC] p-4">
                  <p
                    className="text-[8px] uppercase tracking-[0.18em] text-[#8a7f6e]"
                    style={{
                      fontFamily:
                        "Jost, sans-serif",
                    }}
                  >
                    Commission
                  </p>

                  <p
                    className="mt-2 text-[20px] text-[#C9A227]"
                    style={{
                      fontFamily:
                        "Cormorant Garamond, Georgia, serif",
                    }}
                  >
                    {formatCurrency(
                      commissionData?.commission
                    )}
                  </p>
                </div>

                <div className="rounded-[14px] bg-[#FBF6EC] p-4">
                  <p
                    className="text-[8px] uppercase tracking-[0.18em] text-[#8a7f6e]"
                    style={{
                      fontFamily:
                        "Jost, sans-serif",
                    }}
                  >
                    Coins
                  </p>

                  <p
                    className="mt-2 text-[20px] text-[#2B2420]"
                    style={{
                      fontFamily:
                        "Cormorant Garamond, Georgia, serif",
                    }}
                  >
                    {commissionData?.coins ||
                      0}
                  </p>
                </div>
              </div>

              {commissionData?.rank
                ?.progress_percentage !==
                undefined && (
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className="text-[9px] text-[#8a7f6e]"
                      style={{
                        fontFamily:
                          "Jost, sans-serif",
                      }}
                    >
                      Progress to{" "}
                      {commissionData
                        ?.rank
                        ?.next_rank ||
                        "Next Rank"}
                    </span>

                    <span
                      className="text-[9px] font-semibold text-[#C9A227]"
                      style={{
                        fontFamily:
                          "Jost, sans-serif",
                      }}
                    >
                      {
                        commissionData
                          ?.rank
                          ?.progress_percentage
                      }
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#EEE8DB]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FDCB00] to-[#C9A227]"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            Number(
                              commissionData
                                ?.rank
                                ?.progress_percentage ||
                                0
                            )
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
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
            Array.isArray(products)
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
  /* TABS                                                                     */
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

      default:
        return renderOverview();
    }
  };

  /* ========================================================================= */
  /* FINAL LAYOUT                                                             */
  /* ========================================================================= */

  return (
    <div
      className="min-h-screen bg-[#FBF8F2] text-[#2B2420]"
      style={{
        ["--header-height" as any]: `${HEADER_HEIGHT}px`,
      }}
    >
      {/* HEADER */}
      <div className="sticky top-0 z-[100] bg-white">
        <Header
          cartItems={[]}
          cartCount={
            stats?.cart_items || 0
          }
          cartSubtotal={0}
          wishlistCount={
            stats?.wishlist || 0
          }
        />
      </div>

      {/* SIDEBAR + MAIN */}
      <div className="flex items-start">
        {/* SIDEBAR */}
        <DashboardSidebar
          userData={userData}
          stats={stats}
          accountType={
            accountType
          }
          activeTab={activeTab}
          onTabChange={
            handleTabChange
          }
          onLogout={
            handleLogout
          }
          isLoggingOut={
            isLoggingOut
          }
        />

        {/* MAIN */}
        <main className="min-w-0 flex-1 bg-[#FBF8F2]">
          <div className="mx-auto w-full max-w-[1230px] px-5 py-8 md:px-8 xl:px-10">
            {/* Breadcrumb */}
            <div className="mb-6 hidden items-center gap-2 lg:flex">
              <Link
                href="/"
                className="flex items-center gap-1 text-[12px] text-[#8a7f6e] transition hover:text-[#C9A227]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                <Home className="h-3 w-3" />
                Home
              </Link>

              <ChevronRight className="h-3 w-3 text-[#B7AD9D]" />

              <Link
                href="/profile"
                className="text-[12px] text-[#8a7f6e] transition hover:text-[#C9A227]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                My Account
              </Link>

              <ChevronRight className="h-3 w-3 text-[#B7AD9D]" />

              <span
                className="text-[12px] font-medium text-[#2B2420]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                {
                  TAB_LABELS[
                    activeTab
                  ]
                }
              </span>
            </div>

            {/* MOBILE USER */}
            <div className="mb-6 flex items-center justify-between rounded-[17px] border border-[#E7DBC0]/70 bg-white p-4 lg:hidden">
              <div className="flex items-center gap-3">
                {/* Mobile Profile Image or Initials */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#24887C] text-[15px] font-medium text-white">
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
                      userData?.name
                    )
                  )}
                </div>

                <div>
                  <p
                    className="text-[13px] font-semibold text-[#2B2420]"
                    style={{
                      fontFamily:
                        "Jost, sans-serif",
                    }}
                  >
                    {userData?.name ||
                      "Guest User"}
                  </p>

                  <p
                    className="text-[8px] text-[#8a7f6e]"
                    style={{
                      fontFamily:
                        "Jost, sans-serif",
                    }}
                  >
                    {userData?.email ||
                      "guest@email.com"}
                  </p>
                </div>
              </div>

              <span
                className="rounded-full border border-[#D7E3DC] bg-[#F5F8F5] px-3 py-1 text-[7px] uppercase tracking-[0.16em] text-[#4F776F]"
                style={{
                  fontFamily:
                    "Jost, sans-serif",
                }}
              >
                {isDistributor
                  ? "Distributor"
                  : "Customer"}
              </span>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}