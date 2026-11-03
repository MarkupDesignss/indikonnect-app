"use client";

import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  Coins,
  HandCoins,
  Loader2,
  Search,
  ShoppingBag,
  UsersRound,
  ArrowUpRight,
  ArrowRight,
  Wallet,
  TrendingUp,
  Trophy,
  ShieldCheck,
  Sparkles,
  PackageCheck,
  Star,
  Heart,
  LayoutGrid,
  Clock3,
  Info,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import Sidebar from "../../../components/Distributor/distributor/Sidebar";

import type {
  DashboardActivity,
  DashboardLatestOrder,
  DashboardStats,
  DashboardUser,
  IgniteDashboard,
} from "@/lib/redux/api/distributor/userDashboardApi";

import {
  useGetUserDashboardQuery,
  usePlaceBankedTcMutation,
  useRedeemCoinsMutation,
} from "@/lib/redux/api/distributor/userDashboardApi";

import { useGetPairingsQuery } from "@/lib/redux/api/distributor/pairingsApi";

import Loding from "@/components/common/Loding";

// --------------------------------------------------
// Shared design primitives
// --------------------------------------------------

const CARD =
  "min-w-0 rounded-[16px] border border-[#E6E9EF] bg-white shadow-[0_4px_20px_rgba(24,39,75,0.03)]";


