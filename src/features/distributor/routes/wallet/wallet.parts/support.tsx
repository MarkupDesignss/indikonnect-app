"use client";

import { Coins } from "lucide-react";


export const WALLET_ENDPOINT =
  "https://www.markupdesigns.net/indikonnect/api/distributor/wallet";


export type Amount = number | string | null | undefined;

export type CoinType = "yellow_bal" | "blue_bal";

export type DateFilter = "all" | "week" | "month" | "year";

export type WalletTab = "transactions" | "withdrawals" | "matchingBonus";


export interface WalletBalances {
  cash_bal_usd?: Amount;
  cash_bal_display_currency?: string;
  cash_bal_inr: Amount;
  retail_profit_usd?: Amount;
  retail_profit_inr: Amount;
  green_bal: Amount;
  yellow_bal: Amount;
  blue_bal: Amount;
  exchange_rate: Amount;
}


export interface WalletTransaction {
  id: number | string;
  date: string;
  category: string;
  description: string;
  wallet_change_inr: Amount;
  net_payable_inr?: Amount;
  wallet_change_usd?: Amount;
  point_type?: string;
  direction?: string;
  green_value_inr?: Amount;
  yellow_value_inr?: Amount;
  blue_value_inr?: Amount;
  green_coin: Amount;
  yellow_coin: Amount;
  blue_coin: Amount;
  order_id: string | number | null;
  related_member: string | number | null;
}


export interface WalletWithdrawal {
  id: number | string;
  date: string;
  amount_inr: Amount;
  net_payable_inr?: Amount;
  amount_usd?: Amount;
  currency?: string;
  status: string;
  remark: string;
}


/**
 * Matching bonus response is typed for the API's future use.
 * It is intentionally not rendered in the Matching Bonus tab yet.
 */
export interface MatchingBonusPayload {
  total_usd?: Amount;
  total_inr?: Amount;
  count?: number;
  rows?: unknown[];
}


export interface WalletPayload {
  balances: WalletBalances;
  transactions: WalletTransaction[];
  withdrawals: WalletWithdrawal[];
  has_more_transactions: boolean;
  matching_bonus?: MatchingBonusPayload;
}


export interface WalletApiResponse {
  success: boolean;
  message?: string;
  data?: WalletPayload;
  currency?: {
    base?: string;
    display?: string;
    exchange_rate?: Amount;
  };
  tds?: {
    gst_in?: string;
    pan_verified?: boolean;
    section?: string;
    applied_rate?: Amount;
    reason?: string;
  };
}


export const PANEL =
  "min-w-0 overflow-hidden rounded-[22px] border border-[#E5EAF1] bg-white shadow-[0_12px_38px_-24px_rgba(15,34,68,0.22)]";


