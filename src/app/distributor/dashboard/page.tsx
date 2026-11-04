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
  CalendarClock,
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
  useGetMyAccountsQuery,
  usePlaceBankedTcMutation,
  useRedeemCoinsMutation,
} from "@/lib/redux/api/distributor/userDashboardApi";

import { useGetPairingsQuery } from "@/lib/redux/api/distributor/pairingsApi";
import { useLazyGetTrackingCvCounterQuery } from "@/lib/redux/api/distributor/trackingCvCounterApi";
import {
  BarChart3,
  Network,
  RefreshCw,
  IndianRupee,
  ChevronRight,
} from "lucide-react";

import Loding from "@/components/common/Loding";

// --------------------------------------------------
// Shared design primitives
// --------------------------------------------------

const CARD =
  "min-w-0 rounded-[16px] border border-[#E6E9EF] bg-white shadow-[0_4px_20px_rgba(24,39,75,0.03)]";

const CARD_HOVER =
  "transition-all duration-200 hover:border-[#C8CFD9] hover:shadow-[0_12px_28px_rgba(24,39,75,0.06)] motion-reduce:transition-none";

// --------------------------------------------------
// Font
// --------------------------------------------------

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

    .distributor-dashboard, .distributor-dashboard * { box-sizing: border-box; }
    .distributor-dashboard button { -webkit-tap-highlight-color: transparent; }
    .distributor-dashboard ::selection { background: #dadada; color: #101010; }
    .distributor-dashboard .dashboard-number { font-variant-numeric: tabular-nums; }
    .distributor-dashboard .dashboard-card { transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
    .distributor-dashboard .dashboard-card:hover { border-color: #d8d8d8; box-shadow: 0 14px 32px rgba(17,17,17,.045); }
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
            <span className="h-2 w-2 rounded-full bg-[#6686B9]" /> Distributor
            workspace
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
            <span className="h-2 w-2 rounded-full bg-[#55A58C]" /> IndieKonnect
            distributor portal
          </div>
        </div>
      </div>
    </motion.section>
  );
}

type LedgerEntry = {
  id?: number | string;
  category?: string | null;
  tx_type?: string | null;
  date_created?: string | null;
  description?: string | null;
  amount?: number | string | null;
  order_id?: number | string | null;
  related_member?: string | number | null;
};

// --------------------------------------------------
// COMMISSION BREAKDOWN (API-authoritative) types
// --------------------------------------------------

type CommissionBreakdown = {
  cash_count?: number | string | null;
  yellow_count?: number | string | null;
  green_count?: number | string | null;
  blue_count?: number | string | null;
  other_count?: number | string | null;
};

type ExtendedIgnite = IgniteDashboard & {
  cash_bal_inr?: number | string | null;
  retail_profit_usd?: number | string | null;
  weekly_pairing_usd?: number | string | null;
  unilevel_green_coin?: number | string | null;
  strong_leg?: string | null;
  exchange_rate?: number | string | null;
  green_note?: string | null;
  far_left_id?: number | string | null;
  far_left_ba_id?: string | null;
  far_right_id?: number | string | null;
  far_right_ba_id?: string | null;
  commissions_history?: LedgerEntry[] | null;
  commission_breakdown?: CommissionBreakdown | null;
};

// --------------------------------------------------
// Quick stats cards
// --------------------------------------------------

function QuickStatsCards({ ignite }: { ignite?: IgniteDashboard | null }) {
  const info = ignite as ExtendedIgnite | null | undefined;
  const cards = [
    {
      label: "Cash wallet (INR)",
      value: info?.cash_bal_inr,
      prefix: "₹",
      icon: Wallet,
      note: "INR value reported by API",
      tone: "#256b58",
      bg: "#e9f7f0",
    },
    {
      label: "Retail profit (USD)",
      value: info?.retail_profit_usd,
      prefix: "₹",
      icon: ShoppingBag,
      note: "Retail profit balance",
      tone: "#54729a",
      bg: "#edf2fa",
    },
    {
      label: "Weekly pairing (USD)",
      value: info?.weekly_pairing_usd,
      prefix: "₹",
      icon: TrendingUp,
      note: "Weekly pairing amount",
      tone: "#776a98",
      bg: "#f2eff8",
    },
    {
      label: "Unilevel green coins",
      value: info?.unilevel_green_coin,
      prefix: "",
      icon: UsersRound,
      note: "Coins earned from unilevel",
      tone: "#b18432",
      bg: "#fbf5e8",
    },
  ];
  return (
    <section
      aria-label="Key dashboard earnings"
      className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`${CARD} dashboard-card flex min-h-[105px] min-w-0 items-center gap-3 p-3.5 sm:p-4`}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ color: item.tone, backgroundColor: item.bg }}
            >
              <Icon size={19} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#707b8e]">
                {item.label}
              </p>
              <p className="dashboard-number mt-1 break-words text-[22px] font-bold leading-tight tracking-tight text-[#1e293b]">
                {item.value == null
                  ? "—"
                  : `${item.prefix}${formatNumber(item.value)}`}
              </p>
              <p className="mt-1 text-[10px] text-[#98a2b3]">
                {item.value == null ? "Not provided by API" : item.note}
              </p>
            </div>
          </div>
        );
      })}
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

type RedeemPointType = "yellow_bal" | "blue_bal";

