"use client";

import {
  Search,
  ChevronDown,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  Inbox,
  Users,
  GitBranch,
  CalendarDays,
  ArrowDownUp,
  TrendingUp,
  Network,
  SlidersHorizontal,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  useGetIgniteFloatingCvTxsQuery,
  useLazyGetIgniteFloatingCvTxsQuery,
} from "../../../../lib/redux/api/distributor/igniteFloatingCvTxsApi";

import type {
  IgniteFloatingCVTransaction,
} from "../../../../lib/redux/api/distributor/igniteFloatingCvTxsApi";
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

    /* Hide default date input calendar icon so custom icon stays clean */
    input[type="date"]::-webkit-calendar-picker-indicator {
      opacity: 0;
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  `}</style>
);

// ==================================================
// HELPERS
// ==================================================

function toNumber(
  value: number | string | null | undefined,
): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCV(
  value: number | string | null | undefined,
): string {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 4,
  });
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const [datePart, timePart] = value.split(" ");

  if (!datePart) return value;

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return value;

  return timePart
    ? `${day}/${month}/${year} ${timePart.slice(0, 8)}`
    : `${day}/${month}/${year}`;
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

function getSideLabel(side: number): string {
  if (side === 1) return "Left";
  if (side === 2) return "Right";

  return "Unknown";
}

function getSideColor(side: number): string {
  if (side === 1) return EMERALD;
  if (side === 2) return INDIGO;

  return NAVY;
}

function formatWeek(
  week?: { year: number; week_no: number } | null,
): string {
  if (!week) return "—";

  return `${week.year} · Week ${String(week.week_no).padStart(2, "0")}`;
}

function getWeekKey(
  week?: { year: number; week_no: number } | null,
): string {
  if (!week) return "";

  return `${week.year}-W${String(week.week_no).padStart(2, "0")}`;
}

function getBuyer(transaction: IgniteFloatingCVTransaction): string {
  return transaction.buyer_ba_id ||
    (transaction.buyer_member_id
      ? `Member #${transaction.buyer_member_id}`
      : "—");
}

// ==================================================
// REUSABLE FILTER FIELD WRAPPER
// ==================================================

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#8a92a6]">
        {label}
      </label>
      {children}
    </div>
  );
}

// ==================================================
// LOADING STATE
// ==================================================

function PendingCVLoader() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-[16px] border border-[#e7e9ee] bg-white">
    <Loding />
    </div>
  );
}

// ==================================================
// ERROR STATE
// ==================================================

