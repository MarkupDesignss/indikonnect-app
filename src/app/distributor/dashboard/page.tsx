"use client";

import {
  Activity,
  ChevronDown,
  Coins,
  HandCoins,
  Loader2,
  ShoppingBag,
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

// Shared surface classes - NO SHADOW, JUST BORDER
const CARD =
  "min-w-0 rounded-[18px] border border-[#e7e9ee] bg-white";
const CARD_HOVER =
  "transition-colors duration-200 hover:border-[#d1d5df] motion-reduce:transition-none";

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

    .thin-scroll::-webkit-scrollbar {
      width: 5px;
    }

    .thin-scroll::-webkit-scrollbar-thumb {
      background: #d5d9e2;
      border-radius: 999px;
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
// Section title
// --------------------------------------------------

function SectionTitle({
  children,
  large = false,
}: {
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="h-5 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: BRASS }}
      />

      <h2
        className={`font-black tracking-[-0.01em] text-[#101828] ${
          large
            ? "text-[18px] sm:text-[20px]"
            : "text-[16px] sm:text-[18px]"
        }`}
      >
        {children}
      </h2>
    </div>
  );
}

// --------------------------------------------------
// Loader
// --------------------------------------------------

function DashboardLoader() {
  return (
    <div
      suppressHydrationWarning
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#f5f6fa] px-4"
    >
      <FontImport />

      <div className="flex flex-col items-center gap-3 rounded-[18px] border border-[#e7e9ee] bg-white px-8 py-7">
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
// Welcome hero — soft light version, flat & clean
// --------------------------------------------------

function WelcomeHero({
  user,
  distributorId,
}: {
  user?: DashboardUser;
  distributorId: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[20px] border border-[#e7e9ee] bg-white p-5 sm:p-6"
    >
      {/* Soft decorative glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full opacity-[0.06] blur-2xl"
        style={{ backgroundColor: BRASS }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full opacity-[0.05] blur-2xl"
        style={{ backgroundColor: INDIGO }}
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: Welcome details */}
        <div className="min-w-0 flex-1">
          <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-full border border-[#e7e9ee] bg-[#fafbfc] px-3 py-1 text-[11px] font-bold leading-4 text-[#3955A6] sm:text-[12px]">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: INDIGO }}
            />
            <span>{formatStatus(user?.account_type || "distributor")}</span>
          </div>

          <h1 className="mt-3 break-words text-[20px] font-black leading-tight tracking-[-0.02em] text-[#101828] sm:text-[24px]">
            {user?.name ? `Welcome back, ${user.name}` : "Welcome back"}
          </h1>

          <p className="mt-1.5 break-all text-[12px] leading-5 text-[#667085] sm:text-[13px]">
            {user?.email ? user.email : "Your distributor dashboard"}
          </p>
        </div>

        {/* Right side: Distributor ID */}
        <div className="flex shrink-0 flex-col items-start sm:items-end">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a92a6]">
            Distributor ID
          </span>
          <span className="mt-0.5 break-all text-[16px] font-black text-[#101828] sm:text-[18px]">
            {distributorId}
          </span>
        </div>
      </div>
    </motion.section>
  );
}

// --------------------------------------------------
// Responsive top statistics cards
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
    <section className="mt-4 sm:mt-5">
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`${CARD} ${CARD_HOVER} group flex min-h-[92px] items-center gap-3 p-3.5 sm:min-h-[100px] sm:gap-4 sm:p-4`}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none sm:h-[54px] sm:w-[54px]"
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
                <p className="break-words text-[12px] font-semibold leading-4 text-[#667085] sm:text-[13px] sm:leading-5">
                  {item.label}
                </p>

                <p className="mt-1 break-words text-[21px] font-black leading-tight tracking-[-0.01em] text-[#101828] sm:text-[24px]">
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
// Dashboard overview (Side accent lines, flat cards)
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
      tint: "#eef0f6",
    },
    {
      label: "Wishlist",
      value: stats?.wishlist ?? 0,
      color: BRASS,
      tint: "#f8f1e4",
    },
    {
      label: "Points earned",
      value: formatNumber(stats?.points_earned),
      color: EMERALD,
      tint: "#eaf7f0",
    },
    {
      label: "Reviews",
      value: stats?.reviews ?? 0,
      color: INDIGO,
      tint: "#eceffb",
    },
    {
      label: "Cart items",
      value: stats?.cart_items ?? 0,
      color: NAVY,
      tint: "#eef0f6",
    },
    {
      label: "Average rating",
      value: formatNumber(stats?.average_rating),
      color: BRASS,
      tint: "#f8f1e4",
    },
  ];

  return (
    <section className="mt-6 sm:mt-7">
      <div className="mb-3 sm:mb-4">
        <SectionTitle>My overview</SectionTitle>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        {cards.map((item) => (
          <div
            key={item.label}
            className={`${CARD} ${CARD_HOVER} relative overflow-hidden p-3.5 pl-4 sm:p-4 sm:pl-5`}
          >
            {/* Side accent bar */}
            <span
              aria-hidden="true"
              className="absolute inset-y-3 left-0 w-[3px] rounded-r-md"
              style={{ backgroundColor: item.color }}
            />

            <p className="break-words text-[12px] font-semibold leading-4 text-[#667085] sm:text-[13px] sm:leading-5">
              {item.label}
            </p>

            <p
              className="mt-3 inline-block max-w-full break-words rounded-[10px] px-2.5 py-1 text-[22px] font-black leading-tight sm:mt-4 sm:text-[26px]"
              style={{ color: item.color, backgroundColor: item.tint }}
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
      bg: "from-[#fffaf0]",
      coin: BRASS,
    },
    green: {
      circle: "bg-[#eaf7f0]",
      bg: "from-[#f4fbf7]",
      coin: EMERALD,
    },
    blue: {
      circle: "bg-[#eceffb]",
      bg: "from-[#f5f7fd]",
      coin: INDIGO,
    },
  };

  const style = styles[color];

  return (
    <div
      className={`flex min-h-[104px] min-w-0 flex-1 flex-col items-center justify-center rounded-[14px] border border-[#e7e9ee] bg-gradient-to-b ${style.bg} to-white px-1.5 py-3 sm:min-h-[116px] sm:px-3 ${CARD_HOVER}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.circle} sm:h-10 sm:w-10`}
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
    <section className={`${CARD} p-4 sm:p-5`}>
      <SectionTitle>My coins</SectionTitle>

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
      tint: "#f8f1e4",
    },
    {
      value: ignite?.eligible_rank_no ?? 0,
      label: "Eligible rank",
      color: EMERALD,
      tint: "#eaf7f0",
    },
    {
      value: ignite?.base_rank_no ?? 0,
      label: "Base rank",
      color: INDIGO,
      tint: "#eceffb",
    },
  ];

  const left = toNumber(ignite?.total_cv_left);
  const right = toNumber(ignite?.total_cv_right);
  const total = left + right;
  const leftPct = total > 0 ? (left / total) * 100 : 50;

  const isActive =
    ignite?.membership_status?.toLowerCase() === "active";

  return (
    <section className={`${CARD} p-4 sm:p-5`}>
      <SectionTitle>My account status</SectionTitle>

      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="flex min-h-[100px] min-w-0 flex-col items-center justify-center rounded-[14px] px-1.5 py-3 sm:min-h-[112px] sm:px-2"
            style={{ backgroundColor: item.tint }}
          >
            <p
              className="break-words text-center text-[24px] font-black leading-tight sm:text-[28px]"
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

      {/* CV balance bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold sm:text-[12px]">
          <span className="min-w-0 break-words" style={{ color: EMERALD }}>
            Left CV · {formatNumber(left)}
          </span>

          <span className="min-w-0 break-words text-right" style={{ color: BRASS }}>
            Right CV · {formatNumber(right)}
          </span>
        </div>

        <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-[#f0f2f5]">
          <div
            className="h-full transition-all duration-700 motion-reduce:transition-none"
            style={{ width: `${leftPct}%`, backgroundColor: EMERALD }}
          />

          <div
            className="h-full flex-1"
            style={{ backgroundColor: BRASS }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f2f5] pt-4">
        <span className="text-[12px] font-semibold text-[#667085] sm:text-[12.5px]">
          Membership status
        </span>

        <span
          className={`inline-flex max-w-full items-center gap-1.5 break-words rounded-full px-3 py-1 text-[11px] font-bold ${
            isActive
              ? "bg-[#eaf7f0] text-[#1f9d6b]"
              : "bg-[#f2f4f7] text-[#667085]"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isActive ? "bg-[#1f9d6b]" : "bg-[#98a2b3]"
            }`}
          />

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
    <section className={`${CARD} self-start p-4 sm:p-5`}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <SectionTitle>My account</SectionTitle>

        <span className="shrink-0 rounded-full bg-[#EAF3FF] px-2.5 py-1 text-[10px] font-bold text-[#3955A6] sm:px-3 sm:text-[11px]">
          {ignite?.is_placed ? "Placed" : "Account details"}
        </span>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(28px,0.55fr)_minmax(0,1fr)_24px] items-center gap-1 rounded-[10px] bg-[#f7f8fa] px-2 py-2.5 sm:gap-2 sm:px-3">
          <span className="min-w-0 break-words text-[10px] font-bold text-[#8a92a6] sm:text-[11.5px]">
            Account ID
          </span>

          <span className="min-w-0 break-words text-[10px] font-bold text-[#8a92a6] sm:text-[11.5px]">
            Rank
          </span>

          <span className="min-w-0 break-words text-[10px] font-bold text-[#8a92a6] sm:text-[11.5px]">
            Status
          </span>

          <span aria-hidden="true" />
        </div>

        {ignite ? (
          <div className="mt-1 flex min-w-0 flex-col">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((prev) => !prev)}
              className="group grid min-h-14 w-full min-w-0 grid-cols-[minmax(0,1.25fr)_minmax(28px,0.55fr)_minmax(0,1fr)_24px] items-center gap-1 rounded-[10px] px-2 text-left transition-colors hover:bg-[#f7f8fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3955A6]/30 sm:gap-2 sm:px-3"
            >
              <span className="min-w-0 break-all pr-1 text-[11px] font-bold text-[#101828] sm:text-[12.5px]">
                {ignite.ba_id || "N/A"}
              </span>

              <span className="min-w-0 break-words text-[12px] font-bold text-[#3955A6] sm:text-[13px]">
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
                  className={`transition-transform duration-300 motion-reduce:transition-none ${
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
                  <div className="mt-2 rounded-[14px] border border-[#eef0f4] bg-[#f9fafb] p-3 sm:p-4">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3 sm:gap-x-4">
                      {details.map((item) => (
                        <div
                          key={item.label}
                          className="min-w-0 rounded-[10px] border border-[#eef0f4] bg-white px-3 py-2.5"
                        >
                          <p className="break-words text-[10px] font-semibold leading-4 text-[#8a92a6] sm:text-[11px]">
                            {item.label}
                          </p>

                          <p
                            className="mt-1 break-words text-[12.5px] font-bold sm:text-[13.5px]"
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
// --------------------------------------------------

const MAX_VISIBLE_ACTIVITY = 2;
const ACTIVITY_ITEM_HEIGHT = 76;

function RecentActivity({
  activity,
}: {
  activity: DashboardActivity[];
}) {
  const hasOverflow = activity.length > MAX_VISIBLE_ACTIVITY;

  return (
    <section className={`${CARD} p-4 sm:p-5`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="h-5 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: BRASS }}
          />

          <h3 className="text-[15px] font-black text-[#101828] sm:text-[16px]">
            Recent activity
          </h3>
        </div>

        <Activity
          size={17}
          className="shrink-0"
          style={{ color: NAVY }}
        />
      </div>

      {activity.length > 0 ? (
        <div
          className={`thin-scroll mt-3 ${
            hasOverflow ? "overflow-y-auto pr-1" : ""
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
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#EAF3FF] text-[#3955A6]">
                <Activity size={15} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-words text-[12px] font-semibold leading-5 text-[#101828] sm:text-[12.5px]">
                  {item.event}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="max-w-full break-words rounded-full bg-[#f2f4f7] px-2 py-0.5 text-[10px] font-bold text-[#667085]">
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
        <div className="mt-4 rounded-[14px] bg-[#f7f8fa] px-3 py-6 text-center">
          <p className="text-[13px] font-semibold text-[#667085]">
            No recent activity found.
          </p>
        </div>
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
    <section className={`${CARD} p-4 sm:p-5`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="h-5 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: BRASS }}
          />

          <h3 className="text-[15px] font-black text-[#101828] sm:text-[16px]">
            Latest order
          </h3>
        </div>

        <ShoppingBag
          size={17}
          className="shrink-0"
          style={{ color: NAVY }}
        />
      </div>

      {order ? (
        <div className="mt-4 space-y-4">
          <div className="min-w-0 rounded-[14px] bg-[#f7f8fa] p-3.5">
            <p className="text-[11px] font-semibold text-[#8a92a6]">
              Order reference
            </p>

            <p className="mt-1 break-all text-[13px] font-bold text-[#101828] sm:text-[14px]">
              {reference || "Order details available"}
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
            {order.total_amount !== undefined && (
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#8a92a6]">
                  Order amount
                </p>

                <p className="mt-1 break-words text-[22px] font-black leading-none text-[#101828]">
                  ₹{formatNumber(order.total_amount)}
                </p>
              </div>
            )}

            {order.status && (
              <span className="inline-flex max-w-full items-center gap-1.5 break-words rounded-full bg-[#eaf7f0] px-3 py-1 text-[11px] font-bold text-[#1f9d6b]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1f9d6b]" />
                {formatStatus(order.status)}
              </span>
            )}
          </div>

          {order.created_at && (
            <p className="break-words border-t border-[#f0f2f5] pt-3 text-[11px] text-[#8a92a6]">
              {order.created_at}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-[14px] bg-[#f7f8fa] px-3 py-7 text-center sm:px-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <ShoppingBag size={18} className="text-[#98a2b3]" />
          </div>

          <p className="mt-3 text-[13px] font-semibold text-[#667085]">
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
// --------------------------------------------------

function CvFilters() {
  const fieldClass =
    "flex h-11 min-w-0 w-full items-center justify-between gap-2 rounded-[12px] border border-[#e5e9ef] bg-white px-3 text-left text-[12px] text-[#101828] transition-colors hover:border-[#0E1B3D]/40 focus:border-[#0E1B3D] focus:outline-none focus:ring-2 focus:ring-[#0E1B3D]/10 sm:px-4 sm:text-[13px]";

  return (
    <div className={`${CARD} mt-4 p-4 sm:p-5`}>
      <div className="grid min-w-0 grid-cols-1 items-end gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-[1.1fr_1.25fr_.4fr_auto]">
        <div className="min-w-0">
          <label className="mb-2 block text-[12px] font-semibold text-[#5a6276] sm:text-[13px]">
            TC account
          </label>

          <button type="button" className={fieldClass}>
            <span className="min-w-0 flex-1 truncate">TC-001</span>

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
            <span className="min-w-0 flex-1 truncate">2026</span>

            <ChevronDown
              size={16}
              className="shrink-0 text-[#98a2b3]"
            />
          </button>
        </div>

        <button
          type="button"
          className="h-11 w-full min-w-0 rounded-[12px] px-6 text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E1B3D]/30 focus-visible:ring-offset-2 sm:text-[13.5px] xl:w-auto xl:min-w-[100px]"
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

    const rawUserType = localStorage.getItem("user_type") || "";

    const isLoggedIn = localStorage.getItem("is_logged_in");

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

        <main className="thin-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#f5f6fa] px-3 pb-8 pt-4 sm:px-3 sm:pb-10 sm:pt-4 lg:px-4">
          <div className="mx-auto w-full min-w-0 max-w-[1600px]">
            {/* Welcome hero */}
            <WelcomeHero
              user={user}
              distributorId={ignite?.ba_id || "N/A"}
            />

            {/* API error */}
            {isError && (
              <div
                role="alert"
                className="mt-5 flex min-w-0 flex-col items-start gap-3 rounded-[14px] border border-[#f2c6c3] bg-[#fff4f3] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
              >
                <p className="break-words text-[12px] font-semibold leading-5 text-[#b42318] sm:text-[13px]">
                  Unable to load the dashboard data. Please try again.
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="shrink-0 rounded-lg bg-white px-3 py-2 text-[12px] font-bold text-[#b42318] ring-1 ring-[#f2c6c3] transition-colors hover:bg-[#fff8f7]"
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
            <section className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:mt-7 sm:gap-5 xl:grid-cols-2">
              <LatestOrderSection
                order={dashboard?.latest_order ?? null}
              />

              <RecentActivity activity={activity} />
            </section>

            {/* CV counter */}
            <section className="mt-5 min-w-0 sm:mt-5">
              <SectionTitle large>CV counter</SectionTitle>

              <CvFilters />

              <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:mt-5 sm:gap-5 xl:grid-cols-2">
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