type IgniteCoinValues = {
  yellow_value_usd?: number | string | null;
  yellow_value_inr?: number | string | null;
  green_value_usd?: number | string | null;
  green_value_inr?: number | string | null;
  blue_value_usd?: number | string | null;
  blue_value_inr?: number | string | null;
};

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
  const tone = {
    yellow: "#F5B919",
    green: "#19B85D",
    blue: "#2375EA",
  }[color];

  return (
    <div
      className="group flex min-h-[132px] min-w-0 flex-col items-center justify-center rounded-[12px] border border-[#E9EBEF] bg-white px-2 py-3 text-center transition-colors hover:border-[#D4DAE3] hover:bg-[#FCFDFE]"
      title={`${label} • USD: ${valueUsd == null ? "Not available" : formatCurrency(valueUsd, "USD")} • INR: ${valueInr == null ? "Not available" : formatCurrency(valueInr, "INR")}`}
    >
      <svg
        aria-hidden="true"
        width="40"
        height="40"
        viewBox="0 0 48 48"
        fill="none"
        className="shrink-0"
      >
        <ellipse
          cx="24"
          cy="17"
          rx="17"
          ry="9"
          stroke={tone}
          strokeWidth="2.3"
        />
        <ellipse
          cx="24"
          cy="16"
          rx="13.5"
          ry="6.5"
          stroke={tone}
          strokeWidth="1.7"
        />
        <path
          d="M7 17v7c0 5 7.6 9 17 9s17-4 17-9v-7"
          stroke={tone}
          strokeWidth="2.3"
        />
        <path
          d="M7 24v5c0 5 7.6 9 17 9s17-4 17-9v-5"
          stroke={tone}
          strokeWidth="2.3"
        />
        <path
          d="M12 28v5M18 31v5M25 33v5M32 31v5M38 28v5"
          stroke={tone}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
      <p className="dashboard-number mt-1 text-[27px] font-semibold leading-none tracking-[-.04em] text-[#202020] sm:text-[29px]">
        {value == null ? "—" : formatNumber(value)}
      </p>
      <p className="mt-2 text-[12px] font-medium leading-4 text-[#343434] sm:text-[13px]">
        {label}
      </p>
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

  const [redeemCoins, { isLoading: isRedeeming }] = useRedeemCoinsMutation();

  const yellowBalance = toNumber(coinValues?.yellow_bal);
  const blueBalance = toNumber(coinValues?.blue_bal);

  const selectedBalance =
    selectedRedeemPoint === "yellow_bal" ? yellowBalance : blueBalance;

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
    <section className="min-w-0 rounded-[12px] border border-[#E9EAEE] bg-white px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-medium text-[#313138]">My Coins</h2>
        <button
          type="button"
          onClick={() => setIsRedeemModalOpen(true)}
          className="inline-flex h-[35px] items-center justify-center gap-2 rounded-[9px] bg-[#171717] px-3.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#333333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/30 focus-visible:ring-offset-2"
        >
          <HandCoins size={14} /> Redeem Coins
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <CoinCard
          color="yellow"
          value={coinValues?.yellow_bal ?? 0}
          valueUsd={coinValues?.yellow_value_usd}
          valueInr={coinValues?.yellow_value_inr}
          label="Yellow Coin"
        />
        <CoinCard
          color="green"
          value={coinValues?.green_bal ?? 0}
          valueUsd={coinValues?.green_value_usd}
          valueInr={coinValues?.green_value_inr}
          label="Green Coin"
        />
        <CoinCard
          color="blue"
          value={coinValues?.blue_bal ?? 0}
          valueUsd={coinValues?.blue_value_usd}
          valueInr={coinValues?.blue_value_inr}
          label="Blue Coin"
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
            className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-[#21845F]" : "bg-[#BDBDBD]"}`}
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
                  : index === 1
                    ? "border-[#E9ECEF] bg-[#F9FAFB]"
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
        <span className="text-[11px] text-[#888888]">Membership status</span>
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
  const availableBankedTc = toNumber(ignite?.tc_bank_available);
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
                className={`min-w-0 break-words text-[10px] font-semibold sm:text-[11px] ${isActive ? "text-[#25845F]" : "text-[#858585]"}`}
              >
                <span
                  className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${isActive ? "bg-[#25845F]" : "bg-[#AFAFAF]"}`}
                />
                {formatStatus(ignite.membership_status)}
              </span>
              <ChevronDown
                size={16}
                className={`text-[#777777] transition-transform ${expanded ? "rotate-180" : ""}`}
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
            <HandCoins size={15} /> Place Banked TC <ArrowRight size={14} />
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
          className={`thin-scroll mt-4 ${hasOverflow ? "overflow-y-auto pr-1" : ""}`}
          style={
            hasOverflow
              ? {
                  maxHeight: `${MAX_VISIBLE_ACTIVITY * ACTIVITY_ITEM_HEIGHT}px`,
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

function LatestOrderSection({ order }: { order: DashboardLatestOrder | null }) {
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
// CV filters + Sales calendar
// --------------------------------------------------

type SalesCalendarWeek = {
  year?: number;
  week_no?: number;
  start?: string | null;
  end?: string | null;
  payout_date?: string | null;
  is_current?: boolean;
  is_settled?: boolean;
};

type SalesCalendarMonth = {
  month_no: number;
  label?: string;
  is_current?: boolean;
  weeks?: SalesCalendarWeek[];
};

type SalesCalendar = {
  year?: number;
  all_months?: SalesCalendarMonth[];
  current_month?: {
    year?: number;
    month_no?: number;
    label?: string;
    start?: string | null;
    end?: string | null;
  };
  current_week?: SalesCalendarWeek;
};

type CvSearchFilters = {
  year: number;
  week_no: number;
};

type PairingsQueryResult = {
  data?: any;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  refetch?: () => Promise<unknown> | unknown;
};

// --------------------------------------------------
// Calendar helpers (API is authoritative)
// --------------------------------------------------

function parseCalendarDate(value?: string | null): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCalendarDate(value?: string | null): string {
  const date = parseCalendarDate(value);
  if (!date) return value || "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function formatDateObject(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function getCalendarYear(calendar?: SalesCalendar): number {
  const year = Number(calendar?.current_week?.year ?? calendar?.year);
  return Number.isFinite(year) && year > 0 ? year : new Date().getFullYear();
}

function getCurrentMonth(
  calendar?: SalesCalendar,
): SalesCalendarMonth | undefined {
  return calendar?.all_months?.find(
    (month) => month.is_current || month.weeks?.some((week) => week.is_current),
  );
}

function getActiveCalendarWeek(
  calendar?: SalesCalendar,
): SalesCalendarWeek | undefined {
  if (calendar?.current_week?.week_no) return calendar.current_week;
  for (const month of calendar?.all_months ?? []) {
    const found = month.weeks?.find((week) => week.is_current);
    if (found) return { ...found, year: found.year ?? calendar?.year };
  }
  return undefined;
}

function getCurrentCalendarWeek(calendar?: SalesCalendar): number {
  const week = Number(getActiveCalendarWeek(calendar)?.week_no);
  return Number.isFinite(week) && week > 0 ? week : 1;
}

function formatPosterApiDate(value?: string | null): string {
  if (!value) return "—";
  const date = parseCalendarDate(value);
  if (!date) return "—";
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

const POSTER_RANK_BASIS_2026: Record<
  number,
  { title: string; period: string }
> = {
  5: { title: "DEFAULT LAUNCH RANK", period: "" },
  6: { title: "SALES FROM WEEK 17 TO 20", period: "25 APR TO 22 MAY" },
  7: { title: "SALES FROM WEEK 21 TO 25", period: "23 MAY TO 26 JUN" },
  8: { title: "SALES FROM WEEK 26 TO 29", period: "27 JUN TO 24 JUL" },
  9: { title: "SALES FROM WEEK 30 TO 33", period: "25 JUL TO 21 AUG" },
  10: { title: "SALES FROM WEEK 34 TO 38", period: "22 AUG TO 25 SEP" },
  11: { title: "SALES FROM WEEK 39 TO 42", period: "26 SEP TO 23 OCT" },
  12: { title: "SALES FROM WEEK 43 TO 46", period: "24 OCT TO 20 NOV" },
};

function buildCvWeekOptions(
  year: number,
  calendar?: SalesCalendar,
): Array<{ value: number; label: string; description: string }> {
  const calendarYear = getCalendarYear(calendar);
  if (year === calendarYear && calendar?.all_months?.length) {
    const allWeeks = calendar.all_months
      .flatMap((month) => month.weeks ?? [])
      .filter(
        (week): week is SalesCalendarWeek & { week_no: number } =>
          typeof week.week_no === "number" && week.week_no > 0,
      )
      .sort((a, b) => a.week_no - b.week_no);
    if (allWeeks.length) {
      return allWeeks.map((week) => ({
        value: week.week_no,
        label: `Week ${week.week_no}`,
        description: `${formatCalendarDate(week.start)} – ${formatCalendarDate(week.end)} ${year}`,
      }));
    }
  }

  const apiWeekNo = getCurrentCalendarWeek(calendar);
  const apiStart = parseCalendarDate(getActiveCalendarWeek(calendar)?.start);
  let firstWeekStart: Date;
  if (year === calendarYear && apiStart) {
    firstWeekStart = new Date(apiStart);
    firstWeekStart.setDate(firstWeekStart.getDate() - (apiWeekNo - 1) * 7);
  } else {
    firstWeekStart = new Date(year, 0, 1);
    firstWeekStart.setDate(
      firstWeekStart.getDate() + ((6 - firstWeekStart.getDay() + 7) % 7),
    );
  }
  const options: Array<{ value: number; label: string; description: string }> =
    [];
  for (let weekNo = 1; weekNo <= 53; weekNo++) {
    const date = new Date(firstWeekStart);
    date.setDate(date.getDate() + (weekNo - 1) * 7);
    if (date.getFullYear() !== year) break;
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    options.push({
      value: weekNo,
      label: `Week ${weekNo}`,
      description: `${formatDateObject(date)} – ${formatDateObject(end)} ${year}`,
    });
  }
  return options;
}

function getCvYearOptions(calendar?: SalesCalendar): number[] {
  const currentYear = getCalendarYear(calendar);
  return Array.from({ length: 6 }, (_, index) => currentYear - index);
}

// --------------------------------------------------
// Image-inspired 2026 sales calendar, dynamically populated from the API
// --------------------------------------------------

function PosterCalendarTable({
  months,
  year,
  selectedWeek,
  onSelectWeek,
}: {
  months: SalesCalendarMonth[];
  year: number;
  selectedWeek: number;
  onSelectWeek: (weekNo: number) => void;
}) {
  const header =
    "border border-[#c5d1e1] px-1 py-1.5 text-center text-[8px] font-bold uppercase leading-[1.2] sm:text-[9px]";
  const cell =
    "border border-[#c5d1e1] px-1 py-[5px] text-center text-[9px] leading-[1.2] sm:text-[9.5px]";
  return (
    <div className="min-w-0 overflow-x-auto rounded-lg border border-[#d8e2f0] bg-white shadow-[0_2px_8px_rgba(16,42,85,.06)]">
      <table className="w-full min-w-[455px] table-fixed border-collapse bg-white">
        <thead>
          <tr className="bg-[#113a83] text-white">
            <th className={`${header} w-[9%] border-[#29549c]`}>
              Sales
              <br />
              month
            </th>
            <th className={`${header} border-[#29549c]`} colSpan={3}>
              Sales week
            </th>
            <th className={`${header} w-[20%] border-[#29549c]`}>
              Commission
              <br />
              payout
            </th>
            <th className={`${header} w-[19%] border-[#29549c]`}>Rank basis</th>
          </tr>
          <tr className="bg-[#f5cb53] text-[#173a70]">
            <th className={header} aria-label="Month number" />
            <th className={header}>Week</th>
            <th className={header}>Start date</th>
            <th className={header}>End date</th>
            <th className={header}>Date</th>
            <th className={header} aria-label="Rank basis detail" />
          </tr>
        </thead>
        {months.map((month) => {
          const weeks = [...(month.weeks ?? [])]
            .filter((week) => typeof week.week_no === "number")
            .sort((a, b) => (a.week_no ?? 0) - (b.week_no ?? 0));
          const basis =
            year === 2026 ? POSTER_RANK_BASIS_2026[month.month_no] : undefined;
          if (!weeks.length) return null;
          return (
            <tbody key={`${year}-${month.month_no}`}>
              {weeks.map((week, index) => {
                const active = Boolean(week.is_current);
                const selected = week.week_no === selectedWeek;
                return (
                  <tr
                    key={`${month.month_no}-${week.week_no}`}
                    className={`transition-colors ${selected ? "bg-[#edf4ff]" : "bg-white hover:bg-[#f5f8ff]"}`}
                  >
                    {index === 0 && (
                      <td
                        rowSpan={weeks.length}
                        className="border border-[#c5d1e1] bg-[#f8dfa0] px-0.5 text-center align-middle"
                      >
                        <span className="text-[19px] font-extrabold leading-none text-[#123d84] sm:text-[22px]">
                          {month.month_no}
                        </span>
                      </td>
                    )}
                    <td className={`${cell} w-[8%] font-black text-[#123d84]`}>
                      <button
                        type="button"
                        title={`Week ${week.week_no} · ${week.is_settled ? "Settled" : "Pending"}${active ? " · Current week" : ""}`}
                        onClick={() => onSelectWeek(week.week_no!)}
                        aria-label={`Select week ${week.week_no} for CV search`}
                        aria-pressed={selected}
                        className={`mx-auto flex h-[22px] min-w-[24px] items-center justify-center rounded px-0.5 text-[10px] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#f2a91b] ${selected ? "bg-[#123d84] text-white" : active ? "bg-[#ffe6a0] text-[#123d84] hover:bg-[#fbd473]" : "text-[#123d84] hover:bg-[#dceaff]"}`}
                      >
                        {week.week_no}
                      </button>
                    </td>
                    <td
                      className={`${cell} whitespace-nowrap text-[#364b67]`}
                      title={week.start ?? ""}
                    >
                      {formatPosterApiDate(week.start)}
                    </td>
                    <td
                      className={`${cell} whitespace-nowrap text-[#364b67]`}
                      title={week.end ?? ""}
                    >
                      {formatPosterApiDate(week.end)}
                    </td>
                    <td
                      className={`${cell} whitespace-nowrap bg-[#fff0b5]`}
                      title={week.payout_date ?? ""}
                    >
                      <span className="rounded-sm bg-[#f8e6a9] px-0.5 py-0.5 font-bold text-[#143f82]">
                        {formatPosterApiDate(week.payout_date)}
                      </span>
                    </td>
                    {index === 0 && (
                      <td
                        rowSpan={weeks.length}
                        className="border border-[#c5d1e1] bg-[#f9fafc] px-1 py-1.5 text-center align-middle"
                      >
                        {basis ? (
                          <div className="mx-auto max-w-[125px] text-[9px] font-bold uppercase leading-[1.3] text-[#153c79]">
                            {basis.title}
                            {basis.period && (
                              <div className="mt-0.5 text-[8px] font-medium text-[#68778c]">
                                ({basis.period})
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-[#8290a3]">
                            —
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

function SalesCalendarPoster({
  calendar,
  selectedWeek,
  onSelectWeek,
  children,
}: {
  calendar?: SalesCalendar;
  selectedWeek: number;
  onSelectWeek: (weekNo: number) => void;
  children?: React.ReactNode;
}) {
  const year = getCalendarYear(calendar);
  const months = [...(calendar?.all_months ?? [])].sort(
    (a, b) => a.month_no - b.month_no,
  );
  const half = Math.ceil(months.length / 2);
  const activeWeek = getActiveCalendarWeek(calendar);
  if (!months.length) {
    return (
      <section className="mt-5 rounded-[18px] border border-[#e3e8f0] bg-white p-5">
        <div className="flex items-center gap-3">
          <CalendarClock size={20} className="text-[#67758b]" />
          <div>
            <h3 className="text-[15px] font-bold text-[#1d2939]">
              Sales Month Calendar
            </h3>
            <p className="mt-0.5 text-[12px] text-[#667085]">
              Calendar data is not available from the dashboard API.
            </p>
          </div>
        </div>
        {children && (
          <div className="mt-4 border-t border-[#e3e8f0] pt-3">{children}</div>
        )}
      </section>
    );
  }

  return (
    <section className="relative isolate mt-3 overflow-hidden rounded-[16px] border border-[#d7e0eb] bg-gradient-to-br from-[#eaf1fb] via-[#f5f8fc] to-white p-3 shadow-[0_3px_14px_rgba(16,42,85,.04)] sm:p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(90deg,rgba(54,95,157,.035),transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border-[12px] border-[#d5e4f8]/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-20 h-36 w-36 rounded-full bg-[#c7e1ff]/15 blur-2xl"
      />

      <div className="relative mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 rounded-md border border-[#e9d8a0] bg-[#fff2c7] px-2 py-1">
          <span className="text-[9px] font-black leading-[1.05] tracking-tight text-[#164286]">
            INDIE
            <br />
            KONNECT
          </span>
        </div>
        {activeWeek && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e2ee] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#34547f]">
            <span className="h-2 w-2 rounded-full bg-[#d09e36]" />
            Current week {activeWeek.week_no}
          </span>
        )}
      </div>

      {children && (
        <div className="relative mb-4 rounded-[12px] border border-[#dce5ef] bg-white/90 p-3 sm:p-4">
          {children}
        </div>
      )}

      <div className="relative mb-3 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h2 className="text-[17px] font-extrabold uppercase leading-tight tracking-[-.025em] text-[#1c3d71] sm:text-[19px] lg:text-[21px]">
            Sales Month Calendar
          </h2>
          <span className="rounded-md border border-[#e3d098] bg-[#fff0c3] px-2 py-0.5 text-[13px] font-extrabold text-[#234b85] sm:text-[14px]">
            {year}
          </span>
        </div>
        <p className="mt-1 text-[10px] leading-4 text-[#65758b]">
          Click a week number to select it for CV performance search
        </p>
      </div>

      <div className="relative grid min-w-0 grid-cols-1 items-start gap-2 xl:grid-cols-2">
        <PosterCalendarTable
          months={months.slice(0, half)}
          year={year}
          selectedWeek={selectedWeek}
          onSelectWeek={onSelectWeek}
        />
        <PosterCalendarTable
          months={months.slice(half)}
          year={year}
          selectedWeek={selectedWeek}
          onSelectWeek={onSelectWeek}
        />
      </div>

      <div className="relative mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e0e8f1] bg-white/80 px-2.5 py-2 text-[9px] leading-4 text-[#66758b] sm:text-[10px]">
        <span>
          Week dates and payout dates: dashboard API • Rank basis: supplied 2026
          reference poster
        </span>
        <span className="font-bold text-[#284e85]">www.indiekonnect.com</span>
      </div>
    </section>
  );
}

// --------------------------------------------------
// Pairings metrics
// --------------------------------------------------

function getPairingsMetrics(response: any): Record<string, any> | null {
  if (!response) return null;

  const root = response?.data ?? response;

  const candidates = [
    root?.ignite,
    root?.cv_counter,
    root?.cv_summary,
    root?.summary,
    root?.stats,
    root,
  ];

  const metricKeys = [
    "cv_left",
    "cv_right",
    "total_cv_left",
    "total_cv_right",
    "floating_cv_left",
    "floating_cv_right",
    "left_cv",
    "right_cv",
    "left_total_cv",
    "right_total_cv",
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      metricKeys.some((key) => candidate[key] !== undefined)
    ) {
      const normalized = { ...candidate };

      if (
        normalized.cv_left === undefined &&
        normalized.left_cv !== undefined
      ) {
        normalized.cv_left = normalized.left_cv;
      }

      if (
        normalized.cv_right === undefined &&
        normalized.right_cv !== undefined
      ) {
        normalized.cv_right = normalized.right_cv;
      }

      if (
        normalized.total_cv_left === undefined &&
        (normalized.left_total_cv !== undefined ||
          normalized.left_cv !== undefined)
      ) {
        normalized.total_cv_left =
          normalized.left_total_cv ?? normalized.left_cv;
      }

      if (
        normalized.total_cv_right === undefined &&
        (normalized.right_total_cv !== undefined ||
          normalized.right_cv !== undefined)
      ) {
        normalized.total_cv_right =
          normalized.right_total_cv ?? normalized.right_cv;
      }

      return normalized;
    }
  }

  return null;
}

// --------------------------------------------------
// Dropdown types
// --------------------------------------------------

type DropdownOption<T extends string | number> = {
  value: T;
  label: string;
  description?: string;
};

type SearchableDropdownProps<T extends string | number> = {
  id: string;
  label: string;
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  searchPlaceholder: string;
  emptyMessage: string;
  disabled?: boolean;
  featuredOption?: DropdownOption<T>;
  featuredLabel?: string;
};

// --------------------------------------------------
// Searchable dropdown
// --------------------------------------------------

function SearchableDropdown<T extends string | number>({
  id,
  label,
  options,
  value,
  onChange,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
  featuredOption,
  featuredLabel = "CURRENT WEEK",
}: SearchableDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectedOption = options.find((option) => option.value === value);

  const normalizedQuery = query.trim().toLowerCase();

  const matchesQuery = (option: DropdownOption<T>) =>
    `${option.label} ${option.description ?? ""}`
      .toLowerCase()
      .includes(normalizedQuery);

  const showFeaturedOption = Boolean(
    featuredOption && matchesQuery(featuredOption),
  );

  const filteredOptions = options.filter(
    (option) =>
      matchesQuery(option) &&
      !(featuredOption && option.value === featuredOption.value),
  );

  const chooseOption = (option: DropdownOption<T>) => {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <label
        id={`${id}-label`}
        htmlFor={`${id}-trigger`}
        className="mb-2 block text-[12px] font-semibold text-[#5a6276] sm:text-[13px]"
      >
        {label}
      </label>

      <button
        id={`${id}-trigger`}
        type="button"
        aria-label={`${label}: ${selectedOption?.label ?? "Select an option"}`}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        disabled={disabled}
        onClick={() => setOpen((previous) => !previous)}
        className="group flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-[13px] border border-[#E4E4E4] bg-white px-3.5 text-left outline-none transition-all hover:border-[#ABABAB] hover:bg-[#FCFCFC] focus-visible:border-[#242424] focus-visible:ring-4 focus-visible:ring-[#242424]/10 disabled:cursor-not-allowed disabled:bg-[#f7f8fa] disabled:text-[#98a2b3] sm:px-4"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            id={`${id}-value`}
            className="truncate text-[13px] font-bold leading-5 text-[#101828]"
          >
            {selectedOption?.label ?? "Select an option"}
          </span>

          {selectedOption?.description && (
            <span className="truncate text-[10px] leading-4 text-[#8a92a6] sm:text-[11px]">
              {selectedOption.description}
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-[#7c879b] transition-transform duration-200 group-hover:text-[#262626] ${
            open ? "rotate-180 text-[#262626]" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.99 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+8px)] z-[80] w-full min-w-[220px] overflow-hidden rounded-[16px] border border-[#E4E4E4] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.13)]"
          >
            <div className="border-b border-[#eef1f5] p-3">
              <div className="flex h-10 items-center gap-2.5 rounded-[11px] border border-[#e6eaf0] bg-[#f8fafc] px-3 transition-colors focus-within:border-[#333333] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#333333]/10">
                <Search size={15} className="shrink-0 text-[#8a92a6]" />

                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={`Search ${label.toLowerCase()} options`}
                  autoComplete="off"
                  className="h-full min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#101828] outline-none placeholder:text-[#98a2b3]"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[16px] leading-none text-[#8a92a6] hover:bg-[#e9edf4] hover:text-[#101828]"
                  >
                    ×
                  </button>
                )}
              </div>

              <p className="mt-2 px-1 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#98a2b3]">
                {filteredOptions.length + (showFeaturedOption ? 1 : 0)} options
              </p>
            </div>

            <div
              id={`${id}-listbox`}
              role="listbox"
              aria-label={`${label} options`}
              className="thin-scroll max-h-[270px] overflow-y-auto p-2"
            >
              {showFeaturedOption && featuredOption && (
                <div className="mb-2">
                  <p className="px-2 pb-1.5 pt-1 text-[9px] font-black tracking-[0.12em] text-[#1f9d6b]">
                    {featuredLabel}
                  </p>

                  <button
                    type="button"
                    role="option"
                    aria-selected={featuredOption.value === value}
                    onClick={() => chooseOption(featuredOption)}
                    className={`flex w-full items-center gap-2.5 rounded-[11px] border px-3 py-2.5 text-left transition-colors ${
                      featuredOption.value === value
                        ? "border-[#D0D0D0] bg-[#F2F2F2]"
                        : "border-[#E7E7E7] bg-[#FAFAFA] hover:bg-[#EFEFEF]"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-white text-[#1f9d6b] ring-1 ring-[#d9eee2]">
                      <CalendarDays size={15} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-extrabold text-[#101828]">
                        {featuredOption.label}
                      </span>

                      {featuredOption.description && (
                        <span className="mt-0.5 block truncate text-[10px] text-[#667085]">
                          {featuredOption.description}
                        </span>
                      )}
                    </span>

                    {featuredOption.value === value && (
                      <Check size={15} className="shrink-0 text-[#1f9d6b]" />
                    )}
                  </button>
                </div>
              )}

              {filteredOptions.length > 0 ? (
                <div className="space-y-1">
                  {filteredOptions.map((option) => {
                    const isSelected = option.value === value;

                    return (
                      <button
                        key={String(option.value)}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => chooseOption(option)}
                        className={`flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left transition-colors ${
                          isSelected
                            ? "bg-[#EFEFEF] text-[#202020]"
                            : "text-[#344054] hover:bg-[#F7F7F7]"
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-bold">
                            {option.label}
                          </span>

                          {option.description && (
                            <span className="mt-0.5 block truncate text-[10px] text-[#8a92a6]">
                              {option.description}
                            </span>
                          )}
                        </span>

                        {isSelected && (
                          <Check
                            size={15}
                            className="shrink-0 text-[#262626]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : !showFeaturedOption ? (
                <div className="px-3 py-7 text-center">
                  <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f4f7] text-[#8a92a6]">
                    <Search size={15} />
                  </span>

                  <p className="mt-2 text-[11px] font-bold text-[#475467]">
                    No results found
                  </p>

                  <p className="mt-1 text-[10px] text-[#98a2b3]">
                    {emptyMessage}
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --------------------------------------------------
// CV filters
// --------------------------------------------------

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
  calendar?: SalesCalendar;
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
  const yearOptions = getCvYearOptions(calendar).map((year) => ({
    value: year,
    label: String(year),
  }));

  const weekOptions = buildCvWeekOptions(selectedYear, calendar);

  const selectedWeekOption = weekOptions.find(
    (option) => option.value === selectedWeek,
  );

  const calendarYear = getCalendarYear(calendar);
  const currentWeekNo = getCurrentCalendarWeek(calendar);

  const featuredWeekOption =
    selectedYear === calendarYear
      ? weekOptions.find((option) => option.value === currentWeekNo)
      : undefined;

  const currentWeek = getActiveCalendarWeek(calendar);
  const apiCurrentMonth = calendar?.current_month;
  const derivedCurrentMonth = getCurrentMonth(calendar);
  const currentMonth: SalesCalendar["current_month"] =
    apiCurrentMonth ??
    (derivedCurrentMonth
      ? {
          year: calendar?.year,
          month_no: derivedCurrentMonth.month_no,
          label: derivedCurrentMonth.label,
          start: derivedCurrentMonth.weeks?.[0]?.start,
          end: (derivedCurrentMonth.weeks ?? []).slice(-1)[0]?.end,
        }
      : undefined);

  const currentWeekLabel =
    currentWeek?.start && currentWeek?.end
      ? `Week ${currentWeek.week_no ?? "—"}: ${formatCalendarDate(
          currentWeek.start,
        )} – ${formatCalendarDate(currentWeek.end)} ${
          currentWeek.year ?? calendar?.year ?? ""
        }`.trim()
      : "Sales calendar from dashboard";

  const currentMonthLabel =
    currentMonth?.start && currentMonth?.end
      ? `${formatCalendarDate(
          currentMonth.start,
        )} – ${formatCalendarDate(currentMonth.end)} ${
          currentMonth.year ?? calendar?.year ?? ""
        }`.trim()
      : currentMonth?.label || "—";

  return (
    <div className="min-w-0">
      <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#ECECEC] bg-[#F7F7F7] text-[#313131]">
            <CalendarDays size={18} />
          </span>

          <div className="min-w-0">
            <h3 className="text-[13px] font-black text-[#101828] sm:text-[14px]">
              Find CV for a sales week
            </h3>

            <p className="mt-1 break-words text-[11px] leading-4 text-[#667085] sm:text-[12px]">
              Current week: {currentWeekLabel}
            </p>

            <p className="mt-0.5 break-words text-[10px] leading-4 text-[#98a2b3] sm:text-[11px]">
              Current month: {currentMonthLabel}
              {currentMonth?.label ? ` · ${currentMonth.label}` : ""}
            </p>
          </div>
        </div>

        {currentWeek?.is_settled !== undefined && (
          <span
            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-[11px] ${
              currentWeek.is_settled
                ? "bg-[#eaf7f0] text-[#1f9d6b]"
                : "bg-[#fff4e5] text-[#a15c07]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                currentWeek.is_settled ? "bg-[#1f9d6b]" : "bg-[#f79009]"
              }`}
            />

            {currentWeek.is_settled ? "Settled" : "Pending settlement"}
          </span>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-1 items-end gap-2 sm:grid-cols-[minmax(100px,.6fr)_minmax(190px,1.4fr)_auto]">
        <SearchableDropdown
          id="cv-calendar-year"
          label="Year"
          value={selectedYear}
          options={yearOptions}
          onChange={onYearChange}
          searchPlaceholder="Search year..."
          emptyMessage="Try another year."
        />

        <SearchableDropdown
          id="cv-calendar-week"
          label="Week"
          value={selectedWeek}
          options={weekOptions}
          onChange={onWeekChange}
          searchPlaceholder="Search week or date..."
          emptyMessage="Try a week number or date, e.g. Oct."
          disabled={weekOptions.length === 0}
          featuredOption={featuredWeekOption}
          featuredLabel="CURRENT WEEK · QUICK SELECT"
        />

        <button
          type="button"
          onClick={onSearch}
          disabled={isFetching || weekOptions.length === 0}
          className="inline-flex h-12 w-full min-w-0 items-center justify-center gap-2 rounded-[12px] bg-[#171717] px-5 text-[13px] font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.10)] transition-all hover:bg-[#333333] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[13.5px] xl:w-auto xl:min-w-[128px]"
        >
          {isFetching ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Search size={15} />
          )}

          {isFetching ? "Searching..." : "Search"}
        </button>
      </div>

      {selectedWeekOption && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#8a92a6] sm:text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f6f8fb] px-2.5 py-1 font-bold text-[#475467]">
            <CalendarDays size={12} />
            Selected period
          </span>

          <span className="font-semibold text-[#667085]">
            {selectedWeekOption.label} · {selectedWeekOption.description}
          </span>
        </div>
      )}

      {hasSearched &&
        searchedYear !== undefined &&
        searchedWeek !== undefined && (
          <div
            role={isError ? "alert" : "status"}
            className={`mt-4 flex min-w-0 items-start gap-2 rounded-[11px] px-3 py-2.5 text-[11px] leading-5 sm:text-[12px] ${
              isError
                ? "border border-[#f2c6c3] bg-[#fff4f3] text-[#b42318]"
                : isFetching
                  ? "border border-[#E4E4E4] bg-[#FAFAFA] text-[#454545]"
                  : "border border-[#DAEBDD] bg-[#F6FBF6] text-[#28724C]"
            }`}
          >
            {isFetching && (
              <Loader2 size={14} className="mt-0.5 shrink-0 animate-spin" />
            )}

            <span className="min-w-0 break-words">
              {isError
                ? `Unable to load CV data for Year ${searchedYear}, Week ${searchedWeek}. Click Search to try again.`
                : isFetching
                  ? `Loading CV data for Year ${searchedYear}, Week ${searchedWeek}...`
                  : `CV search completed for Year ${searchedYear}, Week ${searchedWeek}.`}
            </span>
          </div>
        )}
    </div>
  );
}

// --------------------------------------------------
// API-driven financial and network reporting
// --------------------------------------------------

function DataValue({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="min-w-0 rounded-[11px] border border-[#eaedf1] bg-[#fbfcfd] px-3 py-2.5">
      <p className="text-[10px] font-medium text-[#7c8695]">{label}</p>
      <p className="dashboard-number mt-1 break-all text-[13px] font-bold text-[#253041]">
        {value ?? "—"}
      </p>
      {hint && (
        <p className="mt-1 text-[10px] leading-4 text-[#8993a0]">{hint}</p>
      )}
    </div>
  );
}

function EarnedCoinsAndNetwork({ ignite }: { ignite?: ExtendedIgnite | null }) {
  const left = ignite?.floating_cv_left;
  const right = ignite?.floating_cv_right;
  const paired = ignite?.cv_left;
  const fields = [
    {
      label: "Floating CV • left",
      value: left == null ? "—" : formatNumber(left),
    },
    {
      label: "Floating CV • right",
      value: right == null ? "—" : formatNumber(right),
    },
    {
      label: "Settled CV • left",
      value: ignite?.cv_left == null ? "—" : formatNumber(paired),
    },
    {
      label: "Settled CV • right",
      value: ignite?.cv_right == null ? "—" : formatNumber(ignite.cv_right),
    },
    {
      label: "Total CV • left",
      value:
        ignite?.total_cv_left == null
          ? "—"
          : formatNumber(ignite.total_cv_left),
    },
    {
      label: "Total CV • right",
      value:
        ignite?.total_cv_right == null
          ? "—"
          : formatNumber(ignite.total_cv_right),
    },
    { label: "Strong leg", value: ignite?.strong_leg ?? "—" },
    {
      label: "Total steps",
      value:
        ignite?.total_steps == null ? "—" : formatNumber(ignite.total_steps),
    },
  ];

  return (
    <section className={`${CARD} dashboard-card mt-5 p-4 sm:p-5`}>
      <SectionTitle>Earned coins & network</SectionTitle>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {fields.map((item) => (
          <DataValue key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
}

function FinancialSummary({ ignite }: { ignite?: ExtendedIgnite | null }) {
  const vals = [
    {
      label: "Cash balance (USD units)",
      value:
        ignite?.cash_bal == null ? "—" : `$${formatNumber(ignite.cash_bal)}`,
    },
    {
      label: "Cash balance (INR)",
      value:
        ignite?.cash_bal_inr == null
          ? "—"
          : `₹${formatNumber(ignite.cash_bal_inr)}`,
    },
    {
      label: "Exchange rate",
      value:
        ignite?.exchange_rate == null
          ? "—"
          : formatNumber(ignite.exchange_rate),
    },
    {
      label: "Retail profit (USD)",
      value:
        ignite?.retail_profit_usd == null
          ? "—"
          : `$${formatNumber(ignite.retail_profit_usd)}`,
    },
    {
      label: "Weekly pairing (USD)",
      value:
        ignite?.weekly_pairing_usd == null
          ? "—"
          : `$${formatNumber(ignite.weekly_pairing_usd)}`,
    },
    {
      label: "Unilevel green coins",
      value:
        ignite?.unilevel_green_coin == null
          ? "—"
          : formatNumber(ignite.unilevel_green_coin),
    },
  ];

  return (
    <section className={`${CARD} dashboard-card mt-5 p-4 sm:p-5`}>
      <SectionTitle>Financial summary</SectionTitle>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {vals.map((item) => (
          <DataValue key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
}

const ledgerCategories = [
  "all",
  "cash_bal",
  "yellow_bal",
  "green_bal",
  "blue_bal",
] as const;
function formatLedgerDate(value?: string | null) {
  if (!value) return "—";
  return value.replace("T", " ").slice(0, 19);
}
function LedgerHistory({ entries }: { entries?: LedgerEntry[] | null }) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filtered = (entries ?? [])
    .filter((entry) => {
      if (filter !== "all" && entry.category !== filter) return false;
      const needle = search.toLowerCase().trim();
      return (
        !needle ||
        [
          entry.id,
          entry.category,
          entry.tx_type,
          entry.description,
          entry.order_id,
          entry.related_member,
          entry.date_created,
        ].some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(needle),
        )
      );
    })
    .slice()
    .sort((a, b) => (b.date_created ?? "").localeCompare(a.date_created ?? ""));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const shown = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <section className={`${CARD} dashboard-card mt-5 p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <SectionTitle>Wallet ledger</SectionTitle>
          <p className="ml-11 mt-1 text-[11px] text-[#929292]">
            Full history of credits and debits
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search ledger..."
            className="h-9 min-w-0 rounded-[9px] border border-[#E4E7EC] bg-white px-3 text-[12px] text-[#344054] outline-none placeholder:text-[#98a2b3] focus:border-[#7183A3]"
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ledgerCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setFilter(cat);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
              filter === cat
                ? "border-[#171717] bg-[#171717] text-white"
                : "border-[#E4E7EC] bg-white text-[#475467] hover:bg-[#F5F6F8]"
            }`}
          >
            {cat === "all" ? "All" : formatStatus(cat)}
          </button>
        ))}
      </div>
      {shown.length > 0 ? (
        <div className="mt-3 overflow-x-auto rounded-[12px] border border-[#EBEBEB]">
          <table className="w-full min-w-[520px] border-collapse text-left text-[11px]">
            <thead>
              <tr className="bg-[#F7F7F7] text-[10px] uppercase tracking-[.06em] text-[#868686]">
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Category</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Description</th>
                <th className="px-3 py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((entry, i) => (
                <tr
                  key={`${entry.id}-${i}`}
                  className="border-t border-[#EFEFEF] text-[#303030] hover:bg-[#FBFBFB]"
                >
                  <td className="px-3 py-2">{formatLedgerDate(entry.date_created)}</td>
                  <td className="px-3 py-2">{formatStatus(entry.category)}</td>
                  <td className="px-3 py-2">{formatStatus(entry.tx_type)}</td>
                  <td className="px-3 py-2 break-words">
                    {entry.description || "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-bold">
                    {entry.amount ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 rounded-[12px] border border-dashed border-[#E8E8E8] bg-[#FBFBFB] p-5 text-center text-[11px] text-[#929292]">
          No ledger entries match the current filter.
        </p>
      )}
      {pages > 1 && (
        <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-[#667085]">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-[#E4E7EC] bg-white px-2 py-1 font-semibold disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {currentPage} / {pages}
          </span>
          <button
            type="button"
            disabled={currentPage === pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="rounded-md border border-[#E4E7EC] bg-white px-2 py-1 font-semibold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

function ApiDetailsExplorer({
  dashboard,
}: {
  dashboard: Record<string, any> | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  const sections = [
    "user",
    "stats",
    "ignite",
    "latest_order",
    "recent_activity",
    "wishlist",
    "cart",
    "sales_calendar",
  ];

  return (
    <section className={`${CARD} dashboard-card mt-5 p-4 sm:p-5`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <SectionTitle>Raw API details</SectionTitle>
        <ChevronDown
          size={18}
          className={`text-[#777] transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && dashboard && (
        <div className="mt-4 space-y-3">
          {sections.map((key) => (
            <details
              key={key}
              className="rounded-[11px] border border-[#EAEAEA] bg-[#FBFBFB] px-3 py-2"
            >
              <summary className="cursor-pointer text-[11px] font-bold text-[#2B2B2B]">
                {formatStatus(key)}
              </summary>
              <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-white p-2 text-[10px] leading-5 text-[#444]">
                {JSON.stringify(dashboard[key], null, 2)}
              </pre>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================================================
// INLINE TRACKING CENTER (My Accounts + Sales Calendar + CV Counter API)
// ============================================================================
type TrackingRecord = Record<string, unknown>;
const trackObj = (x: unknown): TrackingRecord =>
  x && typeof x === "object" && !Array.isArray(x) ? (x as TrackingRecord) : {};
const trackList = (x: unknown): TrackingRecord[] =>
  Array.isArray(x) ? x.map(trackObj) : [];
const trackField = (x: TrackingRecord, ...names: string[]): unknown => {
  for (const key of names)
    if (x[key] !== undefined && x[key] !== null) return x[key];
  return undefined;
};
const trackFmt = (x: unknown) => {
  if (x == null || x === "") return "—";
  const n = Number(x);
  return Number.isFinite(n)
    ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : String(x);
};
const trackDate = (x: unknown) => {
  const m = String(x ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "—";
  return `${m[3]} ${new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}`;
};

type TrackWeek = {
  year: number;
  weekNo: number;
  start: string;
  end: string;
  isCurrent: boolean;
  isSettled: boolean;
};
type TrackAccount = { baId: string; rank: string; status: string };
type TrackHistory = {
  id?: number | string;
  category?: string;
  tx_type?: string;
  amount?: number | string;
  date_created?: string;
};

function DashboardTrackingCenter({
  dashboardData,
  ignite,
}: {
  dashboardData: unknown;
  ignite?: IgniteDashboard | null;
}) {
  const accountsQuery = useGetMyAccountsQuery();
  const [loadCv, cvRequest] = useLazyGetTrackingCvCounterQuery();
  const [accountId, setAccountId] = useState("");
  const [year, setYear] = useState("");
  const [weekNo, setWeekNo] = useState("");
  const [response, setResponse] = useState<unknown>(null);
  const [selectedQuery, setSelectedQuery] = useState("");
  const [requestError, setRequestError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const source = trackObj(accountsQuery.data);
  const container = trackObj(source.data);
  const rawAccounts = [
    source.data,
    container.accounts,
    container.items,
    container.records,
    source.accounts,
    source.records,
    trackObj(container.data).accounts,
  ].find(Array.isArray);
  const accounts: TrackAccount[] = trackList(rawAccounts)
    .flatMap((a) => {
      const baId = String(a.ba_id ?? a.account_id ?? "").trim();
      return baId
        ? [
            {
              baId,
              rank: String(a.rank_name ?? a.rank ?? "—"),
              status: String(a.status ?? a.membership_status ?? "—"),
            },
          ]
        : [];
    })
    .filter((a, i, arr) => arr.findIndex((b) => b.baId === a.baId) === i);

  const db = trackObj(dashboardData);
  const calendar = trackObj(db.sales_calendar);
  const weeks: TrackWeek[] = trackList(calendar.all_months)
    .flatMap((month) =>
      trackList(month.weeks).flatMap((w) => {
        const number = Number(w.week_no);
        const wkYear = Number(w.year ?? calendar.year);
        return Number.isFinite(number) && number > 0 && Number.isFinite(wkYear)
          ? [
              {
                year: wkYear,
                weekNo: number,
                start: String(w.start ?? ""),
                end: String(w.end ?? ""),
                isCurrent: w.is_current === true,
                isSettled: w.is_settled === true,
              },
            ]
          : [];
      }),
    )
    .filter(
      (w, i, arr) =>
        arr.findIndex(
          (other) => other.year === w.year && other.weekNo === w.weekNo,
        ) === i,
    )
    .sort((a, b) => a.year - b.year || a.weekNo - b.weekNo);
  const years = [...new Set(weeks.map((w) => w.year))].sort((a, b) => b - a);
  const weeksOfYear = weeks.filter((w) => String(w.year) === year);
  const currentWeek = weeks.find((w) => w.isCurrent);

  useEffect(() => {
    if (accounts.length && !accounts.some((a) => a.baId === accountId))
      setAccountId(accounts[0].baId);
  }, [accountsQuery.data, accountId]);
  useEffect(() => {
    if (years.length && !years.some((y) => String(y) === year))
      setYear(String(currentWeek?.year ?? years[0]));
  }, [dashboardData, year]);
  useEffect(() => {
    if (
      weeksOfYear.length &&
      !weeksOfYear.some((w) => String(w.weekNo) === weekNo)
    ) {
      setWeekNo(
        String(
          weeksOfYear.find((w) => w.isCurrent)?.weekNo ??
            weeksOfYear[weeksOfYear.length - 1].weekNo,
        ),
      );
    }
  }, [year, dashboardData, weekNo]);

  const onChange = () => {
    setResponse(null);
    setHasSearched(false);
    setRequestError("");
  };
  const selectedAccount = accounts.find((a) => a.baId === accountId);
  const chosenWeek = weeksOfYear.find((w) => String(w.weekNo) === weekNo);
  const canSearch =
    Boolean(selectedAccount && chosenWeek) && !cvRequest.isFetching;
  const showCv = async () => {
    if (!selectedAccount || !chosenWeek) return;
    setRequestError("");
    setHasSearched(true);
    setResponse(null);
    setSelectedQuery(`${selectedAccount.baId}|${year}|${weekNo}`);
    try {
      const result = await loadCv(
        {
          ba_id: selectedAccount.baId,
          year: Number(year),
          week_no: Number(weekNo),
        },
        false,
      ).unwrap();
      if (trackObj(result).success === false)
        throw new Error(
          String(trackObj(result).message ?? "CV request failed"),
        );
      setResponse(result);
    } catch (e: unknown) {
      const obj = trackObj(e);
      setRequestError(
        String(
          trackObj(obj.data).message ??
            obj.message ??
            obj.error ??
            "Unable to load CV data.",
        ),
      );
    }
  };
  const activeKey = `${accountId}|${year}|${weekNo}`;
  const validResponse =
    hasSearched && selectedQuery === activeKey && response !== null;
  const cvPayload = trackObj(trackObj(response).data ?? response);
  const cvCurrent = trackObj(cvPayload.current);
  const weekResult = trackObj(cvPayload.week_result);
  const resultPresent =
    validResponse &&
    cvPayload.week_result !== null &&
    Object.keys(weekResult).length > 0;
  const settled = cvPayload.is_settled === true;
  const currentMetrics = [
    { label: "Left CV", value: trackField(cvCurrent, "cv_left") },
    { label: "Right CV", value: trackField(cvCurrent, "cv_right") },
    {
      label: "Floating Left CV",
      value: trackField(cvCurrent, "floating_cv_left"),
    },
    {
      label: "Floating Right CV",
      value: trackField(cvCurrent, "floating_cv_right"),
    },
    { label: "Total Left CV", value: trackField(cvCurrent, "total_cv_left") },
    { label: "Total Right CV", value: trackField(cvCurrent, "total_cv_right") },
    { label: "Current Rank", value: trackField(cvCurrent, "rank_no") },
    { label: "Total Steps", value: trackField(cvCurrent, "total_steps") },
  ];
  const extraWeekMetrics = [
    {
      label: "Paired CV",
      value: trackField(weekResult, "paired_cv", "total_paired_cv"),
    },
    {
      label: "Pairing commission",
      value: trackField(
        weekResult,
        "pairing_commission",
        "pairing_commission_usd",
      ),
    },
    {
      label: "Green Coins",
      value: trackField(weekResult, "green_coins", "green_coin"),
    },
    {
      label: "Yellow Coins",
      value: trackField(weekResult, "yellow_coins", "yellow_coin"),
    },
    {
      label: "Blue Coins",
      value: trackField(weekResult, "blue_coins", "blue_coin"),
    },
  ];

  // ---------------------------------------------------------------
  // Commission History Breakdown — API-authoritative counts
  // Uses ignite.commission_breakdown when present; falls back to
  // counting commissions_history by point_type otherwise.
  // ---------------------------------------------------------------
  const history = ((ignite as ExtendedIgnite | null | undefined)
    ?.commissions_history ?? []) as TrackHistory[];
  const apiBreakdown = (ignite as ExtendedIgnite | null | undefined)
    ?.commission_breakdown;

  const toCount = (value: number | string | null | undefined): number => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  };

  const countByPointType = (pointType: string) =>
    history.filter(
      (h) => String((h as any)?.point_type ?? "").toLowerCase() === pointType,
    ).length;

  const cashCount = apiBreakdown
    ? toCount(apiBreakdown.cash_count)
    : countByPointType("cash_bal");
  const yellowCount = apiBreakdown
    ? toCount(apiBreakdown.yellow_count)
    : countByPointType("yellow_bal");
  const greenCount = apiBreakdown
    ? toCount(apiBreakdown.green_count)
    : countByPointType("green_bal");
  const blueCount = apiBreakdown
    ? toCount(apiBreakdown.blue_count)
    : countByPointType("blue_bal");

  const breakdownGroups = [
    { category: "cash", label: "Cash wallet", color: "#5275b5", count: cashCount },
    { category: "yellow", label: "Yellow coins", color: "#e5b04c", count: yellowCount },
    { category: "green", label: "Green coins", color: "#4cae8a", count: greenCount },
    { category: "blue", label: "Blue coins", color: "#91b4ea", count: blueCount },
  ];
  const otherBreakdownCount = apiBreakdown
    ? toCount(apiBreakdown.other_count)
    : 0;
  const allGroups = otherBreakdownCount
    ? [
        ...breakdownGroups,
        {
          category: "other",
          label: "Other",
          color: "#9ca3af",
          count: otherBreakdownCount,
        },
      ]
    : breakdownGroups;
  const sumCount = allGroups.reduce((n, g) => n + g.count, 0);
  let donutOffset = 0;
  const donutStops = allGroups
    .filter((g) => g.count > 0)
    .map((g) => {
      const from = donutOffset;
      donutOffset += (100 * g.count) / Math.max(1, sumCount);
      return `${g.color} ${from}% ${donutOffset}%`;
    });

  // Weekly cash chart — still uses raw history for credit/debit aggregation
  const weeklyCash = weeks.map((w) => {
    const wkEntries = history.filter((h) => {
      if (String((h as any)?.point_type ?? "") !== "cash_bal") return false;
      if (!h.date_created) return false;
      // Note: API dates are DD/MM/YYYY; string compare is best-effort only.
      return (
        String(h.date_created).slice(0, 19) >= w.start &&
        String(h.date_created).slice(0, 19) <= w.end
      );
    });
    return {
      ...w,
      credit: wkEntries.reduce(
        (n, h) => n + Math.max(0, Number((h as any).amount_usd) || 0),
        0,
      ),
      debit: wkEntries.reduce(
        (n, h) => n + Math.max(0, -(Number((h as any).amount_usd) || 0)),
        0,
      ),
    };
  });
  const plottedWeeks = weeklyCash.filter((w) => w.credit > 0 || w.debit > 0);
  const maxCash = Math.max(
    1,
    ...plottedWeeks.flatMap((w) => [w.credit, w.debit]),
  );
  const plot = (key: "credit" | "debit") =>
    plottedWeeks
      .map(
        (w, i) =>
          `${40 + (i * 360) / Math.max(1, plottedWeeks.length - 1)},${156 - (w[key] / maxCash) * 124}`,
      )
      .join(" ");
  const formClass =
    "h-10 w-full min-w-0 appearance-none rounded-[10px] border border-[#e2e7ef] bg-white px-3 text-[12px] font-semibold text-[#293447] outline-none focus:border-[#8697ae] focus:ring-2 focus:ring-[#9facbf]/20";
  const panel =
    "min-w-0 rounded-[16px] border border-[#e6e9ef] bg-white p-4 shadow-[0_4px_20px_rgba(24,39,75,.03)] sm:p-5";
  return (
    <section className="mt-5 min-w-0 sm:mt-6" aria-label="Tracking Center">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <SectionTitle large>Tracking Center</SectionTitle>
          <p className="ml-11 mt-1 text-[11px] text-[#8893a5]">
            TC account-wise CV, weekly settlement and transaction activity
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void accountsQuery.refetch();
          }}
          disabled={accountsQuery.isFetching}
          className="inline-flex h-9 items-center gap-2 rounded-[9px] border border-[#e3e7ed] bg-white px-3 text-[11px] font-semibold text-[#516075] hover:bg-[#f6f7f9] disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={accountsQuery.isFetching ? "animate-spin" : ""}
          />
          Refresh accounts
        </button>
      </div>
      <div className={panel}>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(130px,.5fr)_auto]">
          <label className="min-w-0">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#566174]">
              TC Account
            </span>
            <select
              className={formClass}
              value={accountId}
              disabled={!accounts.length}
              onChange={(e) => {
                setAccountId(e.target.value);
                onChange();
              }}
            >
              <option value="">
                {accountsQuery.isLoading
                  ? "Loading accounts..."
                  : "Select TC account"}
              </option>
              {accounts.map((a) => (
                <option key={a.baId} value={a.baId}>
                  {a.baId}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#566174]">
              Sales Week
            </span>
            <select
              className={formClass}
              value={weekNo}
              disabled={!weeksOfYear.length}
              onChange={(e) => {
                setWeekNo(e.target.value);
                onChange();
              }}
            >
              <option value="">Select week</option>
              {weeksOfYear.map((w) => (
                <option key={w.weekNo} value={w.weekNo}>
                  Week {w.weekNo} ({trackDate(w.start)} – {trackDate(w.end)}{" "}
                  {w.year}){w.isCurrent ? " · Current" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#566174]">
              Year
            </span>
            <select
              className={formClass}
              value={year}
              disabled={!years.length}
              onChange={(e) => {
                setYear(e.target.value);
                setWeekNo("");
                onChange();
              }}
            >
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void showCv()}
            disabled={!canSearch}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#171717] px-5 text-[12px] font-bold text-white hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#d0d5dd] lg:w-auto"
          >
            {cvRequest.isFetching ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}{" "}
            Show CV
          </button>
        </div>
        {accountsQuery.isError && (
          <p role="alert" className="mt-3 text-[11px] text-[#b42318]">
            Unable to load My Accounts. Check your session or account API.
          </p>
        )}
        {requestError && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-[#fff3f2] p-3 text-[11px] text-[#b42318]"
          >
            {requestError}
          </p>
        )}
      </div>
      <div className="mt-3 grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.85fr)]">
        <div className="min-w-0 space-y-3">
          <div className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-[15px] font-bold text-[#263449]">
                  {validResponse
                    ? String(cvPayload.ba_id ?? accountId)
                    : "CV Overview"}
                </h3>
                <p className="mt-1 text-[11px] text-[#8390a2]">
                  Live CV Counter API result for selected account and sales week
                </p>
              </div>
              {validResponse && (
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-[#f4f6fa] px-2 py-1 text-[10px] font-bold text-[#61718a]">
                    Week {trackFmt(trackObj(cvPayload.week).week_no)} ·{" "}
                    {trackFmt(trackObj(cvPayload.week).year)}
                  </span>
                  <span
                    className={`rounded-lg px-2 py-1 text-[10px] font-bold ${settled ? "bg-[#edf8f0] text-[#228657]" : "bg-[#fff7e9] text-[#9a6b25]"}`}
                  >
                    {settled ? "Settled" : "Not settled"}
                  </span>
                </div>
              )}
            </div>
            {validResponse ? (
              <>
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {currentMetrics.map((m, i) => (
                    <div
                      key={m.label}
                      className="min-w-0 rounded-xl border border-[#e9edf2] bg-[#fafbfc] p-3"
                    >
                      <p className="text-[10px] text-[#8290a2]">{m.label}</p>
                      <p
                        className={`mt-1 text-[20px] font-bold ${i === 2 || i === 3 ? "text-[#5474bb]" : "text-[#263447]"}`}
                      >
                        {trackFmt(m.value)}
                      </p>
                    </div>
                  ))}
                </div>
                {resultPresent ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[#e9edf2] p-3 sm:grid-cols-5">
                    {extraWeekMetrics.map((m) => (
                      <div key={m.label}>
                        <p className="text-[10px] text-[#8490a0]">{m.label}</p>
                        <p className="mt-1 text-[14px] font-bold text-[#283448]">
                          {trackFmt(m.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-lg border border-[#f4e8d1] bg-[#fffbf3] px-3 py-2.5 text-[11px] text-[#926b32]">
                    Weekly settlement result is not available yet. Current CV
                    and floating CV are shown above; no weekly commission has
                    been assumed.
                  </p>
                )}
              </>
            ) : (
              <div className="flex min-h-[165px] flex-col items-center justify-center gap-2 text-center">
                <BarChart3 size={23} className="text-[#a6b1c0]" />
                <p className="text-[12px] font-semibold text-[#66758b]">
                  {cvRequest.isFetching
                    ? "Loading CV..."
                    : "Choose an account and click Show CV"}
                </p>
              </div>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className={panel}>
              <h3 className="text-[14px] font-bold text-[#253449]">
                Weekly Cash Activity
              </h3>
              <p className="mt-1 text-[10px] text-[#8993a3]">
                Actual Dashboard commission-history cash credits and debits ·
                USD
              </p>
              <div className="mt-3 flex gap-4 text-[10px]">
                <span className="text-[#5275b5]">● Credits</span>
                <span className="text-[#d59b51]">● Debits</span>
              </div>
              {plottedWeeks.length ? (
                <div className="mt-3 overflow-x-auto">
                  <svg
                    viewBox="0 0 420 205"
                    className="h-auto w-full min-w-[300px]"
                    role="img"
                    aria-label="Weekly cash credits and debits chart"
                  >
                    {[32, 73, 114, 156].map((y) => (
                      <line
                        key={y}
                        x1="38"
                        x2="405"
                        y1={y}
                        y2={y}
                        stroke="#e6eaf0"
                      />
                    ))}
                    <polyline
                      points={plot("credit")}
                      fill="none"
                      stroke="#5275b5"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points={plot("debit")}
                      fill="none"
                      stroke="#d59b51"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    {plottedWeeks.map((w, i) => {
                      const x =
                        40 + (i * 360) / Math.max(1, plottedWeeks.length - 1);
                      return (
                        <g key={`${w.year}-${w.weekNo}`}>
                          <circle
                            cx={x}
                            cy={156 - (w.credit / maxCash) * 124}
                            r="3.5"
                            fill="#5275b5"
                          >
                            <title>{`Week ${w.weekNo} credits: $${trackFmt(w.credit)}`}</title>
                          </circle>
                          <circle
                            cx={x}
                            cy={156 - (w.debit / maxCash) * 124}
                            r="3.5"
                            fill="#d59b51"
                          >
                            <title>{`Week ${w.weekNo} debits: $${trackFmt(w.debit)}`}</title>
                          </circle>
                          <text
                            x={x}
                            y="177"
                            textAnchor="middle"
                            fontSize="9"
                            fill="#68788b"
                          >
                            W{w.weekNo}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                <p className="mt-8 rounded-lg border border-dashed border-[#e5e9f0] bg-[#fafbfc] px-3 py-12 text-center text-[11px] text-[#8b96a7]">
                  No weekly cash transactions found in the dashboard history.
                </p>
              )}
            </div>
            <div className={panel}>
              <h3 className="text-[14px] font-bold text-[#253449]">My Tree</h3>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#f7f9fc] p-3">
                <Network size={22} className="text-[#7185a4]" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[#8390a1]">Far Left BA</p>
                  <p className="break-all text-[12px] font-bold text-[#2c3950]">
                    {(ignite as ExtendedIgnite | undefined)?.far_left_ba_id ||
                      "—"}
                  </p>
                </div>
              </div>
              <div className="mt-2 rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[10px] text-[#8390a1]">Far Right BA</p>
                <p className="mt-1 break-all text-[12px] font-bold text-[#2c3950]">
                  {(ignite as ExtendedIgnite | undefined)?.far_right_ba_id ||
                    "—"}
                </p>
              </div>
              <p className="mt-3 text-[10px] text-[#8d98a7]">
                Direct/downline counts are not included in the supplied
                Dashboard response.
              </p>
            </div>
          </div>
        </div>
        <div className={panel}>
          <div className="flex items-center gap-2">
            <IndianRupee size={18} className="text-[#6c82a0]" />
            <h3 className="text-[14px] font-bold text-[#253449]">
              Commission History Breakdown
            </h3>
          </div>
          <p className="mt-1 text-[10px] text-[#8993a3]">
            Transaction counts by wallet category
          </p>
          <div
            className="mx-auto my-6 flex h-[180px] w-[180px] items-center justify-center rounded-full"
            role="img"
            aria-label={`${sumCount} commission history transactions`}
            style={{
              background: sumCount
                ? `conic-gradient(${donutStops.join(", ")})`
                : "#e8edf3",
            }}
          >
            <div className="flex h-[122px] w-[122px] flex-col items-center justify-center rounded-full bg-white">
              <span className="text-[29px] font-bold text-[#263449]">
                {sumCount}
              </span>
              <span className="text-[10px] text-[#8a95a5]">Transactions</span>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#e9edf2]">
            <div className="flex justify-between bg-[#f7f9fc] px-3 py-2 text-[10px] font-bold text-[#778397]">
              <span>Wallet category</span>
              <span>Entries</span>
            </div>
            {allGroups.map((g) => (
              <div
                key={g.category}
                className="flex items-center justify-between gap-3 border-t border-[#e9edf2] px-3 py-3 text-[11px]"
              >
                <span className="inline-flex items-center gap-2 text-[#576375]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: g.color }}
                  />
                  {g.label}
                </span>
                <span className="font-bold text-[#253449]">{g.count}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-[#e6eaf1] bg-[#f7f9fc] text-black px-3 py-3 text-[12px] font-bold">
              <span>Total</span>
              <span>{sumCount}</span>
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-4 text-[#919bad]">
            Transaction counts are used because cash values (USD) and coin
            quantities cannot be combined into one monetary total.
          </p>
        </div>
      </div>
      {validResponse && (
        <details className={`${panel} mt-3`}>
          <summary className="cursor-pointer text-[12px] font-bold text-[#35445a]">
            Full CV Counter API response
          </summary>
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-[#f6f7f9] p-3 text-[10px] leading-5 text-[#526074]">
            {JSON.stringify(response, null, 2)}
          </pre>
        </details>
      )}
    </section>
  );
}

// --------------------------------------------------
// Screenshot-style account summary beside the coin cards.
// --------------------------------------------------
function CoinsAndAccountStatusOverview({
  ignite,
  onRedeemSuccess,
}: {
  ignite?: IgniteDashboard | null;
  onRedeemSuccess: () => void;
}) {
  const router = useRouter();
  const accountQuery = useGetMyAccountsQuery();
  const source = trackObj(accountQuery.data);
  const payload = trackObj(source.data);
  const accountArray = [
    source.data,
    payload.accounts,
    payload.items,
    payload.records,
    source.accounts,
    source.records,
    trackObj(payload.data).accounts,
  ].find(Array.isArray);
  const seen = new Set<string>();
  const accounts = trackList(accountArray).flatMap((item) => {
    const accountId = String(item.ba_id ?? item.account_id ?? "").trim();
    if (!accountId || seen.has(accountId)) return [];
    seen.add(accountId);
    return [
      {
        accountId,
        rank: String(item.rank_name ?? item.rank ?? "—"),
        status: String(item.status ?? item.membership_status ?? "—"),
      },
    ];
  });
  const counts = { registered: 0, qualified: 0, activated: 0 };
  for (const item of accounts) {
    const status = item.status.toLowerCase().replace(/[_-]/g, " ");
    if (status.includes("activ") && !status.includes("inactiv"))
      counts.activated += 1;
    else if (status.includes("qualif")) counts.qualified += 1;
    else if (status.includes("register") || status.includes("pending"))
      counts.registered += 1;
  }
  const isWaiting = accountQuery.isLoading && !accountQuery.data;
  const prettyStatus = (value: string) =>
    value.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  const statusColor = (value: string) => {
    const s = value.toLowerCase();
    return (s.includes("activ") && !s.includes("inactiv")) ||
      s.includes("qualif")
      ? "text-[#0E9D4A]"
      : s.includes("reject") || s.includes("block") || s.includes("inactiv")
        ? "text-[#C05252]"
        : "text-[#7D8796]";
  };
  return (
    <section
      aria-label="My coins and my accounts"
      className="mt-4 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <CoinsSection ignite={ignite} onRedeemSuccess={onRedeemSuccess} />
        <div className="min-w-0 rounded-[12px] border border-[#E9EAEE] bg-white px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="text-[16px] font-medium text-[#313138]">
            My Account Status
          </h2>
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {[
              {
                label: "Registered",
                count: counts.registered,
                tone: "#F5B919",
              },
              { label: "Qualified", count: counts.qualified, tone: "#19B85D" },
              { label: "Activated", count: counts.activated, tone: "#2375EA" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex min-h-[132px] min-w-0 flex-col items-center justify-center rounded-[11px] border border-[#EAEBEF] bg-white px-1.5 py-3 text-center"
              >
                <p
                  className="text-[30px] font-medium leading-tight tabular-nums"
                  style={{ color: item.tone }}
                >
                  {isWaiting ? "—" : item.count}
                </p>
                <p className="mt-1.5 text-[12px] font-medium text-[#24252B] sm:text-[14px]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          {accountQuery.isError && (
            <p className="mt-3 text-[11px] text-[#B42318]">
              Unable to load account status.
            </p>
          )}
        </div>
      </div>
      <div className="min-w-0 rounded-[12px] border border-[#E9EAEE] bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-medium text-[#313138]">
            My Account Status
          </h2>
          <button
            type="button"
            onClick={() => router.push("/distributor/MyAccounts/")}
            className="inline-flex items-center gap-1.5 rounded-[7px] px-1 py-1 text-[13px] font-medium text-[#303340] hover:text-black hover:underline"
          >
            View All <ChevronRight size={17} strokeWidth={2} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-[minmax(0,1.45fr)_minmax(0,.75fr)_minmax(0,.85fr)] gap-3 border-b border-dashed border-[#D9DCE3] pb-4 text-[11px] font-semibold uppercase tracking-[.015em] text-[#22252C] sm:text-[13px]">
          <span>Account ID</span>
          <span>Rank</span>
          <span>Status</span>
        </div>
        {isWaiting ? (
          <div className="flex min-h-[245px] items-center justify-center gap-2 text-[12px] text-[#8490A1]">
            <Loader2 size={16} className="animate-spin" /> Loading accounts...
          </div>
        ) : accounts.length ? (
          <div>
            {accounts.slice(0, 6).map((item) => (
              <div
                key={item.accountId}
                className="grid min-h-[59px] grid-cols-[minmax(0,1.45fr)_minmax(0,.75fr)_minmax(0,.85fr)] items-center gap-3 border-b border-dashed border-[#D9DCE3] py-3 text-[11px] text-[#23262C] sm:text-[13px]"
              >
                <span className="min-w-0 break-all font-medium">
                  {item.accountId}
                </span>
                <span className="min-w-0 break-words">
                  {prettyStatus(item.rank)}
                </span>
                <span
                  className={`min-w-0 break-words font-medium ${statusColor(item.status)}`}
                >
                  {prettyStatus(item.status)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[245px] flex-col items-center justify-center gap-2 text-center text-[12px] text-[#8490A1]">
            <UsersRound size={23} className="text-[#A6AEBB]" />
            {accountQuery.isError
              ? "Unable to load accounts. Please refresh."
              : "No accounts available"}
          </div>
        )}
        {accounts.length > 6 && (
          <p className="mt-3 text-right text-[11px] text-[#8691A0]">
            Showing 6 of {accounts.length} accounts
          </p>
        )}
      </div>
    </section>
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

  const [isBankedTcModalOpen, setIsBankedTcModalOpen] = useState(false);

  const [pendingBankedTcSide, setPendingBankedTcSide] =
    useState<BankedTcSide | null>(null);

  const [placeBankedTc, { isLoading: isPlacingBankedTc }] =
    usePlaceBankedTcMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (!hasSalesCalendar) return;

    setSelectedCvYear(calendarYear);
    setSelectedCvWeek(calendarWeek);
  }, [calendarYear, calendarWeek, calendarWeekStart, hasSalesCalendar]);

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

  const periodIgniteMetrics = getPairingsMetrics(pairingsQuery.data);

  const cvCounterIgnite = periodIgniteMetrics
    ? ({
        ...(ignite ?? {}),
        ...periodIgniteMetrics,
      } as IgniteDashboard)
    : ignite;

  const handleBankedTcPlacement = async (side: BankedTcSide) => {
    if (isPlacingBankedTc) return;

    if (!ignite?.ba_id) {
      toast.error("Distributor ID is not available.");
      return;
    }

    if (toNumber(ignite.tc_bank_available) <= 0) {
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
          `Banked TC placed on ${side === 1 ? "Left" : "Right"} Side successfully.`,
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

  if (!mounted || authStatus !== "authorized" || isLoading) {
    return <DashboardLoader />;
  }

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
            <WelcomeHero user={user} distributorId={ignite?.ba_id || "N/A"} />

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

            <QuickStatsCards ignite={ignite} />

            <DashboardTrackingCenter dashboardData={dashboard} ignite={ignite} />

            <CoinsAndAccountStatusOverview
              ignite={ignite}
              onRedeemSuccess={() => {
                void refetch();
              }}
            />
            <FinancialSummary
              ignite={ignite as ExtendedIgnite | null | undefined}
            />
            <DashboardOverview stats={stats} />

            <section className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:mt-6 sm:gap-4 xl:grid-cols-2">
              <LatestOrderSection order={dashboard?.latest_order ?? null} />

              <RecentActivity activity={activity} />
            </section>

            <section className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[15px] border border-[#e6e9ef] bg-white p-4 sm:p-5">
              <div>
                <h2 className="text-[14px] font-bold text-[#263449]">
                  Sales Month Calendar
                </h2>
                <p className="mt-1 text-[11px] text-[#8994a4]">
                  View month-wise weeks, payouts and the full sales calendar on
                  its dedicated page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/distributor/sales-calendar/")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#171717] px-4 text-[12px] font-bold text-white hover:bg-[#333]"
              >
                {" "}
                <CalendarDays size={15} /> Open Sales Calendar{" "}
                <ArrowRight size={14} />
              </button>
            </section>

            <section className="mt-3 grid min-w-0 gap-3 lg:grid-cols-2">
              <AccountSummary ignite={ignite} />
              <AccountTable
                ignite={ignite}
                onOpenBankedTc={() => setIsBankedTcModalOpen(true)}
              />
            </section>

            <EarnedCoinsAndNetwork
              ignite={ignite as ExtendedIgnite | null | undefined}
            />
            <LedgerHistory
              entries={
                (ignite as ExtendedIgnite | null | undefined)
                  ?.commissions_history
              }
            />
            <ApiDetailsExplorer
              dashboard={dashboard as Record<string, any> | undefined}
            />

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
        availableCount={toNumber(ignite?.tc_bank_available)}
        isLoading={isPlacingBankedTc}
        pendingSide={pendingBankedTcSide}
        onClose={() => setIsBankedTcModalOpen(false)}
        onSelectSide={handleBankedTcPlacement}
      />
    </div>
  );
}