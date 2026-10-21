"use client";

import {
  Activity,
  ChevronDown,
  Coins,
  HandCoins,
  Loader2,
  UsersRound,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import Sidebar from "../../../components/Distributor/distributor/Sidebar";

import type {
  DashboardActivity,
  DashboardLatestOrder,
  DashboardStats,
  DashboardUser,
  IgniteDashboard,
} from "@/lib/redux/api/distributor/userDashboardApi";

import { useGetUserDashboardQuery } from "@/lib/redux/api/distributor/userDashboardApi";

// --------------------------------------------------
// Design tokens
// --------------------------------------------------

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";

// --------------------------------------------------
// Font
// --------------------------------------------------

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }

    button {
      -webkit-tap-highlight-color: transparent;
    }
  `}</style>
);

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function toNumber(
  value: number | string | null | undefined
): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(
  value: number | string | null | undefined
): string {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function formatStatus(value?: string | null): string {
  if (!value) return "N/A";

  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

// --------------------------------------------------
// Loader
// --------------------------------------------------

function DashboardLoader() {
  return (
    <div
      suppressHydrationWarning
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="flex min-h-dvh w-full items-center justify-center overflow-hidden bg-white px-4"
    >
      <FontImport />

      <div className="flex flex-col items-center gap-3">
        <Loader2
          className="h-7 w-7 animate-spin"
          style={{ color: NAVY }}
        />

        <p className="text-center text-[13px] font-semibold text-[#667085]">
          Loading dashboard...
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------
// Responsive top statistics cards
// Replaces the previous imported StatsCards layout.
// --------------------------------------------------

function QuickStatsCards({
  cashWallet,
  floatingRetailProfit,
  directReferral,
}: {
  cashWallet: number;
  floatingRetailProfit: number;
  directReferral: number;
}) {
  const cards = [
    {
      label: "Cash Wallet",
      value: cashWallet,
      icon: Coins,
      iconColor: "#00B96B",
      iconBg: "#E6F9EF",
    },
    {
      label: "Floating Retail Profit",
      value: floatingRetailProfit,
      icon: HandCoins,
      iconColor: "#FF963C",
      iconBg: "#FFF1DF",
    },
    {
      label: "Direct Referral",
      value: directReferral,
      icon: UsersRound,
      iconColor: "#4775FF",
      iconBg: "#EDF1FF",
    },
  ];

  return (
    <section className="mt-5 sm:mt-6">
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex min-h-[88px] min-w-0 items-center gap-3 rounded-[14px] border border-[#e7e9ee] bg-white p-3 shadow-[0_1px_3px_rgba(16,24,40,0.08)] transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.18)] sm:min-h-[96px] sm:gap-4 sm:p-4"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-[54px] sm:w-[54px]"
                style={{ backgroundColor: item.iconBg }}
              >
                <Icon
                  size={22}
                  strokeWidth={1.8}
                  style={{ color: item.iconColor }}
                  className="sm:h-6 sm:w-6"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-words text-[12px] font-medium leading-4 text-[#667085] sm:text-[13px] sm:leading-5">
                  {item.label}
                </p>

                <p className="mt-1 break-words text-[20px] font-black leading-tight text-[#101828] sm:text-[23px]">
                  {formatNumber(item.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// --------------------------------------------------
// Dashboard overview
// --------------------------------------------------

function DashboardOverview({
  stats,
}: {
  stats?: DashboardStats;
}) {
  const cards = [
    {
      label: "Total orders",
      value: stats?.total_orders ?? 0,
      color: NAVY,
    },
    {
      label: "Wishlist",
      value: stats?.wishlist ?? 0,
      color: BRASS,
    },
    {
      label: "Points earned",
      value: formatNumber(stats?.points_earned),
      color: EMERALD,
    },
    {
      label: "Reviews",
      value: stats?.reviews ?? 0,
      color: INDIGO,
    },
    {
      label: "Cart items",
      value: stats?.cart_items ?? 0,
      color: NAVY,
    },
    {
      label: "Average rating",
      value: formatNumber(stats?.average_rating),
      color: BRASS,
    },
  ];

  return (
    <section className="mt-6 sm:mt-7">
      <h2 className="mb-3 text-[16px] font-bold text-[#101828] sm:text-[18px]">
        My overview
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        {cards.map((item) => (
          <div
            key={item.label}
            className="min-w-0 rounded-[14px] border border-[#e7e9ee] bg-white p-3.5 transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.18)] sm:p-4"
          >
            <p className="break-words text-[12px] font-semibold leading-4 text-[#667085] sm:text-[13px] sm:leading-5">
              {item.label}
            </p>

            <p
              className="mt-3 break-words text-[23px] font-black leading-tight sm:mt-4 sm:text-[27px]"
              style={{ color: item.color }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// --------------------------------------------------
// Coin card
// --------------------------------------------------

function CoinCard({
  color,
  value,
  label,
}: {
  color: "yellow" | "green" | "blue";
  value: string | number;
  label: string;
}) {
  const styles = {
    yellow: {
      circle: "bg-[#f8f1e4]",
      coin: BRASS,
    },
    green: {
      circle: "bg-[#eaf7f0]",
      coin: EMERALD,
    },
    blue: {
      circle: "bg-[#eceffb]",
      coin: INDIGO,
    },
  };

  const style = styles[color];

  return (
    <div className="flex min-h-[100px] min-w-0 flex-1 flex-col items-center justify-center rounded-[14px] border border-[#e7e9ee] bg-white px-1.5 py-3 transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.15)] sm:min-h-[112px] sm:px-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.circle} sm:h-9 sm:w-9`}
      >
        <div
          className="h-4 w-5 rounded-full ring-2 ring-white sm:h-[18px] sm:w-[22px]"
          style={{ backgroundColor: style.coin }}
        />
      </div>

      <p className="mt-2 text-center text-[18px] font-black leading-tight text-[#101828] sm:text-[22px]">
        {formatNumber(value)}
      </p>

      <p className="mt-1 break-words text-center text-[10px] font-semibold leading-4 text-[#667085] sm:text-[12px]">
        {label}
      </p>
    </div>
  );
}

