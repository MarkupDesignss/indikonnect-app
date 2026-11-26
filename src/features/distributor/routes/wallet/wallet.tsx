"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, ChevronLeft, ChevronRight, Coins, HandCoins, Loader2, RefreshCw, Search, ReceiptText, History, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

import {
  useGetUserDashboardQuery,
  useRedeemCoinsMutation,
} from "@/lib/redux/api/distributor/userDashboardApi";
import { BLACK_BUTTON, CoinTile, CoinType, DATE_FILTER_OPTIONS, DateFilter, PAGE_SIZES, PANEL, WALLET_ENDPOINT, WalletApiResponse, WalletPayload, WalletTab, WalletTransaction, WalletWithdrawal, amountColor, dateFmt, fmt, friendly, getCoinTransactionAmount, getErrorMessage, getNetPayableTransactionAmount, getWalletTransactionAmount, isWithinDateFilter, numberOf, signed } from "@/features/distributor/routes/wallet/wallet.parts/support";
import { RedeemModal } from "@/features/distributor/routes/wallet/wallet.parts/RedeemModal";


export default function WalletPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [wallet, setWallet] = useState<WalletPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);

  const [tab, setTab] = useState<WalletTab>("transactions");

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const requestId = useRef(0);

  const dashboard = useGetUserDashboardQuery(undefined, {
    skip: !authorized,
  });

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

  /**
   * Transactions:
   * Search + selected date filter are applied together.
   */
  const visibleTransactions = useMemo(() => {
    const needle = search.toLowerCase().trim();

    return (wallet?.transactions ?? []).filter((item) => {
      const matchesDate = isWithinDateFilter(item.date, dateFilter);
      if (!matchesDate) return false;

      const matchesSearch =
        !needle ||
        [
          item.date,
          item.category,
          item.description,
          item.id,
          item.order_id,
          item.related_member,
          item.wallet_change_inr,
          item.net_payable_inr,
          item.yellow_coin,
          item.green_coin,
          item.blue_coin,
        ].some((v) => String(v ?? "").toLowerCase().includes(needle));

      return matchesSearch;
    });
  }, [wallet?.transactions, search, dateFilter]);

  /**
   * Withdrawals:
   * Search + selected date filter are applied together.
   */
  const visibleWithdrawals = useMemo(() => {
    const needle = search.toLowerCase().trim();

    return (wallet?.withdrawals ?? []).filter((item) => {
      const matchesDate = isWithinDateFilter(item.date, dateFilter);
      if (!matchesDate) return false;

      const matchesSearch =
        !needle ||
        [
          item.id,
          item.date,
          item.amount_inr,
          item.net_payable_inr,
          item.status,
          item.remark,
        ].some((v) => String(v ?? "").toLowerCase().includes(needle));

      return matchesSearch;
    });
  }, [wallet?.withdrawals, search, dateFilter]);

  // Matching Bonus intentionally has no rows or UI content for now.
  const rows: WalletTransaction[] | WalletWithdrawal[] =
    tab === "transactions"
      ? visibleTransactions
      : tab === "withdrawals"
        ? visibleWithdrawals
        : [];

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const displayRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const startRow = rows.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endRow = Math.min(currentPage * pageSize, rows.length);

  const handleTabChange = (nextTab: WalletTab) => {
    setTab(nextTab);
    setSearch("");
    setPage(1);
  };

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

      if (response.success === false || response.status === false) {
        throw new Error(response.message || "Redemption failed");
      }

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

  return (
    <div
      className="flex min-h-dvh w-full flex-col overflow-x-clip bg-white"
      style={{ fontFamily: "'Lato', Arial, sans-serif" }}
    >
      <div className="relative flex min-w-0 flex-1 items-stretch">
        <main className="min-w-0 flex-1 bg-[#F4F7FB] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1300px] min-w-0 space-y-5 pb-8 sm:space-y-6">
            {/* Header */}
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
                />
                Refresh
              </button>
            </header>

            {/* Fetch Error */}
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

            {/* Coin Balances */}
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
                  <HandCoins size={15} />
                  Redeem Coin
                  <ArrowRight size={13} />
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
                <ShieldCheck size={13} />
                Only Yellow and Blue coins can be redeemed
              </p>
            </section>

            {/* Wallet Activity */}
            <section className={`${PANEL} overflow-hidden`}>
              {/* Activity Header */}
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

                {tab !== "matchingBonus" && (
                  <span className="rounded-full border border-[#E6EAF0] bg-[#F8F9FB] px-2.5 py-1 text-[10px] font-bold text-[#7C8797]">
                    {tab === "transactions"
                      ? visibleTransactions.length
                      : visibleWithdrawals.length} records
                  </span>
                )}
              </div>

              {/* Tabs: always visible independently of wallet/API data */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-4 pt-5 sm:px-6">
                <div
                  role="tablist"
                  aria-label="Wallet history"
                  className="grid w-full max-w-full grid-cols-3 gap-1 rounded-[12px] bg-[#F1F5FA] p-1 sm:w-fit"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "transactions"}
                    onClick={() => handleTabChange("transactions")}
                    className={`min-w-0 whitespace-nowrap rounded-[9px] px-2 py-2.5 text-[10px] font-bold transition-colors sm:px-4 sm:text-[12px] ${
                      tab === "transactions"
                        ? "bg-white text-[#0E1B3D] shadow-sm"
                        : "text-[#6C7D96] hover:text-[#0E1B3D]"
                    }`}
                  >
                    Transactions
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "withdrawals"}
                    onClick={() => handleTabChange("withdrawals")}
                    className={`min-w-0 whitespace-nowrap rounded-[9px] px-2 py-2.5 text-[10px] font-bold transition-colors sm:px-4 sm:text-[12px] ${
                      tab === "withdrawals"
                        ? "bg-white text-[#0E1B3D] shadow-sm"
                        : "text-[#6C7D96] hover:text-[#0E1B3D]"
                    }`}
                  >
                    Payouts
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "matchingBonus"}
                    onClick={() => handleTabChange("matchingBonus")}
                    className={`min-w-0 whitespace-nowrap rounded-[9px] px-2 py-2.5 text-[10px] font-bold transition-colors sm:px-4 sm:text-[12px] ${
                      tab === "matchingBonus"
                        ? "bg-white text-[#0E1B3D] shadow-sm"
                        : "text-[#6C7D96] hover:text-[#0E1B3D]"
                    }`}
                  >
                    Matching Bonus
                  </button>
                </div>

                {/* Search + Date Filter: hidden for Matching Bonus for now */}
                {tab !== "matchingBonus" && (
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    {/* Search */}
                    <div className="relative w-full sm:w-[270px]">
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

                    {/* Date Filter */}
                    <div className="relative w-full sm:w-[130px]">
                      <select
                        aria-label="Filter wallet activity by date"
                        value={dateFilter}
                        onChange={(e) => {
                          setDateFilter(e.target.value as DateFilter);
                          setPage(1);
                        }}
                        className="h-11 w-full cursor-pointer appearance-none rounded-[12px] border border-[#DCE4EE] bg-[#F9FBFF] px-3 pr-9 text-[12px] font-bold text-[#193052] outline-none transition focus:border-[#5B7FBB] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      >
                        {DATE_FILTER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <ChevronRight
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[#7D8CA0]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Matching Bonus has its own empty state until the API returns rows. */}
              {tab === "matchingBonus" ? (
                <div className="px-4 pb-6 pt-4 sm:px-6">
                  <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#E2E8F0] bg-[#FCFDFF] text-center">
                    <History size={26} className="text-[#AFB8C5]" />
                    <p className="text-[13px] font-semibold text-[#6E7A8C]">
                      {loading ? "Loading matching bonus..." : "Data Not Found"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Table / Cards */}
                  <div className="px-4 pt-4 sm:px-6">
                    {!loading && displayRows.length > 0 && (
                      <div className="grid gap-3 lg:hidden">
                        {tab === "transactions"
                          ? (displayRows as WalletTransaction[]).map((t) => {
                              const walletAmount =
                                getWalletTransactionAmount(t);

                              const netPayableAmount =
                                getNetPayableTransactionAmount(t);

                              const coins = [
                                {
                                  label: "Green",
                                  value: getCoinTransactionAmount(
                                    t.green_coin,
                                    t,
                                  ),
                                },
                                {
                                  label: "Yellow",
                                  value: getCoinTransactionAmount(
                                    t.yellow_coin,
                                    t,
                                  ),
                                },
                                {
                                  label: "Blue",
                                  value: getCoinTransactionAmount(
                                    t.blue_coin,
                                    t,
                                  ),
                                },
                              ];

                              return (
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

                                    <div className="shrink-0 text-right">
                                      <p
                                        className={`text-[16px] font-extrabold tabular-nums ${amountColor(walletAmount)}`}
                                      >
                                        {signed(walletAmount, "₹")}
                                      </p>

                                      {t.net_payable_inr != null && (
                                        <p
                                          className={`mt-1 text-[11px] font-semibold tabular-nums ${amountColor(netPayableAmount)}`}
                                        >
                                          Net Payable: {signed(
                                            netPayableAmount,
                                            "₹",
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-[11px] bg-white p-3 text-center ring-1 ring-[#EDF1F5]">
                                    {coins.map(({ label, value }) => (
                                      <div key={label}>
                                        <p className="text-[10px] font-medium text-[#77869A]">
                                          {label}
                                        </p>

                                        <p
                                          className={`mt-1 text-[12px] font-bold tabular-nums ${amountColor(value)}`}
                                        >
                                          {signed(value)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </article>
                              );
                            })
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

                                  <div className="text-right">
                                    <p className="text-[17px] font-extrabold text-[#DC4545]">
                                      {signed(
                                        -Math.abs(numberOf(w.amount_inr)),
                                        "₹",
                                      )}
                                    </p>

                                    {w.net_payable_inr != null && (
                                      <p className="mt-1 text-[11px] font-bold text-[#DC4545]">
                                        Net Payable: ₹{fmt(w.net_payable_inr)}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                  <span
                                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                                      String(w.status ?? "").toLowerCase() ===
                                      "paid"
                                        ? "bg-[#E9F7EF] text-[#168452]"
                                        : "bg-[#FFF5E5] text-[#9F7626]"
                                    }`}
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

                    {/* Desktop Transactions / Payouts Table */}
                    <div className="hidden max-w-full overflow-x-auto lg:block">
                      {tab === "transactions" ? (
                        <table className="w-full min-w-[790px] border-collapse text-left">
                          <thead>
                            <tr className="border-b border-[#E9EDF2] bg-[#F7F9FD] text-[11px] font-bold uppercase tracking-[.03em] text-[#677992]">
                              {[
                                "Date",
                                "Category",
                                "Wallet Change",
                                "Net Payable",
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
                            {(displayRows as WalletTransaction[]).map((t) => {
                              const walletAmount =
                                getWalletTransactionAmount(t);

                              const netPayableAmount =
                                getNetPayableTransactionAmount(t);

                              const coinValues = [
                                getCoinTransactionAmount(t.green_coin, t),
                                getCoinTransactionAmount(t.yellow_coin, t),
                                getCoinTransactionAmount(t.blue_coin, t),
                              ];

                              return (
                                <tr
                                  key={t.id}
                                  className="border-b border-[#EFF1F4] text-[12px] text-[#475367] transition-colors hover:bg-[#F7FAFF] last:border-0"
                                >
                                  <td className="whitespace-nowrap px-3 py-3.5 pl-0">
                                    {dateFmt(t.date)}
                                  </td>

                                  <td className="px-3 py-3.5">
                                    <span className="rounded-md bg-[#F3F5F8] px-2 py-1 font-semibold text-[#515F73]">
                                      {friendly(t.category)}
                                    </span>
                                  </td>

                                  <td
                                    className={`px-3 py-3.5 font-bold ${amountColor(walletAmount)}`}
                                  >
                                    {signed(walletAmount, "₹")}
                                  </td>

                                  <td
                                    className={`whitespace-nowrap px-3 py-3.5 font-bold ${amountColor(netPayableAmount)}`}
                                  >
                                    {t.net_payable_inr != null
                                      ? signed(netPayableAmount, "₹")
                                      : "—"}
                                  </td>

                                  {coinValues.map((value, i) => (
                                    <td
                                      key={i}
                                      className={`px-3 py-3.5 font-semibold ${amountColor(value)}`}
                                    >
                                      {signed(value)}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <table className="w-full min-w-[720px] border-collapse text-left">
                          <thead>
                            <tr className="border-b border-[#E9EDF2] bg-[#F7F9FD] text-[11px] font-bold uppercase tracking-[.03em] text-[#677992]">
                              {[
                                "Date",
                                "Withdrawal ID",
                                "Amount",
                                "Net Payable",
                                "Status",
                                "Remark",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="px-3 py-3 first:pl-0"
                                >
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

                                <td className="px-3 py-4 font-bold">
                                  #{w.id}
                                </td>

                                <td className="px-3 py-4 font-bold text-[#DC4545]">
                                  {signed(
                                    -Math.abs(numberOf(w.amount_inr)),
                                    "₹",
                                  )}
                                </td>

                                <td className="whitespace-nowrap px-3 py-4 font-bold text-[#DC4545]">
                                  {w.net_payable_inr != null
                                    ? `₹${fmt(w.net_payable_inr)}`
                                    : "—"}
                                </td>

                                <td className="px-3 py-4">
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                      String(w.status ?? "").toLowerCase() ===
                                      "paid"
                                        ? "bg-[#ECF8F1] text-[#238C5D]"
                                        : "bg-[#F7F3E9] text-[#9F7A2D]"
                                    }`}
                                  >
                                    {friendly(w.status)}
                                  </span>
                                </td>

                                <td className="px-3 py-4">
                                  {friendly(w.remark || "Commission Payout")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Empty State */}
                    {!loading && !rows.length && (
                      <div className="flex min-h-[175px] flex-col items-center justify-center gap-2 text-center">
                        <History size={24} className="text-[#AFB8C5]" />

                        <p className="text-[12px] font-semibold text-[#6E7A8C]">
                          {search || dateFilter !== "all"
                            ? "No matching records"
                            : "No records available"}
                        </p>

                        {(search || dateFilter !== "all") && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch("");
                              setDateFilter("all");
                              setPage(1);
                            }}
                            className="mt-1 text-[11px] font-bold text-[#315E9E] underline underline-offset-2"
                          >
                            Clear search and filters
                          </button>
                        )}
                      </div>
                    )}

                    {/* Loading */}
                    {loading && (
                      <div className="flex min-h-[175px] items-center justify-center gap-2 text-[12px] text-[#8793A3]">
                        <Loader2 size={17} className="animate-spin" />
                        Loading wallet data...
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
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
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6E9EE] text-[#647084] disabled:opacity-35"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>

                  {/* API Pagination Note */}
                  {wallet?.has_more_transactions &&
                    tab === "transactions" && (
                      <p className="border-t border-[#F0F2F4] px-5 py-3 text-[10px] text-[#8C6B34]">
                        The API reports additional transactions beyond this
                        response. Pagination here covers the currently returned
                        records only.
                      </p>
                    )}
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Redeem Modal */}
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
