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
  usePlaceBankedTcMutation,
} from "@/lib/redux/api/distributor/userDashboardApi";

import { useGetPairingsQuery } from "@/lib/redux/api/distributor/pairingsApi";

import Loding from "@/components/common/Loding";

// --------------------------------------------------
// Shared design primitives
// --------------------------------------------------

const CARD =
  "min-w-0 rounded-[20px] border border-[#E6E9EF] bg-white shadow-[0_4px_20px_rgba(24,39,75,0.03)]";

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
        className={`min-w-0 font-bold leading-tight tracking-[-0.035em] text-[#181818] ${large ? "text-[19px] sm:text-[22px]" : "text-[17px] sm:text-[19px]"}`}
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
      <div className="relative grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(240px,310px)] lg:items-center lg:px-9 lg:py-8">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E1E7F0] bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-[#4564B7] sm:text-[11px]">
            <span className="h-2 w-2 rounded-full bg-[#6686B9]" /> Distributor
            workspace
          </div>
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="hidden h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px] bg-[#283B55] text-[18px] font-bold text-white shadow-[0_8px_20px_rgba(34,52,77,.12)] sm:flex">
              {initials || "D"}
            </div>
            <div className="min-w-0">
              <h1 className="break-words text-[25px] font-bold leading-tight tracking-[-.045em] text-[#233254] sm:text-[31px]">
                Welcome back, {displayName}
              </h1>
              <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#6C7794] sm:text-[13px] sm:leading-6">
                Your business at a glance. Track performance, manage your
                network and stay on top of every update.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#DCE5F6] pt-4">
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
          <p className="mt-5 text-[11px] font-semibold text-[#7B869D]">
            Distributor ID
          </p>
          <p className="dashboard-number mt-1 break-all text-[22px] font-bold tracking-[-.03em] text-[#293962] sm:text-[25px]">
            {distributorId}
          </p>
          <div className="mt-4 flex items-center gap-2 border-t border-[#E8ECF7] pt-3 text-[10px] text-[#8390AE]">
            <span className="h-2 w-2 rounded-full bg-[#55A58C]" /> IndieKonnect
            distributor portal
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
      <div className="grid grid-cols-1 gap-3 min-[540px]:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="group relative flex min-h-[150px] min-w-0 flex-col justify-between overflow-hidden rounded-[20px] border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(64,84,133,.09)] sm:p-5"
              style={{ background: item.bg, borderColor: item.border }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-[14px]"
                  style={{ backgroundColor: item.iconBg, color: item.tone }}
                >
                  <Icon size={21} strokeWidth={1.8} />
                </span>
                <ArrowUpRight
                  size={18}
                  className="opacity-45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  style={{ color: item.tone }}
                />
              </div>
              <div className="mt-5 min-w-0">
                <p className="text-[12px] font-semibold text-[#64718C]">
                  {item.label}
                </p>
                <p className="dashboard-number mt-1 break-words text-[27px] font-bold leading-tight tracking-[-.045em] text-[#24334F] sm:text-[31px]">
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
    <section className="mt-7 sm:mt-8">
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
              className="group flex min-h-[139px] min-w-0 flex-col justify-between rounded-[18px] border border-[#E8EDF5] bg-white p-3.5 shadow-[0_3px_12px_rgba(52,72,120,.03)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(52,72,120,.08)] sm:p-4"
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
                <p className="dashboard-number break-words text-[25px] font-bold leading-none tracking-[-.045em] text-[#25334F] sm:text-[29px]">
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
// Coins section
// --------------------------------------------------

function CoinsSection({ ignite }: { ignite?: IgniteDashboard | null }) {
  const coinValues = ignite as
    (IgniteDashboard & IgniteCoinValues) | null | undefined;
  return (
    <section className={`${CARD} dashboard-card p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <SectionTitle>My coins</SectionTitle>
          <p className="ml-11 mt-1 text-[11px] text-[#929292]">
            Balances and estimated value by coin type
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-[#FAFAFA] px-3 py-1 text-[10px] font-semibold text-[#666666]">
          <Coins size={13} /> Coin wallet
        </span>
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
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${isActive ? "border-[#D9EDE2] bg-[#F0FAF4] text-[#21845F]" : "border-[#EBEBEB] bg-[#F8F8F8] text-[#777777]"}`}
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
              className={`min-w-0 rounded-[14px] border p-3 sm:p-4 ${index === 0 ? "border-[#EAE5D9] bg-[#FBFAF7]" : index === 1 ? "border-[#E9ECEF] bg-[#F9FAFB]" : "border-[#E9ECEF] bg-[#F9FAFB]"}`}
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
        <div className="mt-4 flex min-h-[185px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E8E8E8] bg-[#FBFBFB] p-5 text-center">
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
        <div className="mt-4 flex min-h-[185px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E8E8E8] bg-[#FBFBFB] p-5 text-center">
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

/** The supplied backend timestamps are without an explicit timezone.
 * For the poster we display their DATE COMPONENTS as-is: this avoids
 * silently converting a payout date into a different day.
 * The raw timestamp is kept in the title attribute for precise review.
 */
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

/** Image's rank-basis rules, retained separately from the API schedule.
 * Only applied for the supplied 2026 poster. They are not returned by the API.
 */
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

/** Actual weeks from sales_calendar.all_months have priority over generated options. */
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

  // Retain legacy fall-back for years not supplied in the dashboard API.
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
    "border border-[#b1c6e2] px-1.5 py-2 text-center text-[9px] font-extrabold uppercase leading-tight sm:text-[10px]";
  const cell =
    "border border-[#b1c6e2] px-1.5 py-[9px] text-center text-[10px] leading-4 sm:text-[11px]";
  return (
    <div className="min-w-0 overflow-x-auto rounded-xl border-[3px] border-[#0a3681] bg-[#0a3681] shadow-[0_8px_18px_rgba(4,28,90,.15)]">
      <table className="w-full min-w-[575px] border-collapse bg-white">
        <thead>
          <tr className="bg-[#113a83] text-white">
            <th className={`${header} w-[11%] border-[#29549c]`}>
              Sales
              <br />
              month
            </th>
            <th className={`${header} border-[#29549c]`} colSpan={3}>
              Sales week
            </th>
            <th className={`${header} w-[21%] border-[#29549c]`}>
              Commission
              <br />
              payout
            </th>
            <th className={`${header} w-[22%] border-[#29549c]`}>Rank basis</th>
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
                        className="border-[2px] border-[#214a89] bg-[#f8d064] px-1 text-center align-middle"
                      >
                        <span className="text-[33px] font-black leading-none text-[#123d84]">
                          {month.month_no}
                        </span>
                      </td>
                    )}
                    <td className={`${cell} w-[9%] font-black text-[#123d84]`}>
                      <button
                        type="button"
                        title={`Week ${week.week_no} · ${week.is_settled ? "Settled" : "Pending"}${active ? " · Current week" : ""}`}
                        onClick={() => onSelectWeek(week.week_no!)}
                        aria-label={`Select week ${week.week_no} for CV search`}
                        aria-pressed={selected}
                        className={`mx-auto flex h-8 min-w-8 items-center justify-center rounded-md px-1 text-[15px] font-black outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#f2a91b] ${selected ? "bg-[#123d84] text-white" : active ? "bg-[#ffe6a0] text-[#123d84] hover:bg-[#fbd473]" : "text-[#123d84] hover:bg-[#dceaff]"}`}
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
                      <span className="rounded bg-[#f7d66f] px-1.5 py-1 font-extrabold text-[#143f82]">
                        {formatPosterApiDate(week.payout_date)}
                      </span>
                    </td>
                    {index === 0 && (
                      <td
                        rowSpan={weeks.length}
                        className="border-[2px] border-[#214a89] bg-[#f7f9fd] px-1.5 py-2 text-center align-middle"
                      >
                        {basis ? (
                          <div className="mx-auto max-w-[150px] text-[10px] font-extrabold uppercase leading-[1.45] text-[#153c79]">
                            {basis.title}
                            {basis.period && (
                              <div className="mt-1 text-[8px] font-semibold text-[#68778c]">
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
}: {
  calendar?: SalesCalendar;
  selectedWeek: number;
  onSelectWeek: (weekNo: number) => void;
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
      </section>
    );
  }

  return (
    <section className="relative isolate mt-5 overflow-hidden rounded-[22px] border border-[#18448c] bg-[#0f4ca7] p-3 shadow-[0_16px_35px_rgba(8,51,126,.12)] sm:p-5 lg:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-conic-gradient(from 0deg at 50% 27%, rgba(255,255,255,.12) 0deg, rgba(255,255,255,.12) 7deg, transparent 7deg, transparent 17deg)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border-[20px] border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-20 h-36 w-36 rounded-full bg-[#c7e1ff]/10 blur-2xl"
      />

      <div className="relative mb-5 flex flex-wrap items-start justify-between gap-3 sm:mb-6">
        <div className="inline-flex items-center gap-2 rounded-xl border border-[#f4df92] bg-[#ffdf74] px-3 py-2 shadow-sm">
          <span className="text-[12px] font-black leading-[1.05] tracking-tight text-[#164286]">
            INDIE
            <br />
            KONNECT
          </span>
        </div>
        {activeWeek && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#ffd46a]" />
            Current week {activeWeek.week_no}
          </span>
        )}
      </div>

      <div className="relative mb-6 text-center sm:mb-7">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <h2 className="text-[26px] font-black uppercase leading-[1.06] tracking-[-.035em] text-[#ffcd4d] [text-shadow:0_2px_0_#0b347c] sm:text-[38px] lg:text-[48px]">
            Sales Month Calendar
          </h2>
          <span className="rounded-[12px] border-2 border-white/80 bg-[#ffd25d] px-3 py-1 text-[18px] font-black text-[#153d80] shadow-sm sm:text-[24px]">
            {year}
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-white/80 sm:text-[12px]">
          Click a week number to select it for CV performance search
        </p>
      </div>

      <div className="relative grid min-w-0 grid-cols-1 items-start gap-4 2xl:grid-cols-2">
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

      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/20 bg-[#0c397f]/65 px-4 py-3 text-[10px] leading-4 text-white/90 sm:text-[11px]">
        <span>
          Week dates and payout dates: dashboard API • Rank basis: supplied 2026
          reference poster
        </span>
        <span className="font-bold text-[#ffe291]">www.indiekonnect.com</span>
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
    <div className={`${CARD} dashboard-card mt-4 p-4 sm:p-5 lg:p-6`}>
      <div className="mb-4 flex min-w-0 flex-col gap-3 border-b border-[#f0f2f5] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#ECECEC] bg-[#F7F7F7] text-[#313131]">
            <CalendarDays size={18} />
          </span>

          <div className="min-w-0">
            <h3 className="text-[13px] font-black text-[#101828] sm:text-[14px]">
              Sales calendar
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

      <div className="grid min-w-0 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(150px,0.8fr)_minmax(260px,1.8fr)_auto] sm:gap-4">
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
    SalesCalendar | undefined;

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
          `Banked TC placed on ${
            side === 1 ? "Left" : "Right"
          } Side successfully.`,
      );

      setIsBankedTcModalOpen(false);

      // Refresh dashboard to get updated Banked TC count
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

        <main className="thin-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#F8F9FB] px-3 pb-9 pt-4 sm:px-5 sm:pb-12 sm:pt-5 lg:px-7 lg:pt-7 xl:px-8">
          <div className="mx-auto w-full min-w-0 max-w-[1500px]">
            {/* Welcome hero */}

            <WelcomeHero user={user} distributorId={ignite?.ba_id || "N/A"} />

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
                  className="shrink-0 rounded-[9px] bg-[#171717] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#333333]"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Cash wallet, floating retail profit and direct referral */}

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

            {/* Account assets and shopping overview */}
            <section className="mt-4 sm:mt-5">
              <CoinsSection ignite={ignite} />
            </section>
            <DashboardOverview stats={stats} />

            {/* Latest order and recent activity */}

            <section className="mt-7 grid min-w-0 grid-cols-1 gap-4 sm:mt-8 sm:gap-5 xl:grid-cols-2">
              <LatestOrderSection order={dashboard?.latest_order ?? null} />

              <RecentActivity activity={activity} />
            </section>

            {/* CV counter */}

            <section className="mt-8 min-w-0 sm:mt-9">
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

              {/* Poster-style calendar. Week dates and payouts come from sales_calendar.all_months. */}
              <SalesCalendarPoster
                calendar={salesCalendar}
                selectedWeek={
                  selectedCvYear === calendarYear ? selectedCvWeek : -1
                }
                onSelectWeek={(weekNo) => {
                  setSelectedCvYear(calendarYear);
                  setSelectedCvWeek(weekNo);
                }}
              />

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

              <div className="mt-4 grid min-w-0 grid-cols-1 items-stretch gap-4 sm:mt-5 sm:gap-5 xl:grid-cols-2">
                <AccountSummary ignite={cvCounterIgnite} />

                <AccountTable
                  ignite={cvCounterIgnite}
                  onOpenBankedTc={() => setIsBankedTcModalOpen(true)}
                />
              </div>
            </section>

            {/* Refresh indicator */}

            {isFetching && !isLoading && (
              <div className="mt-4 flex items-center justify-end gap-2 text-[11px] font-semibold text-[#777777]">
                <Loader2 size={13} className="animate-spin" />

                <span>Updating dashboard...</span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* -------------------------------------------------- */}
      {/* BANKED TC PLACEMENT MODAL */}
      {/* -------------------------------------------------- */}

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