// --------------------------------------------------
// Coins section
// --------------------------------------------------

function CoinsSection({
  ignite,
}: {
  ignite?: IgniteDashboard | null;
}) {
  return (
    <section className="min-w-0 rounded-[16px] border border-[#e7e9ee] bg-white p-4 sm:p-5">
      <h3 className="text-[15px] font-bold text-[#101828] sm:text-[16px]">
        My coins
      </h3>

      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
        <CoinCard
          color="yellow"
          value={ignite?.yellow_bal ?? "0"}
          label="Yellow coin"
        />

        <CoinCard
          color="green"
          value={ignite?.green_bal ?? "0"}
          label="Green coin"
        />

        <CoinCard
          color="blue"
          value={ignite?.blue_bal ?? "0"}
          label="Blue coin"
        />
      </div>
    </section>
  );
}

// --------------------------------------------------
// Account summary
// --------------------------------------------------

function AccountSummary({
  ignite,
}: {
  ignite?: IgniteDashboard | null;
}) {
  const stats = [
    {
      value: ignite?.rank_no ?? 0,
      label: "Current rank",
      color: BRASS,
    },
    {
      value: ignite?.eligible_rank_no ?? 0,
      label: "Eligible rank",
      color: EMERALD,
    },
    {
      value: ignite?.base_rank_no ?? 0,
      label: "Base rank",
      color: INDIGO,
    },
  ];

  return (
    <section className="min-w-0 rounded-[16px] border border-[#e7e9ee] bg-white p-4 sm:p-5">
      <h3 className="text-[15px] font-bold text-[#101828] sm:text-[16px]">
        My account status
      </h3>

      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="flex min-h-[100px] min-w-0 flex-col items-center justify-center rounded-[14px] border border-[#e7e9ee] bg-white px-1.5 py-3 sm:min-h-[112px] sm:px-2"
          >
            <p
              className="break-words text-center text-[23px] font-black leading-tight sm:text-[26px]"
              style={{ color: item.color }}
            >
              {item.value}
            </p>

            <p className="mt-2 break-words text-center text-[10px] font-semibold leading-4 text-[#667085] sm:text-[12px]">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f2f5] pt-4">
        <span className="text-[12px] font-semibold text-[#667085] sm:text-[12.5px]">
          Membership status
        </span>

        <span
          className={`max-w-full break-words rounded-full px-3 py-1 text-[11px] font-bold ${
            ignite?.membership_status?.toLowerCase() === "active"
              ? "bg-[#eaf7f0] text-[#1f9d6b]"
              : "bg-[#f2f4f7] text-[#667085]"
          }`}
        >
          {formatStatus(ignite?.membership_status)}
        </span>
      </div>
    </section>
  );
}