const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

    .distributor-dashboard, .distributor-dashboard * { box-sizing: border-box; }
    .distributor-dashboard button { -webkit-tap-highlight-color: transparent; }
    .distributor-dashboard ::selection { background: #dadada; color: #101010; }
    .distributor-dashboard .dashboard-number { font-variant-numeric: tabular-nums; }
    .distributor-dashboard .dashboard-card { transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
    .distributor-dashboard .dashboard-card:hover { border-color: #d8d8d8; box-shadow: 0 14px 32px rgba(17,17,17,.045); }

    .distributor-dashboard input::-webkit-outer-spin-button,
    .distributor-dashboard input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .distributor-dashboard input[type=number] {
      -moz-appearance: textfield;
    }

    @media (prefers-reduced-motion: reduce) {
      .distributor-dashboard *, .distributor-dashboard *::before, .distributor-dashboard *::after {
        scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important;
      }
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

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number | string | null | undefined): string {
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

function formatCurrency(
  value: number | string | null | undefined,
  currency: "USD" | "INR",
): string {
  const formattedValue = formatNumber(value);

  return currency === "USD" ? `$${formattedValue}` : `₹${formattedValue}`;
}

// --------------------------------------------------
// Sales calendar types & helpers
// --------------------------------------------------

type SalesCalendarWeek = {
  week_no?: number | string | null;
  start?: string | null;
  end?: string | null;
  label?: string | null;
};

type SalesCalendar = {
  year?: number | string | null;
  weeks?: SalesCalendarWeek[] | null;
  current_week?: SalesCalendarWeek | null;
  start_date?: string | null;
  end_date?: string | null;
};

function getCalendarYear(calendar?: SalesCalendar | null): number {
  const rawYear = calendar?.year;
  const parsedYear = Number(rawYear);

  if (Number.isFinite(parsedYear) && parsedYear > 0) {
    return parsedYear;
  }

  // Fall back to deriving the year from the current week start date.
  const start = calendar?.current_week?.start ?? calendar?.start_date;
  if (start) {
    const date = new Date(start);
    if (!Number.isNaN(date.getTime())) {
      return date.getFullYear();
    }
  }

  return new Date().getFullYear();
}

function getCurrentCalendarWeek(calendar?: SalesCalendar | null): number {
  const rawWeek = calendar?.current_week?.week_no;
  const parsedWeek = Number(rawWeek);

  if (Number.isFinite(parsedWeek) && parsedWeek > 0) {
    return parsedWeek;
  }

  // Try deriving from the start date if week_no isn't provided.
  const start = calendar?.current_week?.start;
  if (start) {
    const date = new Date(start);
    if (!Number.isNaN(date.getTime())) {
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const diffDays = Math.floor(
        (date.getTime() - firstDay.getTime()) / 86400000,
      );
      return Math.max(1, Math.ceil((diffDays + firstDay.getDay() + 1) / 7));
    }
  }

  return 1;
}

// --------------------------------------------------
// Pairings types & metrics helper
// --------------------------------------------------

type CvSearchFilters = {
  year: number;
  week_no: number;
};

type PairingsQueryResult = {
  data?: any;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  refetch?: () => Promise<any> | any;
};

type PeriodIgniteMetrics = {
  total_cv_left?: number;
  total_cv_right?: number;
  floating_cv_left?: number;
  floating_cv_right?: number;
  cv_left?: number;
  cv_right?: number;
  total_steps?: number;
};

function getPairingsMetrics(data: any): PeriodIgniteMetrics | null {
  if (!data) return null;

  // Support both `{ data: {...} }` and raw payload shapes.
  const payload = data?.data ?? data;

  if (!payload || typeof payload !== "object") return null;

  const pick = (...keys: string[]) => {
    for (const key of keys) {
      if (payload[key] !== undefined && payload[key] !== null) {
        return toNumber(payload[key]);
      }
    }
    return undefined;
  };

  return {
    total_cv_left: pick("total_cv_left", "left_cv", "leftCv"),
    total_cv_right: pick("total_cv_right", "right_cv", "rightCv"),
    floating_cv_left: pick("floating_cv_left", "floating_left"),
    floating_cv_right: pick("floating_cv_right", "floating_right"),
    cv_left: pick("cv_left"),
    cv_right: pick("cv_right"),
    total_steps: pick("total_steps", "steps"),
  };
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
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-[10px] border border-[#E2E7EF] bg-[#F2F5F9]"
      >
        <span className="h-2 w-2 rounded-[3px] bg-[#617896]" />
      </span>
      <h2
        className={`min-w-0 font-bold leading-tight tracking-[-0.035em] text-[#181818] ${large ? "text-[16px] sm:text-[18px]" : "text-[16px] sm:text-[18px]"}`}
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
      className="flex min-h-dvh w-full items-center justify-center overflow-hidden bg-white px-4"
    >
      <FontImport />

      <div className="flex flex-col items-center gap-3 rounded-[18px] bg-white px-8 py-7">
        <Loding />
      </div>
    </div>
  );
}

// --------------------------------------------------
// Welcome hero
// --------------------------------------------------

function WelcomeHero({
  user,
  distributorId,
}: {
  user?: DashboardUser;
  distributorId: string;
}) {
  const displayName = user?.name?.trim() || "Distributor";

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="relative isolate overflow-hidden rounded-[24px] border border-[#E5E9F1] bg-gradient-to-r from-[#F1F5FB] via-white to-[#F7F9FC] shadow-[0_8px_30px_rgba(24,39,75,0.045)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#C6D5F0]/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-150px] left-[35%] h-64 w-64 rounded-full bg-[#D6E0F4]/10 blur-3xl"
      />

      <div className="relative grid gap-3 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(210px,270px)] lg:items-center lg:px-6 lg:py-5">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E1E7F0] bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-[#4564B7] sm:text-[11px]">
            <span className="h-2 w-2 rounded-full bg-[#6686B9]" />
            Distributor workspace
          </div>

          <div className="flex min-w-0 items-center gap-3.5">
            <div className="hidden h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[16px] bg-[#283B55] text-[18px] font-bold text-white shadow-[0_8px_20px_rgba(34,52,77,.12)] sm:flex">
              {initials || "D"}
            </div>

            <div className="min-w-0">
              <h1 className="break-words text-[20px] font-bold leading-tight tracking-[-.04em] text-[#233254] sm:text-[24px]">
                Welcome back, {displayName}
              </h1>

              <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#6C7794] sm:text-[13px] sm:leading-6">
                Your business at a glance. Track performance, manage your
                network and stay on top of every update.
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[#DCE5F6] pt-4">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#6475A0]">
              <ShieldCheck size={14} className="text-[#5E83DA]" />
              {formatStatus(user?.account_type || "distributor")} account
            </span>

            {user?.email && (
              <span className="max-w-full truncate text-[11px] text-[#7A849C]">
                {user.email}
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-[18px] border border-white bg-white/80 p-4 shadow-[0_8px_30px_rgba(73,95,167,.07)] backdrop-blur-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[.13em] text-[#8994AC]">
              Member identification
            </span>

            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#EFF3F9] text-[#607797]">
              <Sparkles size={17} />
            </span>
          </div>

          <p className="mt-3 text-[10px] font-semibold text-[#7B869D]">
            Distributor ID
          </p>

          <p className="dashboard-number mt-1 break-all text-[18px] font-bold tracking-[-.03em] text-[#293962] sm:text-[20px]">
            {distributorId}
          </p>

          <div className="mt-3 flex items-center gap-2 border-t border-[#E8ECF7] pt-3 text-[10px] text-[#8390AE]">
            <span className="h-2 w-2 rounded-full bg-[#55A58C]" />
            IndieKonnect distributor portal
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// --------------------------------------------------
// Quick stats cards
// --------------------------------------------------

function QuickStatsCards({
  cashWallet,
  floatingRetailProfit,
  directReferral,
}: {
  cashWallet: number | null;
  floatingRetailProfit: number | null;
  directReferral: number | null;
}) {
  const cards = [
    {
      label: "Cash wallet",
      value: cashWallet,
      icon: Wallet,
      kind: "currency",
      note: "Available wallet balance",
      bg: "#FFFFFF",
      border: "#E6E9EF",
      iconBg: "#EFF3F9",
      tone: "#57749D",
    },
    {
      label: "Floating retail profit",
      value: floatingRetailProfit,
      icon: TrendingUp,
      kind: "currency",
      note: "Retail profit overview",
      bg: "#FFFFFF",
      border: "#E6E9EF",
      iconBg: "#ECF7F2",
      tone: "#28866B",
    },
    {
      label: "Direct referrals",
      value: directReferral,
      icon: UsersRound,
      kind: "number",
      note: "Direct network members",
      bg: "#FFFFFF",
      border: "#E6E9EF",
      iconBg: "#F3F0F8",
      tone: "#776A99",
    },
  ] as const;

  return (
    <section aria-label="Key performance indicators" className="mt-4 sm:mt-5">
      <div className="grid grid-cols-1 gap-2.5 min-[540px]:grid-cols-2 lg:grid-cols-3 sm:gap-3">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="group relative flex min-h-[116px] min-w-0 flex-col justify-between overflow-hidden rounded-[15px] border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(64,84,133,.09)] sm:p-4"
              style={{ background: item.bg, borderColor: item.border }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-[11px]"
                  style={{ backgroundColor: item.iconBg, color: item.tone }}
                >
                  <Icon size={18} strokeWidth={1.8} />
                </span>

                <ArrowUpRight
                  size={18}
                  className="opacity-45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  style={{ color: item.tone }}
                />
              </div>

              <div className="mt-3 min-w-0">
                <p className="text-[12px] font-semibold text-[#64718C]">
                  {item.label}
                </p>

                <p className="dashboard-number mt-1 break-words text-[21px] font-bold leading-tight tracking-[-.045em] text-[#24334F] sm:text-[24px]">
                  {item.value === null
                    ? "—"
                    : item.kind === "currency"
                      ? formatCurrency(item.value, "INR")
                      : formatNumber(item.value)}
                </p>

                <p className="mt-2 text-[10px] leading-4 text-[#8792A6]">
                  {item.value === null
                    ? "Not available from the API"
                    : item.note}
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

function DashboardOverview({ stats }: { stats?: DashboardStats }) {
  const cards = [
    {
      label: "Total orders",
      value: stats?.total_orders,
      icon: ShoppingBag,
      tone: "#4C75D4",
      bg: "#EFF4FF",
    },
    {
      label: "Wishlist",
      value: stats?.wishlist,
      icon: Heart,
      tone: "#9D7890",
      bg: "#F7F3F6",
    },
    {
      label: "Points earned",
      value: stats?.points_earned,
      icon: Coins,
      tone: "#B58E4E",
      bg: "#FAF7EF",
    },
    {
      label: "Reviews",
      value: stats?.reviews,
      icon: Star,
      tone: "#7F78A8",
      bg: "#F6F4FA",
    },
    {
      label: "Cart items",
      value: stats?.cart_items,
      icon: LayoutGrid,
      tone: "#488D83",
      bg: "#F1F7F5",
    },
    {
      label: "Average rating",
      value: stats?.average_rating,
      icon: Trophy,
      tone: "#B18A6B",
      bg: "#FAF6F2",
    },
  ];

  return (
    <section className="mt-5 sm:mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <SectionTitle>Business overview</SectionTitle>

          <p className="ml-11 mt-1 text-[11px] leading-5 text-[#8591A8]">
            Your latest account activity and shopping metrics
          </p>
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#A3ADC0]">
          Overview / 06 metrics
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 sm:gap-4">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="group flex min-h-[112px] min-w-0 flex-col justify-between rounded-[14px] border border-[#E8EDF5] bg-white p-3 shadow-[0_3px_12px_rgba(52,72,120,.03)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(52,72,120,.08)] sm:p-4"
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-[11px]"
                  style={{ background: item.bg, color: item.tone }}
                >
                  <Icon size={17} strokeWidth={1.9} />
                </span>

                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: item.tone }}
                />
              </div>

              <div className="pt-4">
                <p className="dashboard-number break-words text-[20px] font-bold leading-none tracking-[-.045em] text-[#25334F] sm:text-[23px]">
                  {item.value == null ? "—" : formatNumber(item.value)}
                </p>

                <p className="mt-2 text-[11px] font-medium leading-4 text-[#78859D] sm:text-[12px]">
                  {item.label}
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
// Coin value API fields
// --------------------------------------------------

type IgniteCoinValues = {
  yellow_value_usd?: number | string | null;
  yellow_value_inr?: number | string | null;
  green_value_usd?: number | string | null;
  green_value_inr?: number | string | null;
  blue_value_usd?: number | string | null;
  blue_value_inr?: number | string | null;
};

type RedeemPointType = "yellow_bal" | "blue_bal";

// --------------------------------------------------
// Coin card
// --------------------------------------------------

function CoinCard({
  color,
  value,
  valueUsd,
  valueInr,
  label,
}: {
  color: "yellow" | "green" | "blue";
  value: string | number;
  valueUsd?: number | string | null;
  valueInr?: number | string | null;
  label: string;
}) {
  const style = {
    yellow: { tone: "#B78B30", light: "#FFF9EA", ring: "#F1E4BF" },
    green: { tone: "#25876B", light: "#EDF8F3", ring: "#D3EADD" },
    blue: { tone: "#4F6AC0", light: "#F0F4FE", ring: "#DBE3FA" },
  }[color];

  return (
    <div
      className="group min-w-0 rounded-[15px] border p-3 transition-colors hover:shadow-[0_8px_22px_rgba(75,93,155,.06)] sm:p-4"
      style={{ backgroundColor: style.light, borderColor: style.ring }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
          style={{
            backgroundColor: style.light,
            border: `1px solid ${style.ring}`,
          }}
        >
          <Coins size={20} strokeWidth={1.8} style={{ color: style.tone }} />
        </span>

        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: style.tone }}
        />
      </div>

      <p className="dashboard-number mt-4 break-words text-[23px] font-bold leading-tight tracking-[-.05em] text-[#1B1B1B] sm:text-[27px]">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-[11px] font-medium leading-4 text-[#777777] sm:text-[12px]">
        {label}
      </p>

      <div className="mt-3 space-y-2 border-t border-[#F0F0F0] pt-3">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="text-[10px] text-[#999999]">Value in USD</span>

          <span className="dashboard-number min-w-0 break-all text-right text-[11px] font-semibold text-[#353535]">
            {valueUsd == null ? "—" : formatCurrency(valueUsd, "USD")}
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="text-[10px] text-[#999999]">Value in INR</span>

          <span className="dashboard-number min-w-0 break-all text-right text-[11px] font-semibold text-[#353535]">
            {valueInr == null ? "—" : formatCurrency(valueInr, "INR")}
          </span>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// REDEEM COINS POPUP
// --------------------------------------------------

function RedeemCoinsModal({
  isOpen,
  yellowBalance,
  blueBalance,
  selectedRedeemPoint,
  redeemAmount,
  isRedeeming,
  onClose,
  onSelectPoint,
  onAmountChange,
  onRedeem,
}: {
  isOpen: boolean;
  yellowBalance: number;
  blueBalance: number;
  selectedRedeemPoint: RedeemPointType;
  redeemAmount: string;
  isRedeeming: boolean;
  onClose: () => void;
  onSelectPoint: (point: RedeemPointType) => void;
  onAmountChange: (value: string) => void;
  onRedeem: () => void;
}) {
  const selectedBalance =
    selectedRedeemPoint === "yellow_bal" ? yellowBalance : blueBalance;

  const amountNumber = Number(redeemAmount);

  const isAmountValid =
    redeemAmount.trim() !== "" &&
    Number.isSafeInteger(amountNumber) &&
    amountNumber > 0;

  const exceedsBalance = isAmountValid && amountNumber > selectedBalance;

  const canRedeem =
    isAmountValid && !exceedsBalance && selectedBalance > 0 && !isRedeeming;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isRedeeming) onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isRedeeming, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[4px]"
          onClick={() => !isRedeeming && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="redeem-coins-title"
            onClick={(e) => e.stopPropagation()}
            className="thin-scroll max-h-[92dvh] w-full max-w-[500px] overflow-y-auto rounded-[22px] border border-[#E8E8E8] bg-white shadow-[0_30px_100px_rgba(0,0,0,.25)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#EBEBEB] px-5 py-5 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-[#F0E5C9] bg-[#FFF9EA] text-[#B78B30]">
                  <HandCoins size={20} />
                </span>

                <div className="min-w-0">
                  <h3
                    id="redeem-coins-title"
                    className="text-[18px] font-bold tracking-[-.035em] text-[#191919]"
                  >
                    Redeem your coins
                  </h3>

                  <p className="mt-1 text-[11px] text-[#888888]">
                    Enter the number of coins you want to redeem manually.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isRedeeming}
                aria-label="Close redeem dialog"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#E9E9E9] text-[#666666] hover:bg-[#F5F5F5] disabled:opacity-50"
              >
                <span className="text-[21px] leading-none">×</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-[11px] font-bold text-[#525D70]">
                  Select coin type
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectPoint("yellow_bal")}
                    disabled={isRedeeming}
                    aria-pressed={selectedRedeemPoint === "yellow_bal"}
                    className={`flex min-w-0 items-center justify-between gap-2 rounded-[12px] border px-3 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                      selectedRedeemPoint === "yellow_bal"
                        ? "border-[#DCC58F] bg-[#FFF9EA] shadow-[0_3px_10px_rgba(183,139,48,.07)]"
                        : "border-[#E6E9EF] bg-white hover:border-[#D5D9E1]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] ${
                          selectedRedeemPoint === "yellow_bal"
                            ? "bg-[#F4E8C9] text-[#A77B22]"
                            : "bg-[#F4F5F7] text-[#858B96]"
                        }`}
                      >
                        <Coins size={16} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold text-[#30394A]">
                          Yellow coins
                        </span>
                        <span className="mt-0.5 block text-[10px] text-[#8790A0]">
                          {formatNumber(yellowBalance)} available
                        </span>
                      </span>
                    </span>

                    <span
                      className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border ${
                        selectedRedeemPoint === "yellow_bal"
                          ? "border-[#B78B30] bg-[#B78B30] text-white"
                          : "border-[#CCD2DC] bg-white"
                      }`}
                    >
                      {selectedRedeemPoint === "yellow_bal" && (
                        <Check size={11} strokeWidth={3} />
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectPoint("blue_bal")}
                    disabled={isRedeeming}
                    aria-pressed={selectedRedeemPoint === "blue_bal"}
                    className={`flex min-w-0 items-center justify-between gap-2 rounded-[12px] border px-3 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                      selectedRedeemPoint === "blue_bal"
                        ? "border-[#BFCBF0] bg-[#F0F4FE] shadow-[0_3px_10px_rgba(79,106,192,.07)]"
                        : "border-[#E6E9EF] bg-white hover:border-[#D5D9E1]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] ${
                          selectedRedeemPoint === "blue_bal"
                            ? "bg-[#DDE5FA] text-[#4F6AC0]"
                            : "bg-[#F4F5F7] text-[#858B96]"
                        }`}
                      >
                        <Coins size={16} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold text-[#30394A]">
                          Blue coins
                        </span>
                        <span className="mt-0.5 block text-[10px] text-[#8790A0]">
                          {formatNumber(blueBalance)} available
                        </span>
                      </span>
                    </span>

                    <span
                      className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border ${
                        selectedRedeemPoint === "blue_bal"
                          ? "border-[#4F6AC0] bg-[#4F6AC0] text-white"
                          : "border-[#CCD2DC] bg-white"
                      }`}
                    >
                      {selectedRedeemPoint === "blue_bal" && (
                        <Check size={11} strokeWidth={3} />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    htmlFor="redeem-coins-amount"
                    className="text-[11px] font-bold text-[#525D70]"
                  >
                    Enter coins to redeem
                  </label>

                  <span className="text-[10px] font-semibold text-[#8992A2]">
                    Available: {formatNumber(selectedBalance)}
                  </span>
                </div>

                <div
                  className={`flex h-[47px] items-center gap-2.5 rounded-[12px] border bg-white px-3.5 transition-all focus-within:ring-4 ${
                    exceedsBalance
                      ? "border-[#E7B5B5] focus-within:border-[#CE6464] focus-within:ring-[#CE6464]/10"
                      : "border-[#E2E6ED] focus-within:border-[#7183A3] focus-within:ring-[#7183A3]/10"
                  }`}
                >
                  <Coins
                    size={17}
                    className={
                      selectedRedeemPoint === "yellow_bal"
                        ? "shrink-0 text-[#B78B30]"
                        : "shrink-0 text-[#4F6AC0]"
                    }
                  />

                  <input
                    id="redeem-coins-amount"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    autoFocus
                    placeholder="Enter coin quantity"
                    value={redeemAmount}
                    disabled={isRedeeming || selectedBalance <= 0}
                    onChange={(event) => {
                      const numericValue = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12);

                      onAmountChange(numericValue);
                    }}
                    className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-bold text-[#202A3D] outline-none placeholder:text-[11px] placeholder:font-normal placeholder:text-[#A0A7B3] disabled:cursor-not-allowed"
                  />

                  <span className="shrink-0 text-[10px] font-semibold text-[#929AAA]">
                    Coins
                  </span>
                </div>

                {exceedsBalance ? (
                  <p className="mt-1.5 text-[10px] font-semibold text-[#C34E4E]">
                    Amount cannot exceed your available coin balance.
                  </p>
                ) : (
                  <p className="mt-1.5 text-[10px] text-[#929AAA]">
                    Enter a whole number. Decimal values are not allowed.
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[11px] border border-[#E8EAEF] bg-[#FBFBFC] px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <Info size={14} className="shrink-0 text-[#8792A6]" />

                  <p className="text-[10px] leading-4 text-[#7D8798]">
                    Redemption will be processed using your selected coin
                    balance.
                  </p>
                </div>

                <span
                  className={`shrink-0 text-[10px] font-bold ${
                    selectedBalance > 0 ? "text-[#28866B]" : "text-[#B85D5D]"
                  }`}
                >
                  {selectedBalance > 0
                    ? "Balance available"
                    : "Insufficient balance"}
                </span>
              </div>

              <p className="mt-2 text-[9px] leading-4 text-[#A0A6B1]">
                Green coins are displayed in your wallet but are not supported
                by the current redemption API.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isRedeeming}
                  className="inline-flex h-[47px] w-full items-center justify-center rounded-[12px] border border-[#E2E6ED] bg-white px-4 text-[12px] font-bold text-[#4A5568] transition-all hover:bg-[#F5F6F8] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onRedeem}
                  disabled={!canRedeem}
                  className="inline-flex h-[47px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#171717] px-4 text-[12px] font-bold text-white shadow-[0_5px_14px_rgba(0,0,0,.09)] transition-all hover:bg-[#333333] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#C9CDD4] disabled:text-white disabled:shadow-none"
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Redeeming...
                    </>
                  ) : (
                    <>
                      <HandCoins size={15} />
                      Redeem Coins
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --------------------------------------------------
// Coins section (redeem opens in a popup)
// --------------------------------------------------

function CoinsSection({
  ignite,
  onRedeemSuccess,
}: {
  ignite?: IgniteDashboard | null;
  onRedeemSuccess: () => void;
}) {
  const coinValues = ignite as
    | (IgniteDashboard & IgniteCoinValues)
    | null
    | undefined;

  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  const [selectedRedeemPoint, setSelectedRedeemPoint] =
    useState<RedeemPointType>("yellow_bal");

  const [redeemAmount, setRedeemAmount] = useState("");

  const [redeemCoins, { isLoading: isRedeeming }] =
    useRedeemCoinsMutation();

  const yellowBalance = toNumber(coinValues?.yellow_bal);
  const blueBalance = toNumber(coinValues?.blue_bal);

  const selectedBalance =
    selectedRedeemPoint === "yellow_bal"
      ? yellowBalance
      : blueBalance;

  const handleCloseModal = () => {
    if (isRedeeming) return;
    setIsRedeemModalOpen(false);
    setRedeemAmount("");
  };

  const handleSelectPoint = (point: RedeemPointType) => {
    setSelectedRedeemPoint(point);
    setRedeemAmount("");
  };

  const handleRedeemCoins = async () => {
    if (isRedeeming) return;

    const amountNumber = Number(redeemAmount);

    const isAmountValid =
      redeemAmount.trim() !== "" &&
      Number.isSafeInteger(amountNumber) &&
      amountNumber > 0;

    if (!isAmountValid) {
      toast.error("Please enter a valid number of coins.");
      return;
    }

    if (amountNumber > selectedBalance) {
      toast.error("Redeem amount cannot exceed your available balance.");
      return;
    }

    if (selectedBalance <= 0) {
      toast.error("You do not have enough coins to redeem.");
      return;
    }

    try {
      const response = await redeemCoins({
        coins_to_redeem: amountNumber,
        point_type: selectedRedeemPoint,
      }).unwrap();

      if (response.success === false || response.status === false) {
        toast.error(response.message || "Unable to redeem coins.");
        return;
      }

      toast.success(response.message || "Coins redeemed successfully.");

      setRedeemAmount("");
      setIsRedeemModalOpen(false);

      onRedeemSuccess();
    } catch (error: unknown) {
      const apiError = error as {
        data?: { message?: string };
        message?: string;
      };

      toast.error(
        apiError?.data?.message ||
          apiError?.message ||
          "Failed to redeem coins. Please try again.",
      );
    }
  };

  return (
    <section className={`${CARD} dashboard-card p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <SectionTitle>My coins</SectionTitle>

          <p className="ml-11 mt-1 text-[11px] text-[#929292]">
            Balances and estimated value by coin type
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-[#FAFAFA] px-3 py-1 text-[10px] font-semibold text-[#666666]">
            <Coins size={13} />
            Coin wallet
          </span>

          <button
            type="button"
            onClick={() => setIsRedeemModalOpen(true)}
            className="inline-flex h-[36px] items-center justify-center gap-2 rounded-[11px] bg-[#171717] px-4 text-[12px] font-bold text-white shadow-[0_5px_14px_rgba(0,0,0,.09)] transition-all hover:bg-[#333333] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/30 focus-visible:ring-offset-2"
          >
            <HandCoins size={15} />
            Redeem Coins
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 min-[480px]:grid-cols-3 sm:gap-3">
        <CoinCard
          color="yellow"
          value={coinValues?.yellow_bal ?? 0}
          valueUsd={coinValues?.yellow_value_usd}
          valueInr={coinValues?.yellow_value_inr}
          label="Yellow coins"
        />

        <CoinCard
          color="green"
          value={coinValues?.green_bal ?? 0}
          valueUsd={coinValues?.green_value_usd}
          valueInr={coinValues?.green_value_inr}
          label="Green coins"
        />

        <CoinCard
          color="blue"
          value={coinValues?.blue_bal ?? 0}
          valueUsd={coinValues?.blue_value_usd}
          valueInr={coinValues?.blue_value_inr}
          label="Blue coins"
        />
      </div>

      <RedeemCoinsModal
        isOpen={isRedeemModalOpen}
        yellowBalance={yellowBalance}
        blueBalance={blueBalance}
        selectedRedeemPoint={selectedRedeemPoint}
        redeemAmount={redeemAmount}
        isRedeeming={isRedeeming}
        onClose={handleCloseModal}
        onSelectPoint={handleSelectPoint}
        onAmountChange={setRedeemAmount}
        onRedeem={handleRedeemCoins}
      />
    </section>
  );
}

// --------------------------------------------------
// Account summary
// --------------------------------------------------

function AccountSummary({ ignite }: { ignite?: IgniteDashboard | null }) {
  const ranks = [
    { label: "Current rank", value: ignite?.rank_no, icon: Trophy },
    {
      label: "Eligible rank",
      value: ignite?.eligible_rank_no,
      icon: TrendingUp,
    },
    { label: "Base rank", value: ignite?.base_rank_no, icon: ShieldCheck },
  ];

  const left = toNumber(ignite?.total_cv_left);
  const right = toNumber(ignite?.total_cv_right);
  const total = left + right;

  const leftPct = total > 0 ? (left / total) * 100 : 0;
  const rightPct = total > 0 ? (right / total) * 100 : 0;

  const isActive = ignite?.membership_status?.toLowerCase() === "active";

  return (
    <section className={`${CARD} dashboard-card h-full p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Network performance</SectionTitle>

          <p className="ml-11 mt-1 text-[11px] leading-5 text-[#888888]">
            Rank progress and CV distribution
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
            isActive
              ? "border-[#D9EDE2] bg-[#F0FAF4] text-[#21845F]"
              : "border-[#EBEBEB] bg-[#F8F8F8] text-[#777777]"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isActive ? "bg-[#21845F]" : "bg-[#BDBDBD]"
            }`}
          />

          {formatStatus(ignite?.membership_status)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {ranks.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`min-w-0 rounded-[14px] border p-3 sm:p-4 ${
                index === 0
                  ? "border-[#EAE5D9] bg-[#FBFAF7]"
                  : "border-[#E9ECEF] bg-[#F9FAFB]"
              }`}
            >
              <Icon
                size={16}
                className={
                  index === 0
                    ? "text-[#C18D3D]"
                    : index === 1
                      ? "text-[#269C79]"
                      : "text-[#7C78CE]"
                }
                strokeWidth={1.7}
              />

              <p className="dashboard-number mt-4 break-words text-[23px] font-bold leading-none tracking-[-.05em] text-[#191919] sm:text-[28px]">
                {item.value ?? "—"}
              </p>

              <p className="mt-2 text-[10px] font-medium leading-4 text-[#777777] sm:text-[11px]">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-[14px] border border-[#EAEAEA] bg-[#FCFCFC] p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-[#303030]">
            CV distribution
          </span>

          <span className="dashboard-number text-[11px] font-bold text-[#8A8A8A]">
            {formatNumber(total)} total
          </span>
        </div>

        <div className="mt-4 flex min-w-0 items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-[#8A8A8A]">Left leg</p>

            <p className="dashboard-number mt-1 break-words text-[19px] font-bold leading-none text-[#202020]">
              {formatNumber(left)}
            </p>
          </div>

          <div className="min-w-0 text-right">
            <p className="text-[10px] text-[#8A8A8A]">Right leg</p>

            <p className="dashboard-number mt-1 break-words text-[19px] font-bold leading-none text-[#202020]">
              {formatNumber(right)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex h-[9px] w-full gap-[3px] overflow-hidden rounded-full bg-[#E9E9E9]">
          {leftPct > 0 && (
            <div
              className="h-full rounded-l-full bg-[#5B83D8] transition-all"
              style={{ width: `${leftPct}%` }}
            />
          )}

          {rightPct > 0 && (
            <div
              className="h-full rounded-r-full bg-[#37B89A] transition-all"
              style={{ width: `${rightPct}%` }}
            />
          )}
        </div>

        <div className="mt-2.5 flex justify-between gap-2 text-[10px] font-semibold text-[#888888]">
          <span>
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#5B83D8]" />
            Left {total > 0 ? leftPct.toFixed(0) : 0}%
          </span>

          <span>
            Right {total > 0 ? rightPct.toFixed(0) : 0}%{" "}
            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#37B89A]" />
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#F0F0F0] pt-4">
        <span className="text-[11px] text-[#888888]">
          Membership status
        </span>

        <span className="text-[11px] font-semibold text-[#2A2A2A]">
          {formatStatus(ignite?.membership_status)}
        </span>
      </div>
    </section>
  );
}

// --------------------------------------------------
// Account details table
// --------------------------------------------------

type BankedTcSide = 1 | 2;

function AccountTable({
  ignite,
  onOpenBankedTc,
}: {
  ignite?: IgniteDashboard | null;
  onOpenBankedTc: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const isActive = ignite?.membership_status?.toLowerCase() === "active";

  const availableBankedTc = toNumber(
    (ignite as (IgniteDashboard & { tc_bank_available?: number | string }) | null | undefined)
      ?.tc_bank_available,
  );

  const details = [
    { label: "Placement leg", value: ignite?.placement_leg ?? "N/A" },
    { label: "Total steps", value: ignite?.total_steps ?? 0 },
    { label: "Left CV", value: formatNumber(ignite?.total_cv_left) },
    { label: "Right CV", value: formatNumber(ignite?.total_cv_right) },
    {
      label: "Floating CV left",
      value: formatNumber(ignite?.floating_cv_left),
    },
    {
      label: "Floating CV right",
      value: formatNumber(ignite?.floating_cv_right),
    },
    { label: "CV left", value: formatNumber(ignite?.cv_left) },
    { label: "CV right", value: formatNumber(ignite?.cv_right) },
    { label: "Base rank", value: ignite?.base_rank_no ?? 0 },
    { label: "Eligible rank", value: ignite?.eligible_rank_no ?? 0 },
    { label: "Qualified at", value: ignite?.qualified_at ?? "N/A" },
    { label: "Member ID", value: ignite?.member_id ?? "N/A" },
  ];

  return (
    <section className={`${CARD} dashboard-card h-full p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Account details</SectionTitle>

          <p className="ml-11 mt-1 text-[11px] leading-5 text-[#888888]">
            Your distributor placement and account information
          </p>
        </div>

        {ignite?.is_placed && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E6E6] bg-[#F7F7F7] px-2.5 py-1 text-[10px] font-semibold text-[#505050]">
            <Check size={12} />
            Placed
          </span>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-[14px] border border-[#EBEBEB]">
        <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,.6fr)_minmax(0,.85fr)_16px] items-center gap-2 bg-[#F7F7F7] px-3 py-3 text-[10px] font-semibold uppercase tracking-[.06em] text-[#868686] sm:px-4">
          <span>Account ID</span>
          <span>Rank</span>
          <span>Status</span>
          <span />
        </div>

        {ignite ? (
          <>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              className="group grid min-h-[72px] w-full grid-cols-[minmax(0,1.25fr)_minmax(0,.6fr)_minmax(0,.85fr)_16px] items-center gap-2 bg-white px-3 text-left transition-colors hover:bg-[#FBFBFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#333333] sm:px-4"
            >
              <span className="min-w-0 break-all text-[11px] font-bold text-[#252525] sm:text-[13px]">
                {ignite.ba_id || "N/A"}
              </span>

              <span className="dashboard-number text-[13px] font-bold text-[#242424] sm:text-[15px]">
                {ignite.rank_no ?? 0}
              </span>

              <span
                className={`min-w-0 break-words text-[10px] font-semibold sm:text-[11px] ${
                  isActive ? "text-[#25845F]" : "text-[#858585]"
                }`}
              >
                <span
                  className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${
                    isActive ? "bg-[#25845F]" : "bg-[#AFAFAF]"
                  }`}
                />

                {formatStatus(ignite.membership_status)}
              </span>

              <ChevronDown
                size={16}
                className={`text-[#777777] transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-[#EBEBEB]"
                >
                  <div className="grid grid-cols-2 gap-2.5 bg-[#FAFAFA] p-3 sm:grid-cols-3 sm:p-4">
                    {details.map((item) => (
                      <div
                        key={item.label}
                        className="min-w-0 rounded-[11px] border border-[#EAEAEA] bg-white p-3"
                      >
                        <p className="text-[10px] leading-4 text-[#8A8A8A]">
                          {item.label}
                        </p>

                        <p className="dashboard-number mt-1 break-all text-[12px] font-bold text-[#252525] sm:text-[13px]">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <p className="p-6 text-center text-[12px] text-[#929292]">
            Account information is not available.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[13px] border border-[#ECECEC] bg-[#FBFBFB] p-3 sm:p-3.5">
        <div>
          <p className="text-[11px] font-semibold text-[#343434]">
            Banked TC available
          </p>

          <p className="dashboard-number mt-1 text-[21px] font-bold tracking-[-.04em] text-[#191919]">
            {formatNumber(availableBankedTc)}
          </p>
        </div>

        {availableBankedTc > 0 && Boolean(ignite?.ba_id) ? (
          <button
            type="button"
            onClick={onOpenBankedTc}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[11px] bg-[#171717] px-4 text-[12px] font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,.12)] transition-all hover:bg-[#333333] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#333333]/30 focus-visible:ring-offset-2"
          >
            <HandCoins size={15} />
            Place Banked TC
            <ArrowRight size={14} />
          </button>
        ) : (
          <span className="rounded-full border border-[#E8E8E8] bg-white px-3 py-1.5 text-[10px] font-medium text-[#888888]">
            No TC to place
          </span>
        )}
      </div>
    </section>
  );
}

// --------------------------------------------------
// BANKED TC PLACEMENT POPUP
// --------------------------------------------------

function BankedTcModal({
  isOpen,
  availableCount,
  isLoading,
  pendingSide,
  onClose,
  onSelectSide,
}: {
  isOpen: boolean;
  availableCount: number;
  isLoading: boolean;
  pendingSide: BankedTcSide | null;
  onClose: () => void;
  onSelectSide: (side: BankedTcSide) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && availableCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[4px]"
          onClick={() => !isLoading && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="banked-tc-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] overflow-hidden rounded-[22px] border border-[#E8E8E8] bg-white shadow-[0_30px_100px_rgba(0,0,0,.25)]"
          >
            <div className="border-b border-[#EBEBEB] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#171717] text-white">
                    <HandCoins size={20} />
                  </span>

                  <div>
                    <h3
                      id="banked-tc-title"
                      className="text-[18px] font-bold tracking-[-.035em] text-[#191919]"
                    >
                      Place Banked TC
                    </h3>

                    <p className="mt-1 text-[11px] text-[#888888]">
                      Choose the placement side for your banked TC
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  aria-label="Close placement dialog"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#E9E9E9] text-[#666666] hover:bg-[#F5F5F5] disabled:opacity-50"
                >
                  <span className="text-[21px] leading-none">×</span>
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-[13px] border border-[#EBEBEB] bg-[#FAFAFA] px-4 py-3">
                <div>
                  <p className="text-[10px] font-medium text-[#828282]">
                    Available balance
                  </p>

                  <p className="text-[12px] font-semibold text-[#262626]">
                    Banked TC available for placement
                  </p>
                </div>

                <span className="dashboard-number text-[25px] font-bold text-[#191919]">
                  {availableCount}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <p className="mb-3 text-[12px] font-semibold text-[#353535]">
                Select a leg to place TC
              </p>

              <div className="grid grid-cols-2 gap-3">
                {([1, 2] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    disabled={isLoading}
                    onClick={() => onSelectSide(side)}
                    className="group flex min-h-[134px] flex-col items-center justify-center rounded-[15px] border border-[#E5E7EB] bg-[#FAFAFB] px-3 py-4 transition-all hover:border-[#A9B1BE] hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#607CDA] text-[16px] font-bold text-white">
                      {isLoading && pendingSide === side ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : side === 1 ? (
                        "L"
                      ) : (
                        "R"
                      )}
                    </span>

                    <span className="mt-3 text-[13px] font-bold text-[#252525]">
                      {side === 1 ? "Left leg" : "Right leg"}
                    </span>

                    <span className="mt-1 text-[10px] text-[#888888]">
                      Place on {side === 1 ? "left" : "right"} side
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-[11px] border border-[#EAEAEA] bg-[#FBFBFB] p-3">
                <Info size={15} className="mt-0.5 shrink-0 text-[#888888]" />

                <p className="text-[10.5px] leading-[18px] text-[#777777]">
                  Placement is submitted immediately. Please verify the correct
                  side before selecting.
                </p>
              </div>

              {isLoading && (
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#5F5F5F]">
                  <Loader2 size={14} className="animate-spin" />
                  Placing your TC...
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --------------------------------------------------
// Recent activity
// --------------------------------------------------

const MAX_VISIBLE_ACTIVITY = 4;
const ACTIVITY_ITEM_HEIGHT = 70;

function RecentActivity({ activity }: { activity: DashboardActivity[] }) {
  const hasOverflow = activity.length > MAX_VISIBLE_ACTIVITY;

  return (
    <section className={`${CARD} dashboard-card h-full p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <SectionTitle>Recent activity</SectionTitle>

          <p className="ml-11 mt-1 text-[11px] text-[#929292]">
            A quick timeline of your account updates
          </p>
        </div>

        <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#F7F7F7] text-[#737373]">
          <Activity size={17} />
        </span>
      </div>

      {activity.length > 0 ? (
        <div
          className={`thin-scroll mt-4 ${
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
              className="relative flex gap-3 pb-4 last:pb-0"
            >
              <div className="relative flex shrink-0 flex-col items-center">
                <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-[#E9E9E9] bg-[#FAFAFA] text-[#454545]">
                  <Activity size={15} />
                </span>

                {index !== activity.length - 1 && (
                  <span className="absolute bottom-0 top-10 w-px bg-[#EAEAEA]" />
                )}
              </div>

              <div className="min-w-0 flex-1 border-b border-[#F0F0F0] pb-3 last:border-0">
                <p className="break-words text-[12px] font-semibold leading-5 text-[#303030]">
                  {item.event}
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-[6px] bg-[#F5F5F5] px-2 py-0.5 text-[10px] font-medium text-[#737373]">
                    {formatStatus(item.type)}
                  </span>

                  <span className="text-[10px] text-[#9C9C9C]">
                    {item.created_at}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex min-h-[145px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E8E8E8] bg-[#FBFBFB] p-5 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white text-[#989898] ring-1 ring-[#EBEBEB]">
            <Activity size={19} />
          </span>

          <p className="mt-3 text-[12px] font-semibold text-[#454545]">
            No recent activity
          </p>

          <p className="mt-1 text-[11px] text-[#999999]">
            Your latest account updates will show here.
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
    order?.order_reference || order?.order_number || order?.reference;

  const orderData = order as
    | (DashboardLatestOrder & {
        total_payable?: number | string;
        order_date?: string;
      })
    | null;

  const amount = order?.total_amount ?? orderData?.total_payable;

  const status = order?.status?.toLowerCase() ?? "";

  const statusStyle =
    status.includes("deliver") ||
    status.includes("confirm") ||
    status.includes("complete")
      ? "border-[#D8EEE0] bg-[#F1FAF5] text-[#21815A]"
      : status.includes("fail") || status.includes("cancel")
        ? "border-[#F1D6D6] bg-[#FFF5F5] text-[#B45454]"
        : "border-[#E8E8E8] bg-[#F7F7F7] text-[#737373]";

  return (
    <section className={`${CARD} dashboard-card h-full p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <SectionTitle>Latest order</SectionTitle>

          <p className="ml-11 mt-1 text-[11px] text-[#929292]">
            Your most recent purchase
          </p>
        </div>

        <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#F7F7F7] text-[#737373]">
          <ShoppingBag size={17} />
        </span>
      </div>

      {order ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#EDEDED] bg-[#FAFAFA] p-3.5 sm:p-4">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[.1em] text-[#909090]">
                Order reference
              </p>

              <p className="dashboard-number mt-1 break-all text-[13px] font-bold text-[#262626] sm:text-[14px]">
                {reference || "Order details available"}
              </p>
            </div>

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white text-[#555555] ring-1 ring-[#EAEAEA]">
              <PackageCheck size={17} />
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-[#878787]">
                Order value
              </p>

              <p className="dashboard-number mt-1.5 break-words text-[29px] font-bold tracking-[-.055em] text-[#181818] sm:text-[33px]">
                {amount == null ? "—" : formatCurrency(amount, "INR")}
              </p>
            </div>

            {order.status && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold ${statusStyle}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-65" />
                {formatStatus(order.status)}
              </span>
            )}
          </div>

          {(order.created_at || orderData?.order_date) && (
            <div className="mt-5 flex items-center gap-2 border-t border-[#F0F0F0] pt-3.5 text-[11px] text-[#8C8C8C]">
              <Clock3 size={13} />

              <span className="break-words">
                {order.created_at || orderData?.order_date}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 flex min-h-[145px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E8E8E8] bg-[#FBFBFB] p-5 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white text-[#989898] ring-1 ring-[#EBEBEB]">
            <ShoppingBag size={19} />
          </span>

          <p className="mt-3 text-[12px] font-semibold text-[#454545]">
            No orders placed yet
          </p>

          <p className="mt-1 text-[11px] text-[#999999]">
            Your recent orders will appear here.
          </p>
        </div>
      )}
    </section>
  );
}

// --------------------------------------------------
// Sales calendar poster + CV filters
// --------------------------------------------------

function SalesCalendarPoster({
  calendar,
  selectedWeek,
  onSelectWeek,
  children,
}: {
  calendar?: SalesCalendar | null;
  selectedWeek: number;
  onSelectWeek: (weekNo: number) => void;
  children?: React.ReactNode;
}) {
  const weeks = Array.isArray(calendar?.weeks) ? calendar!.weeks : [];
  const year = getCalendarYear(calendar);

  return (
    <div className={`${CARD} dashboard-card mt-4 overflow-hidden`}>
      <div className="border-b border-[#EDEDED] bg-gradient-to-r from-[#F7F9FC] to-white px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EFF3F9] text-[#607797]">
              <CalendarDays size={18} />
            </span>

            <div>
              <p className="text-[13px] font-bold text-[#202A3D]">
                Sales calendar {year}
              </p>
              <p className="mt-0.5 text-[10px] text-[#8992A2]">
                Select a week to inspect CV and pairing performance
              </p>
            </div>
          </div>

          {calendar?.current_week && (
            <span className="rounded-full border border-[#E6EAF0] bg-white px-3 py-1 text-[10px] font-semibold text-[#68758A]">
              Current week: {calendar.current_week.week_no ?? "—"}
            </span>
          )}
        </div>
      </div>

      {weeks.length > 0 && (
        <div className="thin-scroll flex gap-2 overflow-x-auto border-b border-[#EDEDED] bg-[#FCFCFD] px-4 py-3 sm:px-5">
          {weeks.map((week) => {
            const weekNo = Number(week.week_no);
            const active = Number.isFinite(weekNo) && weekNo === selectedWeek;

            return (
              <button
                key={`${weekNo}-${week.start ?? ""}`}
                type="button"
                onClick={() => Number.isFinite(weekNo) && onSelectWeek(weekNo)}
                className={`flex min-w-[74px] shrink-0 flex-col items-center justify-center rounded-[11px] border px-2.5 py-2 transition-all ${
                  active
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-[#E6E9EF] bg-white text-[#30394A] hover:border-[#C8CFD9]"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-[.08em] opacity-80">
                  Wk {weekNo}
                </span>
                <span className="mt-1 text-[10px] opacity-70">
                  {week.label ?? week.start ?? ""}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {children && <div className="p-4 sm:p-5">{children}</div>}
    </div>
  );
}

function CvFilters({
  calendar,
  selectedYear,
  selectedWeek,
  onYearChange,
  onWeekChange,
  onSearch,
  isFetching,
  isError,
  hasSearched,
  searchedYear,
  searchedWeek,
}: {
  calendar?: SalesCalendar | null;
  selectedYear: number;
  selectedWeek: number;
  onYearChange: (year: number) => void;
  onWeekChange: (week: number) => void;
  onSearch: () => void;
  isFetching: boolean;
  isError: boolean;
  hasSearched: boolean;
  searchedYear?: number;
  searchedWeek?: number;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const weeks = Array.isArray(calendar?.weeks) && calendar!.weeks!.length > 0
    ? calendar!.weeks!
    : Array.from({ length: 52 }, (_, i) => ({ week_no: i + 1 }));

  return (
    <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
      <div>
        <label className="mb-1.5 block text-[11px] font-bold text-[#525D70]">
          Year
        </label>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="h-[42px] w-full rounded-[11px] border border-[#E2E6ED] bg-white px-3 text-[12px] font-semibold text-[#30394A] outline-none focus:border-[#7183A3]"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-bold text-[#525D70]">
          Week
        </label>
        <select
          value={selectedWeek}
          onChange={(e) => onWeekChange(Number(e.target.value))}
          className="h-[42px] w-full rounded-[11px] border border-[#E2E6ED] bg-white px-3 text-[12px] font-semibold text-[#30394A] outline-none focus:border-[#7183A3]"
        >
          {weeks.map((week) => {
            const weekNo = Number(week.week_no);
            return (
              <option key={weekNo} value={weekNo}>
                Week {weekNo}
              </option>
            );
          })}
        </select>
      </div>

      <button
        type="button"
        onClick={onSearch}
        disabled={isFetching}
        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[11px] bg-[#171717] px-4 text-[12px] font-bold text-white transition-all hover:bg-[#333333] active:scale-[.98] disabled:cursor-not-allowed disabled:bg-[#C9CDD4]"
      >
        {isFetching ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Search size={15} />
            Search
          </>
        )}
      </button>

      {isError && (
        <p className="col-span-full text-[11px] font-semibold text-[#B45454]">
          Failed to load pairing data for this period.
        </p>
      )}

      {!isError && hasSearched && !isFetching && (
        <p className="col-span-full text-[11px] text-[#888888]">
          Showing data for {searchedYear} · Week {searchedWeek}
        </p>
      )}
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

  const [selectedCvYear, setSelectedCvYear] = useState<number>(
    new Date().getFullYear(),
  );

  const [selectedCvWeek, setSelectedCvWeek] = useState<number>(1);

  const [submittedCvFilters, setSubmittedCvFilters] =
    useState<CvSearchFilters | null>(null);

  // --------------------------------------------------
  // BANKED TC MODAL STATES
  // --------------------------------------------------

  const [isBankedTcModalOpen, setIsBankedTcModalOpen] = useState(false);

  const [pendingBankedTcSide, setPendingBankedTcSide] =
    useState<BankedTcSide | null>(null);

  // --------------------------------------------------
  // BANKED TC MUTATION
  // --------------------------------------------------

  const [placeBankedTc, { isLoading: isPlacingBankedTc }] =
    usePlaceBankedTcMutation();

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

    const distributorToken = localStorage.getItem("distributor_token");
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

  const ignite: IgniteDashboard | null | undefined = dashboard?.ignite;

  const activity: DashboardActivity[] = dashboard?.recent_activity ?? [];

  const salesCalendar = (dashboard as any)?.sales_calendar as
    | SalesCalendar
    | undefined;

  const calendarYear = getCalendarYear(salesCalendar);
  const calendarWeek = getCurrentCalendarWeek(salesCalendar);

  const calendarWeekStart = salesCalendar?.current_week?.start ?? "";

  const hasSalesCalendar = Boolean(salesCalendar);

  // --------------------------------------------------
  // Set current calendar filters
  // --------------------------------------------------

  useEffect(() => {
    if (!hasSalesCalendar) return;

    setSelectedCvYear(calendarYear);
    setSelectedCvWeek(calendarWeek);
  }, [calendarYear, calendarWeek, calendarWeekStart, hasSalesCalendar]);

  // --------------------------------------------------
  // Pairings API
  // --------------------------------------------------

  const pairingsQuery = useGetPairingsQuery(
    (submittedCvFilters
      ? {
          year: submittedCvFilters.year,
          week_no: submittedCvFilters.week_no,
        }
      : undefined) as any,
    {
      skip: !submittedCvFilters,
      refetchOnMountOrArgChange: true,
    },
  ) as unknown as PairingsQueryResult;

  // --------------------------------------------------
  // CV search
  // --------------------------------------------------

  const handleCvSearch = () => {
    const nextFilters: CvSearchFilters = {
      year: selectedCvYear,
      week_no: selectedCvWeek,
    };

    if (
      submittedCvFilters?.year === nextFilters.year &&
      submittedCvFilters?.week_no === nextFilters.week_no
    ) {
      void pairingsQuery.refetch?.();
      return;
    }

    setSubmittedCvFilters(nextFilters);
  };

  // --------------------------------------------------
  // Pairings metrics
  // --------------------------------------------------

  const periodIgniteMetrics = getPairingsMetrics(pairingsQuery.data);

  const cvCounterIgnite = periodIgniteMetrics
    ? ({
        ...(ignite ?? {}),
        ...periodIgniteMetrics,
      } as IgniteDashboard)
    : ignite;

  // --------------------------------------------------
  // HANDLE BANKED TC PLACEMENT
  // --------------------------------------------------

  const handleBankedTcPlacement = async (side: BankedTcSide) => {
    if (isPlacingBankedTc) return;

    if (!ignite?.ba_id) {
      toast.error("Distributor ID is not available.");
      return;
    }

    const availableBankedTc = toNumber(
      (
        ignite as IgniteDashboard & {
          tc_bank_available?: number | string;
        }
      ).tc_bank_available,
    );

    if (availableBankedTc <= 0) {
      toast.error("No Banked TC available.");
      setIsBankedTcModalOpen(false);
      return;
    }

    try {
      setPendingBankedTcSide(side);

      const response = await placeBankedTc({
        ba_id: ignite.ba_id,
        side,
      }).unwrap();

      if (response.success === false || response.status === false) {
        toast.error(response.message || "Unable to place Banked TC.");
        return;
      }

      toast.success(
        response.message ||
          `Banked TC placed on ${
            side === 1 ? "Left" : "Right"
          } Side successfully.`,
      );

      setIsBankedTcModalOpen(false);

      await refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to place Banked TC. Please try again.",
      );
    } finally {
      setPendingBankedTcSide(null);
    }
  };

  // --------------------------------------------------
  // COIN REDEMPTION SUCCESS
  // --------------------------------------------------

  const handleCoinRedeemSuccess = () => {
    void refetch();
  };

  // --------------------------------------------------
  // BANKED TC AVAILABLE BALANCE
  // --------------------------------------------------

  const availableBankedTc = toNumber(
    (
      ignite as
        | (IgniteDashboard & {
            tc_bank_available?: number | string;
          })
        | null
        | undefined
    )?.tc_bank_available,
  );

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (!mounted || authStatus !== "authorized" || isLoading) {
    return <DashboardLoader />;
  }

  // --------------------------------------------------
  // Dashboard UI
  // --------------------------------------------------

  return (
    <div
      suppressHydrationWarning
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="distributor-dashboard flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-white"
    >
      <FontImport />

      <DashboardHeader distributorId={ignite?.ba_id || "N/A"} />

      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Sidebar />

        <main className="thin-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#F8F9FB] px-3 pb-7 pt-3 sm:px-4 sm:pb-9 sm:pt-4 lg:px-5 lg:pt-5 xl:px-6">
          <div className="mx-auto w-full min-w-0 max-w-[1390px]">
            <WelcomeHero
              user={user}
              distributorId={ignite?.ba_id || "N/A"}
            />

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
                  className="shrink-0 rounded-[9px] bg-[#171717] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#333333]"
                >
                  Retry
                </button>
              </div>
            )}

            <QuickStatsCards
              cashWallet={
                ignite?.cash_bal == null ? null : toNumber(ignite.cash_bal)
              }
              floatingRetailProfit={
                (dashboard as any)?.floating_retail_profit == null
                  ? null
                  : toNumber((dashboard as any).floating_retail_profit)
              }
              directReferral={
                (dashboard as any)?.direct_referrals == null
                  ? null
                  : toNumber((dashboard as any).direct_referrals)
              }
            />

            <section className="mt-4 sm:mt-5">
              <CoinsSection
                ignite={ignite}
                onRedeemSuccess={handleCoinRedeemSuccess}
              />
            </section>

            <DashboardOverview stats={stats} />

            <section className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:mt-6 sm:gap-4 xl:grid-cols-2">
              <LatestOrderSection order={dashboard?.latest_order ?? null} />

              <RecentActivity activity={activity} />
            </section>

            <section className="mt-5 min-w-0 sm:mt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <SectionTitle large>
                    CV &amp; network performance
                  </SectionTitle>

                  <p className="ml-11 mt-1 text-[11px] leading-5 text-[#888888]">
                    Monitor your sales periods, placement and rank progression.
                  </p>
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[.13em] text-[#A6A6A6]">
                  Performance center
                </span>
              </div>

              <SalesCalendarPoster
                calendar={salesCalendar}
                selectedWeek={
                  selectedCvYear === calendarYear ? selectedCvWeek : -1
                }
                onSelectWeek={(weekNo) => {
                  setSelectedCvYear(calendarYear);
                  setSelectedCvWeek(weekNo);
                }}
              >
                <CvFilters
                  calendar={salesCalendar}
                  selectedYear={selectedCvYear}
                  selectedWeek={selectedCvWeek}
                  onYearChange={(year) => {
                    setSelectedCvYear(year);

                    setSelectedCvWeek(year === calendarYear ? calendarWeek : 1);
                  }}
                  onWeekChange={setSelectedCvWeek}
                  onSearch={handleCvSearch}
                  isFetching={Boolean(
                    pairingsQuery.isFetching || pairingsQuery.isLoading,
                  )}
                  isError={Boolean(pairingsQuery.isError)}
                  hasSearched={Boolean(submittedCvFilters)}
                  searchedYear={submittedCvFilters?.year}
                  searchedWeek={submittedCvFilters?.week_no}
                />
              </SalesCalendarPoster>

              <div className="mt-3 grid min-w-0 grid-cols-1 items-stretch gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-2">
                <AccountSummary ignite={cvCounterIgnite} />

                <AccountTable
                  ignite={cvCounterIgnite}
                  onOpenBankedTc={() => setIsBankedTcModalOpen(true)}
                />
              </div>
            </section>

            {isFetching && !isLoading && (
              <div className="mt-4 flex items-center justify-end gap-2 text-[11px] font-semibold text-[#777777]">
                <Loader2 size={13} className="animate-spin" />

                <span>Updating dashboard...</span>
              </div>
            )}
          </div>
        </main>
      </div>

      <BankedTcModal
        isOpen={isBankedTcModalOpen}
        availableCount={availableBankedTc}
        isLoading={isPlacingBankedTc}
        pendingSide={pendingBankedTcSide}
        onClose={() => setIsBankedTcModalOpen(false)}
        onSelectSide={handleBankedTcPlacement}
      />
    </div>
  );
}