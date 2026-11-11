"use client";

import {
  Search,
  ChevronDown,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  Inbox,
  Wallet,
  Coins,
  ArrowDownUp,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  FileText,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import type { ReactNode } from "react";

import {
  useGetIgnitePointTransactionsQuery,
  useLazyGetIgnitePointTransactionsQuery,
} from "../../../lib/redux/api/distributor/ignitePointTransactionsApi";

import type {
  IgnitePointTransaction,
  IgnitePointType,
} from "../../../lib/redux/api/distributor/ignitePointTransactionsApi";

import Loding from "@/components/common/Loding";

// ==================================================

// DESIGN TOKENS

// ==================================================

const NAVY = "#0E1B3D";

const BRASS = "#B8935A";

const EMERALD = "#1f9d6b";

const INDIGO = "#3955A6";

const RED = "#c0392b";

// ==================================================

// FONT

// ==================================================

const FontImport = () => (
  <style>{`

    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

  `}</style>
);

// ==================================================

// HELPERS

// ==================================================

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value: number | string | null | undefined): string {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 4,
  });
}

function formatSignedAmount(value: number | string | null | undefined): string {
  const amount = toNumber(value);

  const formatted = formatAmount(amount);

  if (amount > 0) return `+${formatted}`;

  return formatted;
}

// API datetime: "2026-10-09 19:49:18.506"

// Format without converting timezone.

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const [datePart, timePart] = value.split(" ");

  if (!datePart) return value;

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return value;

  const date = `${day}/${month}/${year}`;

  const time = timePart ? timePart.slice(0, 8) : "";

  return time ? `${date} ${time}` : date;
}

function getDatePart(value?: string | null): string {
  return value?.split(" ")[0] ?? "";
}

function humanize(value?: string | null): string {
  if (!value) return "—";

  return value

    .replace(/[_-]+/g, " ")

    .replace(/\s+/g, " ")

    .trim()

    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDescription(transaction: IgnitePointTransaction): string {
  const descriptions: Record<string, string> = {
    adj_add: "Balance adjustment added",

    adj_sub: "Balance adjustment deducted",

    wd_partner_payout: "Partner payout withdrawal",

    cr_out: "Balance debited",

    cr_in: "Balance credited",
  };

  return (
    descriptions[transaction.description] ?? humanize(transaction.description)
  );
}

function getCategory(type: string): string {
  const categories: Record<string, string> = {
    adj: "Adjustment",

    wd: "Withdrawal",

    cr: "Credit / debit",
  };

  return categories[type?.toLowerCase()] ?? humanize(type);
}

function getPointTypeLabel(type: IgnitePointType): string {
  const labels: Record<string, string> = {
    cash_bal: "Wallet",

    green_bal: "Green coin",

    yellow_bal: "Yellow coin",

    blue_bal: "Blue coin",
  };

  return labels[type] ?? humanize(type);
}

function getCategoryColor(type: string): string {
  switch (type?.toLowerCase()) {
    case "adj":
      return "bg-[#eceffb] text-[#3955A6]";

    case "wd":
      return "bg-[#fff4e5] text-[#a15c07]";

    case "cr":
      return "bg-[#eaf7f0] text-[#18794e]";

    default:
      return "bg-[#f2f4f7] text-[#667085]";
  }
}

function getAmountColor(value: string | number): string {
  const amount = toNumber(value);

  if (amount > 0) return "text-[#1f9d6b]";

  if (amount < 0) return "text-[#c0392b]";

  return "text-[#667085]";
}

function getRelatedMember(transaction: IgnitePointTransaction): string {
  if (transaction.rel_ba_id) {
    return transaction.rel_ba_id;
  }

  if (transaction.rel_member_id !== null) {
    return `Member #${transaction.rel_member_id}`;
  }

  return "—";
}

function getOrderNumber(transaction: IgnitePointTransaction): string {
  if (
    transaction.order_no === null ||
    transaction.order_no === undefined ||
    transaction.order_no === ""
  ) {
    return "—";
  }

  const order = String(transaction.order_no);

  return order.startsWith("#") ? order : `#${order}`;
}

// ==================================================

// FONT AND LOADER

// ==================================================

function TransactionsLoader() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-[16px] border border-[#e7e9ee] bg-white">
      <Loding />
    </div>
  );
}