export const BLACK_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0E1B3D] px-5 py-2.5 text-[12px] font-bold text-white shadow-[0_7px_18px_-9px_rgba(14,27,61,0.8)] transition-all hover:bg-[#1E3564] hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-[#CBD0D7] disabled:text-white disabled:shadow-none";


export const PAGE_SIZES = [10, 20, 50];


export const DATE_FILTER_OPTIONS: { label: string; value: DateFilter }[] = [
  { label: "All", value: "all" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];


export const fmt = (n: Amount, maximumFractionDigits = 2) =>
  n === null || n === undefined || n === "" || !Number.isFinite(Number(n))
    ? "—"
    : Number(n).toLocaleString("en-IN", { maximumFractionDigits });


export const numberOf = (n: Amount) => {
  const value = Number(n ?? 0);
  return Number.isFinite(value) ? value : 0;
};


export const signed = (n: Amount, prefix = "") => {
  if (n == null || !Number.isFinite(Number(n))) return "—";

  const value = Number(n);
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${prefix}${fmt(
    Math.abs(value),
  )}`;
};


export const friendly = (s: string) =>
  String(s || "—")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());


/**
 * Parses API date values as local dates.
 * Supports:
 * 2026-11-14
 * 2026-11-14 10:00:05
 * 2026-11-14 10:00:05.427
 */
export const parseWalletDate = (value: string): Date | null => {
  if (!value) return null;

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?/,
  );

  if (!match) return null;

  const [, year, month, day, hours, minutes, seconds, milliseconds] = match;

  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours || 0),
    Number(minutes || 0),
    Number(seconds || 0),
    Number((milliseconds || "").slice(0, 3).padEnd(3, "0") || 0),
  );

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};


export const dateFmt = (date: string) => {
  if (!date) return "—";

  const parsed = parseWalletDate(date);
  if (!parsed) return date;

  const datePart = parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const hasTime = /[ T]\d{2}:\d{2}/.test(date);
  if (!hasTime) return datePart;

  const timePart = parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${datePart} · ${timePart}`;
};


/**
 * Date filter logic:
 * All   -> No date restriction
 * Week  -> Current Monday to Sunday
 * Month -> Current calendar month
 * Year  -> Current calendar year
 */
export const isWithinDateFilter = (
  date: string,
  filter: DateFilter,
  now = new Date(),
): boolean => {
  if (filter === "all") return true;

  const transactionDate = parseWalletDate(date);
  if (!transactionDate) return false;

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  if (filter === "week") {
    // Monday is the first day of the week.
    const day = start.getDay();
    const daysFromMonday = (day + 6) % 7;

    start.setDate(start.getDate() - daysFromMonday);

    end.setTime(start.getTime());
    end.setDate(end.getDate() + 7);
  }

  if (filter === "month") {
    start.setDate(1);

    end.setFullYear(start.getFullYear(), start.getMonth() + 1, 1);
    end.setHours(0, 0, 0, 0);
  }

  if (filter === "year") {
    start.setMonth(0, 1);

    end.setFullYear(start.getFullYear() + 1, 0, 1);
    end.setHours(0, 0, 0, 0);
  }

  return transactionDate >= start && transactionDate < end;
};


export const getErrorMessage = (e: unknown) => {
  if (e instanceof Error) return e.message;

  if (e && typeof e === "object") {
    const obj = e as {
      data?: { message?: string };
      message?: string;
      error?: string;
    };

    return obj.data?.message || obj.message || obj.error || "Request failed";
  }

  return "Unable to complete request";
};


/**
 * Withdrawal and payout transactions reduce the wallet balance.
 */
export const getWalletTransactionAmount = (t: WalletTransaction): number => {
  const amount = Math.abs(numberOf(t.wallet_change_inr));
  const category = `${t.category ?? ""} ${t.description ?? ""}`.toLowerCase();

  if (category.includes("withdrawal") || category.includes("payout")) {
    return -amount;
  }

  return numberOf(t.wallet_change_inr);
};


/**
 * Net Payable follows the same sign logic as Wallet Change.
 */
export const getNetPayableTransactionAmount = (t: WalletTransaction): number => {
  const amount = Math.abs(numberOf(t.net_payable_inr));
  const category = `${t.category ?? ""} ${t.description ?? ""}`.toLowerCase();

  if (category.includes("withdrawal") || category.includes("payout")) {
    return -amount;
  }

  return numberOf(t.net_payable_inr);
};


/**
 * RedeemCoin entries represent coin deductions.
 */
export const getCoinTransactionAmount = (
  value: Amount,
  t: WalletTransaction,
): number => {
  const amount = Math.abs(numberOf(value));
  const category = `${t.category ?? ""} ${t.description ?? ""}`.toLowerCase();

  if (
    category.includes("redeemcoin") ||
    category.includes("redeem coin") ||
    category.includes("coin redeem")
  ) {
    return -amount;
  }

  return numberOf(value);
};


export const amountColor = (value: number) =>
  value < 0
    ? "text-[#DC4545]"
    : value > 0
      ? "text-[#15945F]"
      : "text-[#475467]";


export function CoinTile({
  color,
  label,
  balance,
}: {
  color: string;
  label: string;
  balance: Amount;
}) {
  return (
    <div className="group flex min-w-0 flex-col items-center justify-center rounded-[17px] border border-[#E4EAF2] bg-[#FBFCFF] px-2 py-5 text-center transition-colors hover:border-[#BECBE0] hover:bg-white sm:px-4 sm:py-6">
      <div
        className="relative flex h-[29px] w-[29px] items-center justify-center"
        style={{ color }}
      >
        <Coins size={29} strokeWidth={1.8} />
      </div>

      <p className="mt-3 text-[clamp(20px,3vw,30px)] font-extrabold leading-none tabular-nums text-[#102348]">
        {fmt(balance)}
      </p>

      <p className="mt-2 text-[11px] font-semibold text-[#52647C] sm:text-[12px]">
        {label}
      </p>
    </div>
  );
}