// --------------------------------------------------
// Account details table
// --------------------------------------------------

function AccountTable({
  ignite,
}: {
  ignite?: IgniteDashboard | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const isActive =
    ignite?.membership_status?.toLowerCase() === "active";

  const details = [
    {
      label: "Placement leg",
      value: ignite?.placement_leg ?? "N/A",
      color: NAVY,
    },
    {
      label: "Total steps",
      value: ignite?.total_steps ?? 0,
      color: INDIGO,
    },
    {
      label: "Left CV",
      value: formatNumber(ignite?.total_cv_left),
      color: EMERALD,
    },
    {
      label: "Right CV",
      value: formatNumber(ignite?.total_cv_right),
      color: BRASS,
    },
    {
      label: "Floating CV left",
      value: formatNumber(ignite?.floating_cv_left),
      color: INDIGO,
    },
    {
      label: "Floating CV right",
      value: formatNumber(ignite?.floating_cv_right),
      color: BRASS,
    },
    {
      label: "CV left",
      value: formatNumber(ignite?.cv_left),
      color: EMERALD,
    },
    {
      label: "CV right",
      value: formatNumber(ignite?.cv_right),
      color: NAVY,
    },
    {
      label: "Base rank",
      value: ignite?.base_rank_no ?? 0,
      color: INDIGO,
    },
    {
      label: "Eligible rank",
      value: ignite?.eligible_rank_no ?? 0,
      color: EMERALD,
    },
    {
      label: "Qualified at",
      value: ignite?.qualified_at ?? "N/A",
      color: NAVY,
    },
    {
      label: "Member ID",
      value: ignite?.member_id ?? "N/A",
      color: BRASS,
    },
  ];

  return (
    <section className="min-w-0 rounded-[16px] border border-[#e7e9ee] bg-white p-4 sm:p-5">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <h3 className="min-w-0 text-[15px] font-bold text-[#101828] sm:text-[16px]">
          My account
        </h3>

        <span className="shrink-0 rounded-full bg-[#EAF3FF] px-2.5 py-1 text-[10px] font-bold text-[#3955A6] sm:px-3 sm:text-[11px]">
          {ignite?.is_placed ? "Placed" : "Account details"}
        </span>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(28px,0.55fr)_minmax(0,1fr)_24px] items-center gap-1 border-b border-[#e7e9ee] pb-3 sm:gap-2">
          <span className="min-w-0 break-words text-[9px] font-bold uppercase tracking-wide text-[#8a92a6] sm:text-[11px]">
            Account ID
          </span>

          <span className="min-w-0 break-words text-[9px] font-bold uppercase tracking-wide text-[#8a92a6] sm:text-[11px]">
            Rank
          </span>

          <span className="min-w-0 break-words text-[9px] font-bold uppercase tracking-wide text-[#8a92a6] sm:text-[11px]">
            Status
          </span>

          <span aria-hidden="true" />
        </div>

        {ignite ? (
          <div className="flex min-w-0 flex-col">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((prev) => !prev)}
              className="group grid min-h-12 min-w-0 w-full grid-cols-[minmax(0,1.25fr)_minmax(28px,0.55fr)_minmax(0,1fr)_24px] items-center gap-1 rounded-[8px] text-left transition-colors hover:bg-[#f7f8fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3955A6]/30 sm:gap-2"
            >
              <span className="min-w-0 break-all pr-1 text-[11px] font-semibold text-[#101828] sm:text-[12px]">
                {ignite.ba_id || "N/A"}
              </span>

              <span className="min-w-0 break-words text-[12px] font-semibold text-[#3955A6] sm:text-[13px]">
                {ignite.rank_no ?? 0}
              </span>

              <span
                className={`flex min-w-0 items-center gap-1 text-[10px] font-semibold sm:gap-2 sm:text-[12px] ${
                  isActive ? "text-[#1f9d6b]" : "text-[#667085]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    isActive ? "bg-[#1f9d6b]" : "bg-[#98a2b3]"
                  }`}
                />

                <span className="min-w-0 break-words">
                  {formatStatus(ignite.membership_status)}
                </span>
              </span>

              <span className="flex w-6 items-center justify-center text-[#8a92a6]">
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    expanded
                      ? "rotate-180 text-[#0E1B3D]"
                      : "group-hover:text-[#0E1B3D]"
                  }`}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-[12px] border border-[#eef0f4] bg-[#f9fafb] p-3 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] sm:p-4">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-x-4">
                      {details.map((item) => (
                        <div
                          key={item.label}
                          className="min-w-0"
                        >
                          <p className="break-words text-[9px] font-semibold uppercase leading-4 tracking-wide text-[#8a92a6] sm:text-[10.5px]">
                            {item.label}
                          </p>

                          <p
                            className="mt-1 break-words text-[12px] font-bold sm:text-[13px]"
                            style={{ color: item.color }}
                          >
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <p className="py-6 text-center text-[13px] text-[#667085]">
            Account information is not available.
          </p>
        )}
      </div>
    </section>
  );
}

// --------------------------------------------------
// Recent activity
// Max 2 visible items; scroll when more are available.
// --------------------------------------------------

const MAX_VISIBLE_ACTIVITY = 2;
const ACTIVITY_ITEM_HEIGHT = 72;

function RecentActivity({
  activity,
}: {
  activity: DashboardActivity[];
}) {
  const hasOverflow = activity.length > MAX_VISIBLE_ACTIVITY;

  return (
    <section className="min-w-0 rounded-[16px] border border-[#e7e9ee] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Activity
          size={17}
          className="shrink-0"
          style={{ color: NAVY }}
        />

        <h3 className="text-[15px] font-bold text-[#101828] sm:text-[16px]">
          Recent activity
        </h3>
      </div>

      {activity.length > 0 ? (
        <div
          className={`mt-3 ${
            hasOverflow
              ? "overflow-y-auto pr-1 [scrollbar-width:thin]"
              : ""
          }`}
          style={
            hasOverflow
              ? {
                  maxHeight: `${
                    MAX_VISIBLE_ACTIVITY * ACTIVITY_ITEM_HEIGHT
                  }px`,
                }
              : undefined
          }
        >
          {activity.map((item, index) => (
            <div
              key={`${item.type}-${item.created_timestamp}-${index}`}
              className={`flex min-w-0 gap-3 py-3 ${
                index !== activity.length - 1
                  ? "border-b border-[#f0f2f5]"
                  : ""
              }`}
            >
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-[#3955A6]">
                <Activity size={15} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-words text-[12px] font-semibold leading-5 text-[#101828] sm:text-[12.5px]">
                  {item.event}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="max-w-full break-words rounded-full bg-[#f2f4f7] px-2 py-0.5 text-[9px] font-bold uppercase text-[#667085] sm:text-[10px]">
                    {formatStatus(item.type)}
                  </span>

                  <span className="break-words text-[10px] text-[#8a92a6] sm:text-[11px]">
                    {item.created_at}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-[13px] text-[#667085]">
          No recent activity found.
        </p>
      )}
    </section>
  );
}

// --------------------------------------------------
// Latest order
// --------------------------------------------------

function LatestOrderSection({
  order,
}: {
  order: DashboardLatestOrder | null;
}) {
  const reference =
    order?.order_reference ||
    order?.order_number ||
    order?.reference;

  return (
    <section className="min-w-0 rounded-[16px] border border-[#e7e9ee] bg-white p-4 sm:p-5">
      <h3 className="text-[15px] font-bold text-[#101828] sm:text-[16px]">
        Latest order
      </h3>

      {order ? (
        <div className="mt-4 space-y-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#8a92a6]">
              Order reference
            </p>

            <p className="mt-1 break-all text-[12px] font-bold text-[#101828] sm:text-[13px]">
              {reference || "Order details available"}
            </p>
          </div>

          {order.status && (
            <div>
              <p className="text-[11px] font-semibold text-[#8a92a6]">
                Order status
              </p>

              <p className="mt-1 break-words text-[12px] font-semibold text-[#1f9d6b] sm:text-[13px]">
                {formatStatus(order.status)}
              </p>
            </div>
          )}

          {order.total_amount !== undefined && (
            <div>
              <p className="text-[11px] font-semibold text-[#8a92a6]">
                Order amount
              </p>

              <p className="mt-1 break-words text-[15px] font-black text-[#101828]">
                ₹{formatNumber(order.total_amount)}
              </p>
            </div>
          )}

          {order.created_at && (
            <p className="break-words text-[11px] text-[#8a92a6]">
              {order.created_at}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-[12px] bg-[#f7f8fa] px-3 py-6 text-center sm:px-4">
          <p className="text-[13px] font-semibold text-[#667085]">
            No orders placed yet.
          </p>

          <p className="mt-1 text-[11px] text-[#98a2b3]">
            Your latest order will appear here.
          </p>
        </div>
      )}
    </section>
  );
}

// --------------------------------------------------
// CV filters
// Responsive controls; existing labels and selections kept.
// --------------------------------------------------

function CvFilters() {
  const fieldClass =
    "flex h-11 min-w-0 w-full items-center justify-between gap-2 rounded-[10px] border border-[#e5e9ef] bg-[#f7f8fa] px-3 text-left text-[12px] text-[#101828] transition-colors hover:border-[#0E1B3D]/40 focus:border-[#0E1B3D] focus:outline-none focus:ring-2 focus:ring-[#0E1B3D]/10 sm:px-4 sm:text-[13px]";

  return (
    <div className="mt-5 min-w-0">
      <div className="grid min-w-0 grid-cols-1 items-end gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-[1.1fr_1.25fr_.4fr_auto]">
        <div className="min-w-0">
          <label className="mb-2 block text-[12px] font-semibold text-[#5a6276] sm:text-[13px]">
            TC account
          </label>

          <button type="button" className={fieldClass}>
            <span className="min-w-0 flex-1 truncate">
              TC-001
            </span>

            <ChevronDown
              size={16}
              className="shrink-0 text-[#98a2b3]"
            />
          </button>
        </div>

        <div className="min-w-0">
          <label className="mb-2 block text-[12px] font-semibold text-[#5a6276] sm:text-[13px]">
            Week
          </label>

          <button type="button" className={fieldClass}>
            <span className="min-w-0 flex-1 truncate">
              Week 34 (22 Aug – 28 Aug 2026)
            </span>

            <ChevronDown
              size={16}
              className="shrink-0 text-[#98a2b3]"
            />
          </button>
        </div>

        <div className="min-w-0">
          <label className="mb-2 block text-[12px] font-semibold text-[#5a6276] sm:text-[13px]">
            Year
          </label>

          <button type="button" className={fieldClass}>
            <span className="min-w-0 flex-1 truncate">
              2026
            </span>

            <ChevronDown
              size={16}
              className="shrink-0 text-[#98a2b3]"
            />
          </button>
        </div>

        <button
          type="button"
          className="h-11 w-full min-w-0 rounded-[10px] px-5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E1B3D]/30 focus-visible:ring-offset-2 sm:text-[13.5px] xl:w-auto xl:min-w-[90px]"
          style={{ backgroundColor: NAVY }}
        >
          Search
        </button>
      </div>
    </div>
  );
}

// --------------------------------------------------
// Main dashboard
// --------------------------------------------------

export default function DistributorDashboardPage() {
  const router = useRouter();
  const redirectLock = useRef(false);

  const [authStatus, setAuthStatus] = useState<
    "checking" | "authorized" | "redirecting"
  >("checking");

  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  // --------------------------------------------------
  // Distributor authentication
  // --------------------------------------------------

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;
    if (redirectLock.current) return;

    redirectLock.current = true;

    const distributorToken =
      localStorage.getItem("distributor_token");

    const authToken = localStorage.getItem("auth_token");

    const rawUserType =
      localStorage.getItem("user_type") || "";

    const isLoggedIn =
      localStorage.getItem("is_logged_in");

    const userType = rawUserType.trim().toLowerCase();

    const hasDistributorSession =
      Boolean(distributorToken) ||
      (Boolean(authToken) && userType === "distributor") ||
      (userType === "distributor" && isLoggedIn === "true");

    if (hasDistributorSession) {
      setAuthStatus("authorized");
      return;
    }

    setAuthStatus("redirecting");

    router.replace("/auth/distributor/login/");
  }, [router, mounted]);

  // --------------------------------------------------
  // Dashboard API
  // Fetch only after the distributor is authorized.
  // --------------------------------------------------

  const {
    data: dashboardResponse,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetUserDashboardQuery(undefined, {
    skip: !mounted || authStatus !== "authorized",
    refetchOnMountOrArgChange: true,
  });

  const dashboard = dashboardResponse?.data;

  const user: DashboardUser | undefined = dashboard?.user;

  const stats = dashboard?.stats;

  const ignite: IgniteDashboard | null | undefined =
    dashboard?.ignite;

  const activity: DashboardActivity[] =
    dashboard?.recent_activity ?? [];

  // Keep server and first client render consistent.
  if (!mounted || authStatus !== "authorized" || isLoading) {
    return <DashboardLoader />;
  }

  return (
    <div
      suppressHydrationWarning
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-white"
    >
      <FontImport />

      <DashboardHeader distributorId={ignite?.ba_id || "N/A"} />

      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Sidebar />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#f7f8fa] px-3 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-6 lg:px-8">
          <div className="mx-auto w-full min-w-0 max-w-[1600px]">
            {/* Page heading */}
            <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="min-w-0 w-full sm:w-auto">
                <h1 className="break-words text-[24px] font-black leading-tight tracking-[-0.01em] text-[#101828] sm:text-[28px]">
                  Dashboard
                </h1>

                <p className="mt-1 break-words text-[12px] leading-5 text-[#667085] sm:text-[14px]">
                  {user?.name
                    ? `Welcome, ${user.name}`
                    : "Welcome"}
                  {user?.email ? ` · ${user.email}` : ""}
                </p>
              </div>

              <div className="inline-flex max-w-full flex-wrap items-center rounded-full border border-[#e7e9ee] bg-white px-3.5 py-2 text-[11px] font-bold leading-4 text-[#3955A6] sm:text-[12px]">
                <span>
                  {formatStatus(
                    user?.account_type || "distributor"
                  )}
                </span>

                {user?.member_since && (
                  <span>
                    {" "}
                    · Since {user.member_since}
                  </span>
                )}
              </div>
            </div>

            {/* API error */}
            {isError && (
              <div
                role="alert"
                className="mt-5 flex min-w-0 flex-col items-start gap-3 rounded-[12px] border border-[#f2c6c3] bg-[#fff4f3] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
              >
                <p className="break-words text-[12px] font-semibold leading-5 text-[#b42318] sm:text-[13px]">
                  Unable to load the dashboard data. Please try
                  again.
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="shrink-0 rounded-lg bg-white px-3 py-2 text-[12px] font-bold text-[#b42318] ring-1 ring-[#f2c6c3]"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Responsive top statistics */}
            <QuickStatsCards
              cashWallet={toNumber(ignite?.cash_bal)}
              floatingRetailProfit={0}
              directReferral={0}
            />

            {/* User overview statistics */}
            <DashboardOverview stats={stats} />

            {/* Latest order and recent activity */}
            <section className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
              <LatestOrderSection
                order={dashboard?.latest_order ?? null}
              />

              <RecentActivity activity={activity} />
            </section>

            {/* CV counter */}
            <section className="mt-7 min-w-0 sm:mt-8">
              <h2 className="text-[18px] font-bold text-[#101828] sm:text-[20px]">
                CV counter
              </h2>

              <CvFilters />

              <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:mt-6 sm:gap-5 xl:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
                  <CoinsSection ignite={ignite} />

                  <AccountSummary ignite={ignite} />
                </div>

                <AccountTable ignite={ignite} />
              </div>
            </section>

            {/* Refresh indicator */}
            {isFetching && !isLoading && (
              <div className="mt-4 flex items-center justify-end gap-2 text-[11px] font-semibold text-[#667085]">
                <Loader2 size={13} className="animate-spin" />

                <span>Updating dashboard...</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}