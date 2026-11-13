"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  HandCoins,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
  Wallet,
  X,
  ReceiptText,
  CircleDollarSign,
  History,
  ShieldCheck,
} from "lucide-react";

import { toast } from "react-hot-toast";

import Sidebar from "@/components/Distributor/distributor/Sidebar";

import {
  useGetUserDashboardQuery,
  useRedeemCoinsMutation,
} from "@/lib/redux/api/distributor/userDashboardApi";
// Live GET https://www.markupdesigns.net/indikonnect/api/distributor/wallet// Auth token is read from the same localStorage keys used by your Dashboard.// If the backend uses cookie-only sessions, configure CORS credentials on the server.
const WALLET_ENDPOINT =
  "https://www.markupdesigns.net/indikonnect/api/distributor/wallet";

type Amount = number | string | null | undefined;

type CoinType = "yellow_bal" | "blue_bal";

interface WalletBalances {
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

interface WalletTransaction {
  id: number | string;

  date: string;

  category: string;

  description: string;

  wallet_change_inr: Amount;

  wallet_change_usd?: Amount;

  point_type?: string;

  green_value_inr?: Amount;

  yellow_value_inr?: Amount;

  blue_value_inr?: Amount;

  green_coin: Amount;

  yellow_coin: Amount;

  blue_coin: Amount;

  order_id: string | number | null;

  related_member: string | number | null;
}

interface WalletWithdrawal {
  id: number | string;

  date: string;

  amount_inr: Amount;

  amount_usd?: Amount;

  currency?: string;

  status: string;

  remark: string;
}

interface WalletPayload {
  balances: WalletBalances;

  transactions: WalletTransaction[];

  withdrawals: WalletWithdrawal[];

  has_more_transactions: boolean;
}

interface WalletApiResponse {
  success: boolean;

  message?: string;

  data?: WalletPayload;