function PendingCVError({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
      <AlertCircle size={32} className="text-[#c0392b]" />

      <h2 className="mt-3 text-[16px] font-bold text-[#101828]">
        Unable to load pending CV
      </h2>

      <p className="mt-1 max-w-md text-[12px] text-[#667085]">
        Floating CV transactions could not be retrieved. Please try again.
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
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  background: string;
  subtitle?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[13px] border border-[#e7e9ee] bg-white p-3.5 transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.15)] sm:p-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: background, color }}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-[#667085] sm:text-[12px]">
          {label}
        </p>

        <p
          className="mt-0.5 break-words text-[16px] font-black"
          style={{ color }}
        >
          {value}
        </p>

        {subtitle && (
          <p className="mt-0.5 text-[10px] text-[#98a2b3]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ==================================================
// SIDE BADGE
// ==================================================

function SideBadge({ side }: { side: number }) {
  const color = getSideColor(side);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
      style={{
        backgroundColor: `${color}14`,
        color,
      }}
    >
      <GitBranch size={11} />
      {getSideLabel(side)} leg
    </span>
  );
}

// ==================================================
// CV AMOUNT
// ==================================================

function CVAmount({
  value,
  color = NAVY,
}: {
  value: string | number;
  color?: string;
}) {
  return (
    <span
      className="whitespace-nowrap text-[12px] font-bold"
      style={{ color }}
    >
      {formatCV(value)}
    </span>
  );
}

// ==================================================
// MAIN COMPONENT
// ==================================================

const Penidngcv = () => {
  // Initial request.
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetIgniteFloatingCvTxsQuery(
    { after_id: 0 },
    { refetchOnMountOrArgChange: true },
  );

  // Cursor pagination request.
  const [
    fetchNextPage,
    { isFetching: isFetchingMore },
  ] = useLazyGetIgniteFloatingCvTxsQuery();

  // Loaded transaction records.
  const [transactions, setTransactions] = useState<
    IgniteFloatingCVTransaction[]
  >([]);

  const [nextCursor, setNextCursor] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");

  // Search and filters.
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSide, setSelectedSide] = useState("all");
  const [selectedSalesWeek, setSelectedSalesWeek] = useState("all");
  const [selectedSettlementWeek, setSelectedSettlementWeek] =
    useState("all");

  const [newestFirst, setNewestFirst] = useState(true);

  // --------------------------------------------------
  // Sync initial API response / refresh
  // --------------------------------------------------

  useEffect(() => {
    if (!response) return;

    const records = response.data ?? [];

    const lastId = records[records.length - 1]?.id ?? 0;

    setTransactions(records);
    setNextCursor(response.after_id || lastId);
    setHasMore(response.has_more);
    setLoadMoreError("");
  }, [response]);

  // --------------------------------------------------
  // Dynamic week dropdown options
  // --------------------------------------------------

  const salesWeeks = useMemo(() => {
    const weeks = new Map<string, string>();

    transactions.forEach((transaction) => {
      const key = getWeekKey(transaction.sales_week);

      if (key) {
        weeks.set(key, formatWeek(transaction.sales_week));
      }
    });

    return Array.from(weeks.entries()).sort(([first], [second]) =>
      second.localeCompare(first),
    );
  }, [transactions]);

  const settlementWeeks = useMemo(() => {
    const weeks = new Map<string, string>();

    transactions.forEach((transaction) => {
      const key = getWeekKey(transaction.settlement_week);

      if (key) {
        weeks.set(key, formatWeek(transaction.settlement_week));
      }
    });

    return Array.from(weeks.entries()).sort(([first], [second]) =>
      second.localeCompare(first),
    );
  }, [transactions]);

  // --------------------------------------------------
  // Filter data
  // --------------------------------------------------

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions
      .filter((transaction) => {
        const searchable = [
          transaction.id,
          transaction.created_at,
          transaction.side,
          getSideLabel(transaction.side),
          transaction.amount,
          transaction.description,
          transaction.buyer_member_id,
          transaction.buyer_ba_id,
          transaction.order_no,
          getWeekKey(transaction.sales_week),
          getWeekKey(transaction.settlement_week),
        ];

        const matchesSearch =
          !query ||
          searchable.some((value) =>
            String(value ?? "").toLowerCase().includes(query),
          );

        const date = getDatePart(transaction.created_at);

        const matchesStartDate =
          !startDate || date >= startDate;

        const matchesEndDate =
          !endDate || date <= endDate;

        const matchesSide =
          selectedSide === "all" ||
          String(transaction.side) === selectedSide;

        const matchesSalesWeek =
          selectedSalesWeek === "all" ||
          getWeekKey(transaction.sales_week) === selectedSalesWeek;

        const matchesSettlementWeek =
          selectedSettlementWeek === "all" ||
          getWeekKey(transaction.settlement_week) ===
            selectedSettlementWeek;

        return (
          matchesSearch &&
          matchesStartDate &&
          matchesEndDate &&
          matchesSide &&
          matchesSalesWeek &&
          matchesSettlementWeek
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
    selectedSide,
    selectedSalesWeek,
    selectedSettlementWeek,
    newestFirst,
  ]);

  // --------------------------------------------------
  // Summary calculated from loaded API records
  // --------------------------------------------------

  const summary = useMemo(() => {
    const left = transactions.filter(
      (transaction) => transaction.side === 1,
    );

    const right = transactions.filter(
      (transaction) => transaction.side === 2,
    );

    const leftCV = left.reduce(
      (sum, transaction) => sum + toNumber(transaction.amount),
      0,
    );

    const rightCV = right.reduce(
      (sum, transaction) => sum + toNumber(transaction.amount),
      0,
    );

    const totalCV = transactions.reduce(
      (sum, transaction) => sum + toNumber(transaction.amount),
      0,
    );

    const distinctOrders = new Set(
      transactions
        .map((transaction) => transaction.order_no)
        .filter(Boolean),
    ).size;

    return {
      leftCV,
      rightCV,
      totalCV,
      distinctOrders,
    };
  }, [transactions]);

  const totalRecords = response?.total ?? transactions.length;

  // --------------------------------------------------
  // Cursor pagination
  // --------------------------------------------------

  const handleLoadMore = async () => {
    if (!hasMore || isFetchingMore || isFetching) return;

    setLoadMoreError("");

    const lastLoadedId =
      transactions[transactions.length - 1]?.id ?? 0;

    const cursor = nextCursor || lastLoadedId;

    try {
      const nextResponse = await fetchNextPage({
        after_id: cursor,
      }).unwrap();

      if (!nextResponse.success) {
        setLoadMoreError(
          nextResponse.message || "Unable to load more records.",
        );
        return;
      }

      const newRecords = nextResponse.data ?? [];

      setTransactions((current) => {
        const existingIds = new Set(
          current.map((transaction) => transaction.id),
        );

        const uniqueRecords = newRecords.filter(
          (transaction) => !existingIds.has(transaction.id),
        );

        return [...current, ...uniqueRecords];
      });

      const lastReturnedId =
        newRecords[newRecords.length - 1]?.id ?? cursor;

      setNextCursor(nextResponse.after_id || lastReturnedId);
      setHasMore(nextResponse.has_more);
    } catch {
      setLoadMoreError(
        "Unable to load more pending CV records. Please retry.",
      );
    }
  };

  // --------------------------------------------------
  // Clear filters
  // --------------------------------------------------

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSelectedSide("all");
    setSelectedSalesWeek("all");
    setSelectedSettlementWeek("all");
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    selectedSide !== "all" ||
    selectedSalesWeek !== "all" ||
    selectedSettlementWeek !== "all";

  // --------------------------------------------------
  // Loading / Error
  // --------------------------------------------------

  if (isLoading) {
    return <PendingCVLoader />;
  }

  if (isError || response?.success === false) {
    return (
      <PendingCVError onRetry={() => void refetch()} />
    );
  }

  // --------------------------------------------------
  // Shared input styles
  // --------------------------------------------------

  const inputBase =
    "h-[42px] w-full rounded-[9px] border border-[#e5e9ef] bg-white text-[12.5px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:ring-2 focus:ring-[#0E1B3D]/10";

  const selectBase =
    "h-[42px] w-full appearance-none rounded-[9px] border border-[#e5e9ef] bg-white pl-3 pr-9 text-[12.5px] text-[#101828] outline-none transition-all focus:border-[#0E1B3D] focus:ring-2 focus:ring-[#0E1B3D]/10 cursor-pointer";

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="min-w-0 rounded-[16px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6"
    >
      <FontImport />

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#eceffb]">
            <Network size={22} className="text-[#3955A6]" />
          </div>

          <div className="min-w-0">
            <h1 className="text-[18px] font-black text-[#101828] sm:text-[20px]">
              Pending CV Breakdown
            </h1>

            <p className="max-w-2xl text-[12px] leading-5 text-[#667085]">
              Review your floating CV entries by binary leg, buyer,
              order, sales week and settlement week.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="flex h-9 shrink-0 items-center gap-2 rounded-[8px] border border-[#e5e9ef] bg-white px-3 text-[12px] font-semibold text-[#344054] hover:bg-[#f7f8fa] disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={isFetching ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total CV"
          value={formatCV(summary.totalCV)}
          icon={<TrendingUp size={20} />}
          color={NAVY}
          background="#eceefb"
          subtitle="Loaded records"
        />

        <StatCard
          label="Left leg CV"
          value={formatCV(summary.leftCV)}
          icon={<GitBranch size={20} />}
          color={EMERALD}
          background="#eaf7f0"
          subtitle="Side 1"
        />

        <StatCard
          label="Right leg CV"
          value={formatCV(summary.rightCV)}
          icon={<GitBranch size={20} />}
          color={INDIGO}
          background="#eceffb"
          subtitle="Side 2"
        />

        <StatCard
          label="Orders represented"
          value={summary.distinctOrders}
          icon={<Users size={20} />}
          color={BRASS}
          background="#f8f1e4"
          subtitle="Unique order numbers"
        />
      </div>

      {/* =========================================
          FILTERS
      ========================================= */}

      <div className="mt-7 rounded-[14px] border border-[#edf0f3] bg-[#fafbfd] p-4 sm:p-5">
        {/* Filter header row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-[#3955A6]" />
            <h2 className="text-[13.5px] font-bold text-[#101828]">
              Filters
            </h2>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-[7px] border border-[#e5e9ef] bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-[#3955A6] transition-colors hover:bg-[#f0f3fb]"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>

        {/* Row 1: Search + Start Date + End Date */}
        <div className="mb-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-4">
          {/* Search — spans 2 columns */}
          <div className="md:col-span-2">
            <FilterField label="Search">
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search by buyer, order no, description..."
                  className={`${inputBase} pl-9 pr-3`}
                />
              </div>
            </FilterField>
          </div>

          {/* Start date — 1 column */}
          <FilterField label="Start date">
            <div className="relative">
              <CalendarDays
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3] z-10"
              />

              <input
                type="date"
                aria-label="Start date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                className={`${inputBase} pl-9 pr-3 relative`}
              />
            </div>
          </FilterField>

          {/* End date — 1 column */}
          <FilterField label="End date">
            <div className="relative">
              <CalendarDays
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3] z-10"
              />

              <input
                type="date"
                aria-label="End date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className={`${inputBase} pl-9 pr-3 relative`}
              />
            </div>
          </FilterField>
        </div>

        {/* Row 2: Leg + Sales Week + Settlement Week */}
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {/* Side / Leg */}
          <FilterField label="Leg">
            <div className="relative">
              <select
                value={selectedSide}
                onChange={(event) =>
                  setSelectedSide(event.target.value)
                }
                className={selectBase}
              >
                <option value="all">All legs</option>
                <option value="1">Left leg</option>
                <option value="2">Right leg</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
              />
            </div>
          </FilterField>

          {/* Sales week */}
          <FilterField label="Sales week">
            <div className="relative">
              <select
                value={selectedSalesWeek}
                onChange={(event) =>
                  setSelectedSalesWeek(event.target.value)
                }
                className={selectBase}
              >
                <option value="all">All sales weeks</option>

                {salesWeeks.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
              />
            </div>
          </FilterField>

          {/* Settlement week */}
          <FilterField label="Settlement week">
            <div className="relative">
              <select
                value={selectedSettlementWeek}
                onChange={(event) =>
                  setSelectedSettlementWeek(event.target.value)
                }
                className={selectBase}
              >
                <option value="all">All settlement weeks</option>

                {settlementWeeks.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
              />
            </div>
          </FilterField>
        </div>
      </div>

      {/* =========================================
          TABLE
      ========================================= */}

      <div className="mt-6 overflow-x-auto rounded-[10px] border border-[#edf0f3]">
        <div className="min-w-[1100px]">
          {/* Header */}
          <div className="grid grid-cols-[1.15fr_0.75fr_1.35fr_0.85fr_1.25fr_1fr_1fr] items-center gap-3 border-b border-[#e7e9ee] bg-[#fafcff] px-4 py-3 text-[10px] font-bold tracking-wide text-[#8a92a6] sm:text-[11px]">
            <button
              type="button"
              onClick={() => setNewestFirst((value) => !value)}
              className="flex items-center gap-1 text-left hover:text-[#0E1B3D]"
            >
              Date
              <ArrowDownUp size={12} />
              <ChevronDown
                size={11}
                className={newestFirst ? "" : "rotate-180"}
              />
            </button>

            <span>Side</span>
            <span>Buyer / Member</span>
            <span>Amount CV</span>
            <span>Order number</span>
            <span>Sales week</span>
            <span>Settlement week</span>
          </div>

          {/* Rows */}
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-[1.15fr_0.75fr_1.35fr_0.85fr_1.25fr_1fr_1fr] items-center gap-3 border-b border-dashed border-[#e7e9ee] px-4 py-4 text-[12px] last:border-b-0 hover:bg-[#fcfdff]"
              >
                {/* Date / transaction ID */}
                <div className="min-w-0">
                  <p className="whitespace-nowrap font-medium text-[#475467]">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>

                {/* Side */}
                <div>
                  <SideBadge side={transaction.side} />
                </div>

                {/* Buyer */}
                <div className="min-w-0">
                  <p className="break-all font-bold text-[#101828]">
                    {getBuyer(transaction)}
                  </p>

                  <p className="mt-1 text-[10px] text-[#8a92a6]">
                    Member ID: {transaction.buyer_member_id ?? "—"}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <CVAmount
                    value={transaction.amount}
                    color={getSideColor(transaction.side)}
                  />

                  <p className="mt-1 text-[10px] text-[#8a92a6]">
                    {humanize(transaction.description)}
                  </p>
                </div>

                {/* Order */}
                <span
                  className="break-words font-semibold text-[#3955A6]"
                  title={transaction.order_no ?? ""}
                >
                  {transaction.order_no || "—"}
                </span>

                {/* Sales week */}
                <div className="min-w-0">
                  <p className="font-semibold text-[#344054]">
                    {formatWeek(transaction.sales_week)}
                  </p>

                  {transaction.sales_week && (
                    <p className="mt-1 text-[10px] text-[#8a92a6]">
                      Year {transaction.sales_week.year}
                    </p>
                  )}
                </div>

                {/* Settlement week */}
                <div className="min-w-0">
                  <p className="font-semibold text-[#344054]">
                    {formatWeek(transaction.settlement_week)}
                  </p>

                  {transaction.settlement_week && (
                    <p className="mt-1 text-[10px] text-[#8a92a6]">
                      Year {transaction.settlement_week.year}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f8fa]">
                <Inbox size={22} className="text-[#98a2b3]" />
              </div>

              <p className="text-[13px] font-semibold text-[#344054]">
                No pending CV records found
              </p>

              <p className="max-w-md text-[12px] text-[#8a92a6]">
                Try another search term, date range, side or week.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[12px] font-semibold text-[#3955A6] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          PAGINATION
      ========================================= */}

      <div className="mt-4 flex flex-col gap-3 border-t border-[#f0f2f5] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#667085]">
          <span>
            Showing{" "}
            <strong className="text-[#101828]">
              {filteredTransactions.length}
            </strong>{" "}
            filtered records
          </span>

          <span>
            Loaded{" "}
            <strong className="text-[#101828]">
              {transactions.length}
            </strong>{" "}
            of {totalRecords}
          </span>

          <span>
            {hasMore ? "More records available" : "All records loaded"}
          </span>
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => void handleLoadMore()}
            disabled={isFetchingMore || isFetching}
            className="flex h-10 items-center justify-center gap-2 rounded-[9px] px-5 text-[12px] font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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

      {isFetching && !isLoading && (
        <div className="mt-3 flex items-center justify-end gap-2 text-[11px] font-medium text-[#667085]">
          <Loader2 size={13} className="animate-spin" />
          Updating pending CV...
        </div>
      )}
    </div>
  );
};

export default Penidngcv;