// ==================================================

// ERROR STATE

// ==================================================

function TransactionsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
      <AlertCircle size={32} className="text-[#c0392b]" />

      <h2 className="mt-3 text-[16px] font-bold text-[#101828]">
        Unable to load transactions
      </h2>

      <p className="mt-1 max-w-md text-[12px] text-[#667085]">
        Transaction history could not be retrieved. Please try again.
      </p>

      <button
        type="button"

        onClick={onRetry}

        className="mt-4 flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-[12px] font-semibold text-white"

        style={{ backgroundColor: NAVY }}
      >
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  );
}

// ==================================================

// STAT CARD

// ==================================================

function StatCard({
  label,

  value,

  icon,

  color,

  background,
}: {
  label: string;

  value: string | number;

  icon: ReactNode;

  color: string;

  background: string;
}) {
  return (
    <div className="group flex min-w-0 items-center gap-3 rounded-[16px] border border-[#E5EAF2] bg-white p-4 shadow-[0_2px_12px_rgba(14,27,61,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(14,27,61,0.08)] sm:p-5">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]"

        style={{ backgroundColor: background, color }}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[#667085] sm:text-[12px]">
          {label}
        </p>

        <p
          className="mt-1 break-words text-[24px] font-black tracking-tight"

          style={{ color }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ==================================================

// AMOUNT CELL

// A transaction is displayed only in its matching

// wallet/coin column. Other columns display a dash.

// ==================================================

function AmountCell({
  transaction,

  pointType,
}: {
  transaction: IgnitePointTransaction;

  pointType: IgnitePointType;
}) {
  if (transaction.point_type !== pointType) {
    return <span className="text-[12px] text-[#b0b6c3]">—</span>;
  }

  return (
    <span
      className={`whitespace-nowrap text-[12px] font-bold ${getAmountColor(
        transaction.amount,
      )}`}
    >
      {formatSignedAmount(transaction.amount)}
    </span>
  );
}

// ==================================================

// MAIN COMPONENT

// ==================================================

const Transactions = () => {
  // Initial API call.

  const {
    data: response,

    isLoading,

    isFetching,

    isError,

    refetch,
  } = useGetIgnitePointTransactionsQuery(
    { after_id: 0 },

    { refetchOnMountOrArgChange: true },
  );

  // API-backed cursor pagination.

  const [fetchNextPage, { isFetching: isFetchingMore }] =
    useLazyGetIgnitePointTransactionsQuery();

  // Local transaction data combines fetched pages.

  const [transactions, setTransactions] = useState<IgnitePointTransaction[]>(
    [],
  );

  const [nextCursor, setNextCursor] = useState(0);

  const [hasMore, setHasMore] = useState(false);

  const [loadMoreError, setLoadMoreError] = useState("");

  // Filters

  const [searchQuery, setSearchQuery] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [category, setCategory] = useState("all");
  const [pointFilter, setPointFilter] = useState<"all" | IgnitePointType>(
    "all",
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sorting

  const [newestFirst, setNewestFirst] = useState(true);

  // --------------------------------------------------

  // Sync initial API response and refreshed data

  // --------------------------------------------------

  useEffect(() => {
    if (!response) return;

    const initialTransactions = response.data ?? [];

    const lastId = initialTransactions[initialTransactions.length - 1]?.id ?? 0;

    setTransactions(initialTransactions);

    setNextCursor(response.after_id || lastId);

    setHasMore(response.has_more);

    setLoadMoreError("");
  }, [response]);

  // --------------------------------------------------

  // LOAD MORE

  // --------------------------------------------------

  const handleLoadMore = async () => {
    if (!hasMore || isFetchingMore || isFetching) return;

    setLoadMoreError("");

    const lastLoadedId = transactions[transactions.length - 1]?.id ?? 0;

    const cursor = nextCursor || lastLoadedId;

    try {
      const nextResponse = await fetchNextPage({
        after_id: cursor,
      }).unwrap();

      if (!nextResponse.success) {
        setLoadMoreError(
          nextResponse.message || "Unable to load more transactions.",
        );

        return;
      }

      const nextTransactions = nextResponse.data ?? [];

      setTransactions((current) => {
        const existingIds = new Set(current.map((item) => item.id));

        const uniqueTransactions = nextTransactions.filter(
          (item) => !existingIds.has(item.id),
        );

        return [...current, ...uniqueTransactions];
      });

      const nextLastId =
        nextTransactions[nextTransactions.length - 1]?.id ?? cursor;

      setNextCursor(nextResponse.after_id || nextLastId);

      setHasMore(nextResponse.has_more);
    } catch {
      setLoadMoreError("Unable to load more transactions. Please retry.");
    }
  };

  // --------------------------------------------------

  // FILTER AND SORT

  // --------------------------------------------------

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions

      .filter((transaction) => {
        const searchFields = [
          transaction.id,

          transaction.created_at,

          transaction.point_type,

          getPointTypeLabel(transaction.point_type),

          transaction.tx_type,

          getCategory(transaction.tx_type),

          transaction.description,

          getDescription(transaction),

          transaction.amount,

          transaction.bal_after,

          transaction.order_no,

          transaction.redemption_id,

          transaction.rel_member_id,

          transaction.rel_ba_id,

          transaction.member_note,
        ];

        const matchesSearch =
          !query ||
          searchFields.some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(query),
          );

        const transactionDate = getDatePart(transaction.created_at);

        const matchesStartDate = !startDate || transactionDate >= startDate;

        const matchesEndDate = !endDate || transactionDate <= endDate;

        const matchesCategory =
          category === "all" || transaction.tx_type.toLowerCase() === category;

        return (
          matchesSearch && matchesStartDate && matchesEndDate && matchesCategory
        );
      })

      .sort((first, second) => {
        const comparison =
          first.created_at.localeCompare(second.created_at) ||
          first.id - second.id;

        return newestFirst ? -comparison : comparison;
      });
  }, [
    transactions,

    searchQuery,

    startDate,

    endDate,

    category,

    pointFilter,

    newestFirst,
  ]);

  // --------------------------------------------------

  // SUMMARY STATISTICS

  // Counts refer to records loaded so far.

  // --------------------------------------------------

  const adjustmentsCount = transactions.filter(
    (transaction) => transaction.tx_type.toLowerCase() === "adj",
  ).length;

  const withdrawalsCount = transactions.filter(
    (transaction) => transaction.tx_type.toLowerCase() === "wd",
  ).length;

  const creditDebitCount = transactions.filter(
    (transaction) => transaction.tx_type.toLowerCase() === "cr",
  ).length;

  const totalTransactions = response?.total ?? transactions.length;

  // --------------------------------------------------

  // REFRESH

  // --------------------------------------------------

  const handleRefresh = async () => {
    setLoadMoreError("");

    await refetch();
  };

  // --------------------------------------------------

  // CLEAR FILTERS

  // --------------------------------------------------

  const clearFilters = () => {
    setSearchQuery("");

    setStartDate("");

    setEndDate("");

    setCategory("all");
    setPointFilter("all");
  };

  // --------------------------------------------------

  // LOADING

  // --------------------------------------------------

  if (isLoading) {
    return <TransactionsLoader />;
  }

  // --------------------------------------------------

  // ERROR

  // --------------------------------------------------

  if (isError || response?.success === false) {
    return <TransactionsError onRetry={() => void handleRefresh()} />;
  }

  // --------------------------------------------------

  // UI

  // --------------------------------------------------

  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}

      className="min-w-0 space-y-5 rounded-[22px] border border-[#E5EAF2] bg-[#F7F9FC] p-3 shadow-[0_8px_32px_rgba(14,27,61,0.04)] sm:p-5 lg:p-6"
    >
      <FontImport />

      {/* ================= HEADING ================= */}

      <header className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#0E1B3D] via-[#162D58] to-[#294B83] p-5 text-white shadow-[0_14px_30px_rgba(14,27,61,0.16)] sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[34px] border-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-70px] right-[20%] h-40 w-40 rounded-full bg-[#77AAFF]/10 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/10 ring-1 ring-white/15">
              <ArrowDownUp size={23} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-blue-200">
                IndieKonnect · Ignite Wallet
              </p>
              <h1 className="mt-1 text-[22px] font-black tracking-tight sm:text-[28px]">
                Transaction History
              </h1>
              <p className="mt-1 text-[12px] text-blue-100/80">
                Track wallet and coin movements in one place.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={isFetching}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[11px] border border-white/20 bg-white/10 px-4 text-[12px] font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />{" "}
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className="relative mt-5 flex flex-wrap items-center gap-2 text-[11px] text-blue-100/90">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            {transactions.length.toLocaleString("en-IN")} records loaded
          </span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            {hasMore
              ? "More transactions available"
              : "All returned pages loaded"}
          </span>
        </div>
      </header>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <StatCard
          label="Total transactions"

          value={totalTransactions}

          icon={<ArrowDownUp size={20} />}

          color={INDIGO}

          background="#eceffb"
        />

        <StatCard
          label="Adjustments loaded"

          value={adjustmentsCount}

          icon={<FileText size={20} />}

          color={BRASS}

          background="#f8f1e4"
        />

        <StatCard
          label="Withdrawals loaded"

          value={withdrawalsCount}

          icon={<ArrowUpRight size={20} />}

          color={RED}

          background="#fbeceb"
        />

        <StatCard
          label="Credit / debit loaded"

          value={creditDebitCount}

          icon={<ArrowDownLeft size={20} />}

          color={EMERALD}

          background="#eaf7f0"
        />
      </div>

      {/* ================= FILTERS ================= */}

      <section className="rounded-[18px] border border-[#E5EAF2] bg-white p-4 shadow-[0_2px_12px_rgba(14,27,61,0.035)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-extrabold text-[#14233B]">
              Explore transactions
            </h2>
            <p className="mt-1 text-[11px] text-[#8290A4]">
              Filter by wallet, coin, category or date. Search covers loaded
              records.
            </p>
          </div>

          {(searchQuery || startDate || endDate || category !== "all") && (
            <button
              type="button"

              onClick={clearFilters}

              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#3955A6] hover:underline"
            >
              <X size={13} />
              Clear filters
            </button>
          )}
        </div>

        {/* Quick wallet and coin filters */}
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by wallet or coin type"
        >
          {(
            [
              ["all", "All activity"],
              ["cash_bal", "Wallet"],
              ["green_bal", "Green coin"],
              ["yellow_bal", "Yellow coin"],
              ["blue_bal", "Blue coin"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={pointFilter === key}
              onClick={() => setPointFilter(key)}
              className={`rounded-full border px-3.5 py-2 text-[11px] font-bold transition ${pointFilter === key ? "border-[#1C3C70] bg-[#153362] text-white shadow-sm" : "border-[#E2E8F1] bg-[#F8FAFD] text-[#617088] hover:border-[#9AAFD2] hover:bg-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(220px,1fr)_auto] sm:items-center">
          <div className="relative min-w-0">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B6]"
            />
            <input
              type="search"
              aria-label="Search transactions"
              placeholder="Search ID, description, BA ID, order..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 w-full rounded-[11px] border border-[#E1E7F0] bg-[#F9FBFE] pl-10 pr-9 text-[12px] font-medium text-[#1E2B41] outline-none focus:border-[#3B6AB6] focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            {!!searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear transaction search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#94A0AF] hover:bg-[#E8EDF6]"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            aria-expanded={showAdvancedFilters}
            onClick={() => setShowAdvancedFilters((v) => !v)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[11px] border border-[#DDE5F0] bg-white px-4 text-[12px] font-bold text-[#344D72] hover:bg-[#F6F9FC]"
          >
            <CalendarDays size={15} /> Date & category{" "}
            <ChevronDown
              size={14}
              className={
                showAdvancedFilters
                  ? "rotate-180 transition-transform"
                  : "transition-transform"
              }
            />
          </button>
        </div>
        {showAdvancedFilters && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Start date */}

            <div className="relative min-w-0">
              <CalendarDays
                size={15}

                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
              />

              <input
                type="date"

                aria-label="Start date"

                value={startDate}

                max={endDate || undefined}

                onChange={(event) => setStartDate(event.target.value)}

                className="h-[40px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-9 pr-2 text-[12px] text-[#101828] outline-none focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
              />
            </div>

            {/* End date */}

            <div className="relative min-w-0">
              <CalendarDays
                size={15}

                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
              />

              <input
                type="date"

                aria-label="End date"

                value={endDate}

                min={startDate || undefined}

                onChange={(event) => setEndDate(event.target.value)}

                className="h-[40px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-9 pr-2 text-[12px] text-[#101828] outline-none focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
              />
            </div>

            {/* Category */}

            <div className="relative min-w-0">
              <select
                value={category}

                onChange={(event) => setCategory(event.target.value)}

                className="h-[40px] w-full appearance-none rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] px-3 pr-9 text-[12px] text-[#101828] outline-none transition-all focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
              >
                <option value="all">All transaction types</option>

                <option value="adj">Adjustment</option>

                <option value="wd">Withdrawal</option>

                <option value="cr">Credit / debit</option>
              </select>

              <ChevronDown
                size={15}

                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
              />
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-[#8290A4]">
          <span>
            <strong className="font-extrabold text-[#24344B]">
              {filteredTransactions.length}
            </strong>{" "}
            matching of {transactions.length} loaded records
          </span>
          <button
            type="button"
            onClick={() => setNewestFirst((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-bold text-[#385984] hover:bg-[#EFF4FA]"
          >
            <ArrowDownUp size={13} />{" "}
            {newestFirst ? "Newest first" : "Oldest first"}
          </button>
        </div>
      </section>

      {/* ================= TABLE ================= */}

      {/* Mobile-friendly transaction cards, retaining the same filtered records. */}
      <section className="space-y-3 lg:hidden" aria-label="Transaction cards">
        {filteredTransactions.length ? (
          filteredTransactions.map((transaction) => (
            <article
              key={transaction.id}
              className="overflow-hidden rounded-[16px] border border-[#E5EAF2] bg-white p-4 shadow-[0_2px_10px_rgba(14,27,61,0.035)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${getCategoryColor(transaction.tx_type)}`}
                  >
                    {getCategory(transaction.tx_type)}
                  </span>
                  <h3 className="mt-2 break-words text-[13px] font-extrabold text-[#20324F]">
                    {getDescription(transaction)}
                  </h3>
                  <p className="mt-1 text-[11px] text-[#8793A6]">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-[17px] font-black ${getAmountColor(transaction.amount)}`}
                  >
                    {formatSignedAmount(transaction.amount)}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-[#8995A7]">
                    {getPointTypeLabel(transaction.point_type)}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-[11px] bg-[#F6F8FC] p-3 text-[11px]">
                <div>
                  <p className="text-[#929DAD]">Balance after</p>
                  <p className="mt-1 font-extrabold text-[#253953]">
                    {formatAmount(transaction.bal_after)}
                  </p>
                </div>
                {transaction.order_no != null &&
                  transaction.order_no !== "" && (
                    <div>
                      <p className="text-[#929DAD]">Order</p>
                      <p className="mt-1 break-all font-bold text-[#253953]">
                        {getOrderNumber(transaction)}
                      </p>
                    </div>
                  )}
                {(transaction.rel_ba_id ||
                  transaction.rel_member_id != null) && (
                  <div>
                    <p className="text-[#929DAD]">Related member</p>
                    <p className="mt-1 break-all font-bold text-[#253953]">
                      {getRelatedMember(transaction)}
                    </p>
                  </div>
                )}
                {transaction.redemption_id != null && (
                  <div>
                    <p className="text-[#929DAD]">Redemption</p>
                    <p className="mt-1 font-bold text-[#253953]">
                      #{transaction.redemption_id}
                    </p>
                  </div>
                )}
              </div>
              {transaction.member_note && (
                <p className="mt-3 break-words border-t border-[#EDF0F5] pt-3 text-[11px] text-[#78869B]">
                  {transaction.member_note}
                </p>
              )}
            </article>
          ))
        ) : (
          <div className="rounded-[16px] border border-dashed border-[#D9E2EE] bg-white px-5 py-10 text-center">
            <Inbox className="mx-auto text-[#A7B2C3]" size={24} />
            <p className="mt-3 text-[13px] font-bold text-[#34465E]">
              No matching transactions
            </p>
            <p className="mt-1 text-[11px] text-[#8793A5]">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </section>
      {/* Desktop transaction table */}
      <div className="hidden overflow-x-auto rounded-[16px] border border-[#E5EAF2] bg-white shadow-[0_2px_12px_rgba(14,27,61,0.035)] lg:block">
        <div className="min-w-[1320px]">
          {/* Table header */}

          <div className="grid grid-cols-[1.25fr_1fr_1.55fr_.75fr_.8fr_.85fr_.8fr_.9fr_1fr_1.2fr] items-center gap-3 border-b border-[#e7e9ee] bg-[#fafcff] px-4 py-3 text-[11px] font-bold tracking-wide text-[#8a92a6]">
            <button
              type="button"

              onClick={() => setNewestFirst((value) => !value)}

              className="flex items-center gap-1 text-left transition-colors hover:text-[#0E1B3D]"
            >
              Date
              <ChevronDown
                size={12}

                className={newestFirst ? "" : "rotate-180"}
              />
            </button>

            <span>Category</span>

            <span>Description</span>

            <span>Wallet</span>

            <span>Green coin</span>

            <span>Yellow coin</span>

            <span>Blue coin</span>

            <span>Balance after</span>

            <span>Order ID</span>

            <span>Related member</span>
          </div>

          {/* Table rows */}

          {filteredTransactions.length > 0 ? (
            <div>
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}

                  className="grid grid-cols-[1.25fr_1fr_1.55fr_.75fr_.8fr_.85fr_.8fr_.9fr_1fr_1.2fr] items-center gap-3 border-b border-[#EEF1F5] px-4 py-4 text-[12px] last:border-b-0 hover:bg-[#F7F9FE]"
                >
                  {/* Date */}

                  <div className="min-w-0">
                    <p className="whitespace-nowrap font-medium text-[#667085]">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>

                  {/* Category */}

                  <div className="min-w-0">
                    <span
                      className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-bold ${getCategoryColor(
                        transaction.tx_type,
                      )}`}
                    >
                      {getCategory(transaction.tx_type)}
                    </span>

                    <p className="mt-1 break-words text-[10px] text-[#8a92a6]">
                      {getPointTypeLabel(transaction.point_type)}
                    </p>
                  </div>

                  {/* Description */}

                  <div className="min-w-0">
                    <p className="break-words font-semibold text-[#344054]">
                      {getDescription(transaction)}
                    </p>

                    {transaction.member_note && (
                      <p className="mt-1 break-words text-[10px] text-[#8a92a6]">
                        {transaction.member_note}
                      </p>
                    )}

                    {transaction.redemption_id !== null && (
                      <p className="mt-1 text-[10px] text-[#8a92a6]">
                        Redemption #{transaction.redemption_id}
                      </p>
                    )}
                  </div>

                  {/* Wallet amount */}

                  <AmountCell
                    transaction={transaction}

                    pointType="cash_bal"
                  />

                  {/* Green coin */}

                  <AmountCell
                    transaction={transaction}

                    pointType="green_bal"
                  />

                  {/* Yellow coin */}

                  <AmountCell
                    transaction={transaction}

                    pointType="yellow_bal"
                  />

                  {/* Blue coin */}

                  <AmountCell
                    transaction={transaction}

                    pointType="blue_bal"
                  />

                  {/* Balance after */}

                  <span
                    className={`whitespace-nowrap font-bold ${getAmountColor(
                      transaction.bal_after,
                    )}`}
                  >
                    {formatAmount(transaction.bal_after)}
                  </span>

                  {/* Order ID */}

                  <span className="break-words font-semibold text-[#0E1B3D]">
                    {getOrderNumber(transaction)}
                  </span>

                  {/* Related member */}

                  <span
                    className="break-words text-[#667085]"

                    title={getRelatedMember(transaction)}
                  >
                    {getRelatedMember(transaction)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f8fa]">
                <Inbox size={22} className="text-[#98a2b3]" />
              </div>

              <p className="text-[13px] font-semibold text-[#344054]">
                No transactions found
              </p>

              <p className="max-w-md text-[12px] text-[#8a92a6]">
                Try changing your search query, date range or category.
              </p>

              {(searchQuery || startDate || endDate || category !== "all") && (
                <button
                  type="button"

                  onClick={clearFilters}

                  className="mt-1 text-[12px] font-semibold text-[#3955A6] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= PAGINATION ================= */}

      <div className="flex flex-col gap-3 rounded-[16px] border border-[#E5EAF2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#667085]">
          <span>
            Showing{" "}
            <strong className="text-[#101828]">
              {filteredTransactions.length}
            </strong>{" "}
            filtered records
          </span>

          <span>
            Loaded:{" "}
            <strong className="text-[#101828]">{transactions.length}</strong>
            {" / "}
            {totalTransactions}
          </span>

          <span>{hasMore ? "More records available" : "End of records"}</span>
        </div>

        {hasMore && (
          <button
            type="button"

            onClick={() => void handleLoadMore()}

            disabled={isFetchingMore || isFetching}

            className="flex h-10 items-center justify-center gap-2 rounded-[10px] px-5 text-[12px] font-bold text-white shadow-md transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"

            style={{ backgroundColor: NAVY }}
          >
            {isFetchingMore ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ArrowDownUp size={14} />
                Load more
              </>
            )}
          </button>
        )}
      </div>

      {/* ================= PAGINATION ERROR ================= */}

      {loadMoreError && (
        <div
          role="alert"

          className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[9px] border border-[#f2c6c3] bg-[#fff4f3] px-3 py-3"
        >
          <p className="text-[12px] font-medium text-[#b42318]">
            {loadMoreError}
          </p>

          <button
            type="button"

            onClick={() => void handleLoadMore()}

            disabled={isFetchingMore}

            className="text-[12px] font-bold text-[#b42318] underline disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* ================= LOADING STATUS ================= */}

      {isFetching && !isLoading && (
        <div className="mt-3 flex items-center justify-end gap-2 text-[11px] font-medium text-[#667085]">
          <Loader2 size={13} className="animate-spin" />
          Updating transactions...
        </div>
      )}
    </div>
  );
};

export default Transactions;