  currency?: { base?: string; display?: string; exchange_rate?: Amount };
}

const PANEL =
  "min-w-0 overflow-hidden rounded-[22px] border border-[#E5EAF1] bg-white shadow-[0_12px_38px_-24px_rgba(15,34,68,0.22)]";

const BLACK_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0E1B3D] px-5 py-2.5 text-[12px] font-bold text-white shadow-[0_7px_18px_-9px_rgba(14,27,61,0.8)] transition-all hover:bg-[#1E3564] hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-[#CBD0D7] disabled:text-white disabled:shadow-none";

const fmt = (n: Amount, maximumFractionDigits = 2) =>
  n === null || n === undefined || n === "" || !Number.isFinite(Number(n))
    ? "—"
    : Number(n).toLocaleString("en-IN", { maximumFractionDigits });

const numberOf = (n: Amount) => {
  const value = Number(n ?? 0);

  return Number.isFinite(value) ? value : 0;
};

const signed = (n: Amount, prefix = "") => {
  if (n == null || !Number.isFinite(Number(n))) return "—";

  const value = Number(n);

  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${prefix}${fmt(Math.abs(value))}`;
};

const friendly = (s: string) =>
  String(s || "—")
    .replace(/[_-]+/g, " ")

    .replace(/\b\w/g, (ch) => ch.toUpperCase());

const dateFmt = (date: string) => {
  if (!date) return "—";
  // Backend returns timezone-less SQL dates: avoid parsing as UTC / shifting dates.
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);

  return m
    ? `${m[3]}/${m[2]}/${m[1]}${m[4] ? ` · ${m[4]}:${m[5]}` : ""}`
    : date;
};

const getErrorMessage = (e: unknown) => {
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

function StatCard({
  title,

  value,

  icon: Icon,

  tone,

  bg,

  note,
}: {
  title: string;

  value: string;

  icon: typeof Wallet;

  tone: string;

  bg: string;

  note?: string;
}) {
  return (
    <div
      className={`${PANEL} group relative flex min-h-[140px] flex-col items-start justify-between gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-22px_rgba(15,34,68,0.35)] sm:p-6`}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]"

        style={{ background: bg, color: tone }}
      >
        <Icon size={20} strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-[#65758B] sm:text-[13px]">
          {title}
        </p>

        <p className="mt-2 break-all text-[clamp(22px,2.4vw,30px)] font-extrabold leading-tight tracking-[-.04em] text-[#0E1B3D] tabular-nums">
          {value}
        </p>

        {note && <p className="mt-1 text-[10px] text-[#929CAC]">{note}</p>}
      </div>
    </div>
  );
}

function CoinTile({
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

function RedeemModal({
  balances,

  busy,

  onClose,

  onConfirm,
}: {
  balances: WalletBalances;

  busy: boolean;

  onClose: () => void;

  onConfirm: (type: CoinType, amount: number) => Promise<void>;
}) {
  const [type, setType] = useState<CoinType>("yellow_bal");

  const [quantity, setQuantity] = useState("");

  const max = numberOf(balances[type]);

  const amount = Number(quantity);

  const valid =
    quantity.trim() !== "" &&
    Number.isSafeInteger(amount) &&
    amount > 0 &&
    amount <= max;

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };

    document.addEventListener("keydown", listener);

    const original = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", listener);

      document.body.style.overflow = original;
    };
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#091631]/70 p-3 backdrop-blur-[5px]"

      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"

        aria-modal="true"

        aria-labelledby="wallet-redeem-title"

        className="my-auto max-h-[calc(100dvh-24px)] w-full max-w-[500px] overflow-y-auto rounded-[24px] border border-white/80 bg-white shadow-[0_30px_100px_-24px_rgba(0,0,0,.45)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#EDF0F3] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#FFF6E5] text-[#BD8D28]">
              <HandCoins size={20} />
            </div>

            <div>
              <h2
                id="wallet-redeem-title"

                className="text-[16px] font-bold text-[#202630]"
              >
                Redeem Coins
              </h2>

              <p className="mt-0.5 text-[11px] text-[#8590A0]">
                Redeem eligible Yellow or Blue coins securely
              </p>
            </div>
          </div>

          <button
            type="button"

            disabled={busy}

            onClick={onClose}

            aria-label="Close"

            className="rounded-lg p-2 text-[#6D7889] hover:bg-[#F3F5F8] disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (valid && !busy) void onConfirm(type, amount);
          }}

          className="space-y-4 p-5"
        >
          <div>
            <p className="mb-2 text-[11px] font-bold text-[#4E596A]">
              Select coin type
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(["yellow_bal", "blue_bal"] as const).map((item) => (
                <button
                  type="button"

                  key={item}

                  disabled={busy}

                  onClick={() => {
                    setType(item);

                    setQuantity("");
                  }}

                  className={`flex items-center justify-between rounded-[11px] border p-3 text-left transition ${type === item ? "border-[#323B4B] bg-[#F6F7F9]" : "border-[#E4E8EF] bg-white hover:border-[#ABB4C2]"}`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#303948]">
                      <Coins
                        size={15}

                        className={
                          item === "yellow_bal"
                            ? "text-[#E4AC19]"
                            : "text-[#2673E7]"
                        }
                      />

                      {item === "yellow_bal" ? "Yellow" : "Blue"}
                    </div>

                    <p className="mt-1 text-[10px] text-[#788396]">
                      {fmt(balances[item])} available
                    </p>
                  </div>

                  <span
                    className={`flex h-[17px] w-[17px] items-center justify-center rounded-full border ${type === item ? "border-black bg-black text-white" : "border-[#C6CCD6]"}`}
                  >
                    {type === item && <Check size={11} />}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label
                htmlFor="redeem-quantity"

                className="text-[11px] font-bold text-[#4E596A]"
              >
                Coins to redeem
              </label>

              <span className="text-[10px] text-[#818B9A]">
                Available: {fmt(max)}
              </span>
            </div>

            <input
              id="redeem-quantity"

              type="text"

              inputMode="numeric"

              autoComplete="off"

              value={quantity}

              onChange={(e) =>
                setQuantity(e.target.value.replace(/\D/g, "").slice(0, 12))
              }

              disabled={busy || max <= 0}

              placeholder="Enter coin quantity"

              className="h-12 w-full rounded-[12px] border border-[#C9D6E6] bg-[#FBFCFF] px-4 text-[15px] font-bold text-[#182D50] outline-none focus:border-[#6185BE] focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
            />

            {quantity && !valid && (
              <p className="mt-1.5 text-[11px] text-[#BD5353]">
                Enter a positive whole number not exceeding your balance.
              </p>
            )}
          </div>

          <p className="rounded-[10px] border border-[#E9EDF2] bg-[#FAFBFC] p-3 text-[11px] leading-5 text-[#758092]">
            Only Yellow and Blue coins are supported by the existing redemption
            API. Green coins remain visible in your wallet.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"

              disabled={busy}

              onClick={onClose}

              className="h-10 flex-1 rounded-[10px] border border-[#DFE4EA] bg-white text-[12px] font-bold text-[#4B5667] hover:bg-[#F7F8FA]"
            >
              Cancel
            </button>

            <button
              type="submit"

              disabled={!valid || busy}

              className={`${BLACK_BUTTON} h-10 flex-1`}
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <HandCoins size={15} />
              )}{" "}
              {busy ? "Redeeming..." : "Redeem Coins"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const PAGE_SIZES = [10, 20, 50];

export default function WalletPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [authorized, setAuthorized] = useState(false);

  const [wallet, setWallet] = useState<WalletPayload | null>(null);

  const [loading, setLoading] = useState(true);

  const [fetching, setFetching] = useState(false);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const [redeemOpen, setRedeemOpen] = useState(false);

  const [tab, setTab] = useState<"transactions" | "withdrawals">(
    "transactions",
  );

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const requestId = useRef(0);

  const dashboard = useGetUserDashboardQuery(undefined, { skip: !authorized });

  const [redeemCoins, { isLoading: redeeming }] = useRedeemCoinsMutation();

  useEffect(() => {
    setMounted(true);

    const distributorToken = localStorage.getItem("distributor_token");

    const authToken = localStorage.getItem("auth_token");

    const userType = (localStorage.getItem("user_type") || "")

      .trim()

      .toLowerCase();

    const loggedIn = localStorage.getItem("is_logged_in");

    const ok =
      !!distributorToken ||
      (!!authToken && userType === "distributor") ||
      (userType === "distributor" && loggedIn === "true");

    if (!ok) {
      router.replace("/auth/distributor/login/");

      return;
    }

    setAuthorized(true);
  }, [router]);

  const fetchWallet = useCallback(async (silent = false) => {
    const id = ++requestId.current;

    if (!silent) setLoading(true);

    setFetching(true);

    setFetchError(null);

    const token =
      localStorage.getItem("distributor_token") ||
      localStorage.getItem("auth_token");

    try {
      const res = await fetch(WALLET_ENDPOINT, {
        method: "GET",

        headers: {
          Accept: "application/json",

          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },

        cache: "no-store",
        // API is on another origin on localhost. Bearer token works when CORS allows it.
        credentials: "same-origin",
      });

      const payload = (await res.json()) as WalletApiResponse;

      if (!res.ok || payload.success === false || !payload.data) {
        throw new Error(
          payload.message || `Wallet request failed (${res.status})`,
        );
      }

      if (id === requestId.current) setWallet(payload.data);
    } catch (e) {
      if (id === requestId.current) setFetchError(getErrorMessage(e));
    } finally {
      if (id === requestId.current) {
        setLoading(false);

        setFetching(false);
      }
    }
  }, []);

  useEffect(() => {
    if (authorized) void fetchWallet();
  }, [authorized, fetchWallet]);

  const balances = wallet?.balances;

  const earnings = useMemo(
    () =>
      [
        {
          title: "Available Balance (INR)",

          value: balances ? `₹${fmt(balances.cash_bal_inr)}` : "—",

          icon: Wallet,

          tone: "#269A70",

          bg: "#EAF8F1",

          note: balances ? "Available wallet funds" : undefined,
        },

        {
          title: "Retail Profit (INR)",

          value: balances ? `₹${fmt(balances.retail_profit_inr)}` : "—",

          icon: TrendingUp,

          tone: "#B58745",

          bg: "#FBF3E8",

          note: "Retail earnings",
        },

        {
          title: "Cash Wallet (INR)",

          value: balances ? `₹${fmt(balances.cash_bal_inr)}` : "—",

          icon: CircleDollarSign,

          tone: "#5476B2",

          bg: "#EEF3FD",

          note: balances ? "Displayed in INR" : undefined,
        },
      ] as const,

    [balances],
  );
  // Withdrawal/WD records remain in Payouts and are hidden from Transactions.
  const nonWithdrawalTransactions = useMemo(
    () =>
      (wallet?.transactions ?? []).filter(
        (item) =>
          !/^(withdrawal|withdraw|wd)$/i.test(
            String(item.category ?? "").trim(),
          ),
      ),

    [wallet?.transactions],
  );

  const visibleTransactions = useMemo(() => {
    const needle = search.toLowerCase().trim();

    return nonWithdrawalTransactions.filter(
      (item) =>
        !needle ||
        [
          item.date,

          item.category,

          item.id,

          item.order_id,

          item.related_member,

          item.wallet_change_inr,

          item.yellow_coin,

          item.green_coin,

          item.blue_coin,
        ].some((v) =>
          String(v ?? "")
            .toLowerCase()

            .includes(needle),
        ),
    );
  }, [nonWithdrawalTransactions, search]);

  const visibleWithdrawals = useMemo(() => {
    const needle = search.toLowerCase().trim();

    return (wallet?.withdrawals ?? []).filter(
      (item) =>
        !needle ||
        [item.id, item.date, item.amount_inr, item.status, item.remark].some(
          (v) =>
            String(v ?? "")
              .toLowerCase()

              .includes(needle),
        ),
    );
  }, [wallet, search]);

  const rows =
    tab === "transactions" ? visibleTransactions : visibleWithdrawals;

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const displayRows = rows.slice(
    (currentPage - 1) * pageSize,

    currentPage * pageSize,
  );

  const startRow = rows.length ? (currentPage - 1) * pageSize + 1 : 0;

  const endRow = Math.min(currentPage * pageSize, rows.length);

  const handleRedeem = async (type: CoinType, amount: number) => {
    if (
      !balances ||
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      amount > numberOf(balances[type])
    ) {
      toast.error("Insufficient coins or invalid quantity.");

      return;
    }

    try {
      const response = await redeemCoins({
        coins_to_redeem: amount,

        point_type: type,
      }).unwrap();

      if (response.success === false || response.status === false)
        throw new Error(response.message || "Redemption failed");

      toast.success(response.message || "Coins redeemed successfully");

      setRedeemOpen(false);

      await Promise.all([fetchWallet(true), dashboard.refetch()]);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (!mounted || !authorized) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F8F9FB]">
        <Loader2 className="animate-spin text-[#6B7789]" size={28} />
      </div>
    );
  }
  // One vertical scrollbar: let the document scroll. Sidebar manages its own navigation scroll.// Avoid h-dvh + overflow-hidden + nested overflow-y-auto, which creates two page scrollbars.
  return (
    <div
      className="flex min-h-dvh w-full flex-col overflow-x-clip bg-white"

      style={{ fontFamily: "'Lato', Arial, sans-serif" }}
    >
      <div className="relative flex min-w-0 flex-1 items-stretch">
        <main className="min-w-0 flex-1 bg-[#F4F7FB] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1300px] min-w-0 space-y-5 pb-8 sm:space-y-6">
            <header className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0C1735] via-[#173464] to-[#285499] p-5 text-white shadow-[0_20px_48px_-26px_rgba(16,44,98,0.62)] sm:flex-row sm:items-center sm:justify-between sm:p-7 lg:p-8">
              <div
                aria-hidden="true"

                className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[42px] border-white/[0.05]"
              />

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-100/80">
                  Distributor / Wallet
                </p>

                <h1 className="mt-2 text-[27px] font-extrabold tracking-[-.04em] text-white sm:text-[34px]">
                  My Wallet
                </h1>

                <p className="mt-2 max-w-lg text-[12px] leading-5 text-blue-100/85 sm:text-[13px]">
                  Track balances, coin activity and withdrawal records.
                </p>
              </div>

              <button
                type="button"

                disabled={fetching}

                onClick={() => void fetchWallet(true)}

                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-[12px] border border-white/25 bg-white/15 px-4 text-[12px] font-bold text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20 disabled:opacity-60 sm:self-auto"
              >
                <RefreshCw
                  size={14}

                  className={fetching ? "animate-spin" : ""}
                />{" "}
                Refresh
              </button>
            </header>

            {fetchError && (
              <div
                role="alert"

                className="flex flex-wrap items-center justify-between gap-3 rounded-[11px] border border-[#F3D7D5] bg-[#FFF6F6] p-3 text-[12px] text-[#B44444]"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle size={16} />

                  {fetchError}
                </span>

                <button
                  type="button"

                  onClick={() => void fetchWallet()}

                  className="font-bold underline"
                >
                  Try again
                </button>
              </div>
            )}

            <section className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-3 sm:gap-4">
              {earnings.map((item) => (
                <StatCard
                  key={item.title}

                  {...item}

                  value={loading ? "—" : item.value}
                />
              ))}
            </section>

            <section className={`${PANEL} p-4 sm:p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F0F3F8] text-[#63768F]">
                    <Coins size={17} />
                  </div>

                  <div>
                    <h2 className="text-[17px] font-extrabold tracking-tight text-[#132747]">
                      My Coins
                    </h2>

                    <p className="mt-0.5 text-[12px] leading-5 text-[#77869A]">
                      Current redeemable and settlement coin balances
                    </p>
                  </div>
                </div>

                <button
                  type="button"

                  onClick={() => setRedeemOpen(true)}

                  disabled={!balances}

                  className={BLACK_BUTTON}
                >
                  <HandCoins size={15} /> Redeem Coin <ArrowRight size={13} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
                <CoinTile
                  label="Yellow Coin"

                  balance={balances?.yellow_bal}

                  color="#F4B51E"
                />

                <CoinTile
                  label="Green Coin"

                  balance={balances?.green_bal}

                  color="#16B65E"
                />

                <CoinTile
                  label="Blue Coin"

                  balance={balances?.blue_bal}

                  color="#2377E8"
                />
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-[10px] leading-4 text-[#8993A3]">
                <ShieldCheck size={13} /> Only Yellow and Blue coins can be
                redeemed
              </p>
            </section>

            <section className={`${PANEL} overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBEEF3] px-4 py-5 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F0F3F8] text-[#627890]">
                    <ReceiptText size={17} />
                  </div>

                  <div>
                    <h2 className="text-[17px] font-extrabold tracking-tight text-[#132747]">
                      Wallet Activity
                    </h2>

                    <p className="mt-0.5 text-[12px] leading-5 text-[#77869A]">
                      Transaction and withdrawal history
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-[#E6EAF0] bg-[#F8F9FB] px-2.5 py-1 text-[10px] font-bold text-[#7C8797]">
                  {tab === "transactions"
                    ? nonWithdrawalTransactions.length
                    : (wallet?.withdrawals.length ?? 0)}{" "}
                  records
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 px-4 pt-5 sm:px-6">
                <div
                  role="tablist"

                  aria-label="Wallet history"

                  className="flex gap-1 rounded-[12px] bg-[#F1F5FA] p-1"
                >
                  <button
                    type="button"

                    role="tab"

                    aria-selected={tab === "transactions"}

                    onClick={() => {
                      setTab("transactions");

                      setSearch("");

                      setPage(1);
                    }}

                    className={`rounded-[9px] px-4 py-2.5 text-[12px] font-bold transition-colors ${tab === "transactions" ? "bg-white text-[#0E1B3D] shadow-sm" : "text-[#6C7D96] hover:text-[#0E1B3D]"}`}
                  >
                    Transactions
                  </button>

                  <button
                    type="button"

                    role="tab"

                    aria-selected={tab === "withdrawals"}

                    onClick={() => {
                      setTab("withdrawals");

                      setSearch("");

                      setPage(1);
                    }}

                    className={`rounded-[9px] px-4 py-2.5 text-[12px] font-bold transition-colors ${tab === "withdrawals" ? "bg-white text-[#0E1B3D] shadow-sm" : "text-[#6C7D96] hover:text-[#0E1B3D]"}`}
                  >
                    Payouts
                  </button>
                </div>

                <div className="relative w-full sm:max-w-[340px]">
                  <Search
                    size={15}

                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A3B2]"
                  />

                  <input
                    type="search"

                    aria-label="Search wallet activity"

                    value={search}

                    onChange={(e) => {
                      setSearch(e.target.value);

                      setPage(1);
                    }}

                    placeholder={`Search ${tab}...`}

                    className="h-11 w-full rounded-[12px] border border-[#DCE4EE] bg-[#F9FBFF] pl-10 pr-4 text-[13px] font-medium text-[#193052] outline-none placeholder:text-[#9BA9BA] focus:border-[#5B7FBB] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="px-4 pt-4 sm:px-6">
                {!loading && displayRows.length > 0 && (
                  <div className="grid gap-3 lg:hidden">
                    {tab === "transactions"
                      ? (displayRows as WalletTransaction[]).map((t) => (
                          <article
                            key={t.id}

                            className="rounded-[16px] border border-[#E4EAF2] bg-[#FCFDFF] p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-[#76869B]">
                                  {dateFmt(t.date)}
                                </p>

                                <span className="mt-2 inline-flex rounded-full bg-[#EDF2F9] px-2.5 py-1 text-[10px] font-semibold text-[#527099]">
                                  {friendly(t.category)}
                                </span>
                              </div>

                              <p
                                className={`shrink-0 text-[16px] font-extrabold tabular-nums ${numberOf(t.wallet_change_inr) > 0 ? "text-[#15835A]" : numberOf(t.wallet_change_inr) < 0 ? "text-[#BE5656]" : "text-[#344054]"}`}
                              >
                                {signed(t.wallet_change_inr, "₹")}
                              </p>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 rounded-[11px] bg-white p-3 text-center ring-1 ring-[#EDF1F5]">
                              {(
                                [
                                  ["Green", t.green_coin],

                                  ["Yellow", t.yellow_coin],

                                  ["Blue", t.blue_coin],
                                ] as [string, Amount][]
                              ).map(([label, value]) => (
                                <div key={label}>
                                  <p className="text-[10px] font-medium text-[#77869A]">
                                    {label}
                                  </p>

                                  <p
                                    className={`mt-1 text-[12px] font-bold tabular-nums ${numberOf(value) > 0 ? "text-[#178858]" : "text-[#344054]"}`}
                                  >
                                    {signed(value)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </article>
                        ))
                      : (displayRows as WalletWithdrawal[]).map((w) => (
                          <article
                            key={w.id}

                            className="rounded-[16px] border border-[#E4EAF2] bg-[#FCFDFF] p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[11px] text-[#77869A]">
                                  {dateFmt(w.date)}
                                </p>

                                <p className="mt-1 text-[13px] font-bold text-[#1A2D4D]">
                                  Withdrawal #{w.id}
                                </p>
                              </div>

                              <p className="text-[17px] font-extrabold text-[#1B355F]">
                                ₹{fmt(w.amount_inr)}
                              </p>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-bold ${String(w.status ?? "").toLowerCase() === "paid" ? "bg-[#E9F7EF] text-[#168452]" : "bg-[#FFF5E5] text-[#9F7626]"}`}
                              >
                                {friendly(w.status)}
                              </span>

                              <span className="text-[11px] text-[#68788B]">
                                {friendly(w.remark)}
                              </span>
                            </div>
                          </article>
                        ))}
                  </div>
                )}

                <div className="hidden max-w-full overflow-x-auto lg:block">
                  {tab === "transactions" ? (
                    <table className="w-full min-w-[700px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#E9EDF2] bg-[#F7F9FD] text-[11px] font-bold uppercase tracking-[.03em] text-[#677992]">
                          {[
                            "Date",

                            "Category",

                            "Wallet change (INR)",

                            "Green",

                            "Yellow",

                            "Blue",
                          ].map((h) => (
                            <th
                              key={h}

                              className="whitespace-nowrap px-3 py-3 first:pl-0"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {(displayRows as WalletTransaction[]).map((t) => (
                          <tr
                            key={t.id}

                            className="border-b border-[#EFF1F4] text-[12px] text-[#475367] transition-colors hover:bg-[#F7FAFF] last:border-0"
                          >
                            <td className="whitespace-nowrap px-3 py-3.5 pl-0">
                              {dateFmt(t.date)}
                            </td>

                            <td className="px-3 py-3.5">
                              <span className="rounded-md bg-[#F3F5F8] px-2 py-1 font-semibold text-[#515F73]">
                                {t.category}
                              </span>
                            </td>

                            <td
                              className={`px-3 py-3.5 font-bold ${numberOf(t.wallet_change_inr) > 0 ? "text-[#189765]" : numberOf(t.wallet_change_inr) < 0 ? "text-[#BE5656]" : "text-[#4B5563]"}`}
                            >
                              {signed(t.wallet_change_inr, "₹")}
                            </td>

                            {(
                              [
                                t.green_coin,

                                t.yellow_coin,

                                t.blue_coin,
                              ] as Amount[]
                            ).map((v, i) => (
                              <td
                                key={i}

                                className={`px-3 py-3.5 font-semibold ${numberOf(v) > 0 ? "text-[#169B63]" : numberOf(v) < 0 ? "text-[#C65B5B]" : "text-[#687385]"}`}
                              >
                                {signed(v)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full min-w-[650px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#E9EDF2] bg-[#F7F9FD] text-[11px] font-bold uppercase tracking-[.03em] text-[#677992]">
                          {[
                            "Date",

                            "Withdrawal ID",

                            "Amount (INR)",

                            "Status",

                            "Remark",
                          ].map((h) => (
                            <th key={h} className="px-3 py-3 first:pl-0">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {(displayRows as WalletWithdrawal[]).map((w) => (
                          <tr
                            key={w.id}

                            className="border-b border-[#EFF1F4] text-[12px] text-[#475367] transition-colors hover:bg-[#F7FAFF] last:border-0"
                          >
                            <td className="whitespace-nowrap px-3 py-4 pl-0">
                              {dateFmt(w.date)}
                            </td>

                            <td className="px-3 py-4 font-bold">#{w.id}</td>

                            <td className="px-3 py-4 font-bold text-[#B75B5B]">
                              {signed(w.amount_inr, "₹")}
                            </td>

                            <td className="px-3 py-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${w.status.toLowerCase() === "paid" ? "bg-[#ECF8F1] text-[#238C5D]" : "bg-[#F7F3E9] text-[#9F7A2D]"}`}
                              >
                                {friendly(w.status)}
                              </span>
                            </td>

                            <td className="px-3 py-4">Commission Payout</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {!loading && !rows.length && (
                  <div className="flex min-h-[175px] flex-col items-center justify-center gap-2 text-center">
                    <History size={24} className="text-[#AFB8C5]" />

                    <p className="text-[12px] font-semibold text-[#6E7A8C]">
                      {search ? "No matching records" : "No records available"}
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="flex min-h-[175px] items-center justify-center gap-2 text-[12px] text-[#8793A3]">
                    <Loader2 size={17} className="animate-spin" /> Loading
                    wallet data...
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ECEFF3] px-4 py-3.5 sm:px-5">
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#7E8A9A]">
                  <label className="flex items-center gap-2">
                    <span>Rows</span>

                    <select
                      aria-label="Rows per page"

                      className="rounded-[8px] border border-[#E0E5EC] bg-white px-2 py-1.5 text-[#303A49]"

                      value={pageSize}

                      onChange={(e) => {
                        setPageSize(Number(e.target.value));

                        setPage(1);
                      }}
                    >
                      {PAGE_SIZES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>

                  <span>
                    Showing {startRow}–{endRow} of {rows.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    aria-label="Previous page"

                    type="button"

                    disabled={currentPage <= 1}

                    onClick={() => setPage((p) => Math.max(1, p - 1))}

                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6E9EE] text-[#647084] disabled:opacity-35"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#171717] px-2 text-[11px] font-bold text-white">
                    {currentPage}
                  </span>

                  <span className="text-[10px] text-[#8791A0]">
                    / {totalPages}
                  </span>

                  <button
                    aria-label="Next page"

                    type="button"

                    disabled={currentPage >= totalPages}

                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}

                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6E9EE] text-[#647084] disabled:opacity-35"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {wallet?.has_more_transactions && tab === "transactions" && (
                <p className="border-t border-[#F0F2F4] px-5 py-3 text-[10px] text-[#8C6B34]">
                  The API reports additional transactions beyond this response.
                  Pagination here covers the currently returned records only.
                </p>
              )}
            </section>
          </div>
        </main>
      </div>

      {redeemOpen && balances && (
        <RedeemModal
          balances={balances}

          busy={redeeming}

          onClose={() => {
            if (!redeeming) setRedeemOpen(false);
          }}

          onConfirm={handleRedeem}
        />
      )}
    </div>
  );
}
