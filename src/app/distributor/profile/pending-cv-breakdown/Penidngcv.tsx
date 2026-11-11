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
  Sparkles,
  ArrowRight,
  FileSearch,
  Info,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import type { ReactNode } from "react";

import {
  useGetIgniteFloatingCvTxsQuery,
  useLazyGetIgniteFloatingCvTxsQuery,
} from "../../../../lib/redux/api/distributor/igniteFloatingCvTxsApi";

import type { IgniteFloatingCVTransaction } from "../../../../lib/redux/api/distributor/igniteFloatingCvTxsApi";

import Loding from "@/components/common/Loding";

// ==================================================

// DESIGN TOKENS

// ==================================================

const NAVY = "#172B50";

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

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCV(value: number | string | null | undefined): string {
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

function formatWeek(week?: { year: number; week_no: number } | null): string {
  if (!week) return "—";

  return `${week.year} · Week ${String(week.week_no).padStart(2, "0")}`;
}

function getWeekKey(week?: { year: number; week_no: number } | null): string {
  if (!week) return "";

  return `${week.year}-W${String(week.week_no).padStart(2, "0")}`;
}

function getBuyer(transaction: IgniteFloatingCVTransaction): string {
  return (
    transaction.buyer_ba_id ||
    (transaction.buyer_member_id
      ? `Member #${transaction.buyer_member_id}`
      : "—")
  );
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
    <div className="flex min-w-0 flex-col gap-2">
      <label className="text-[12px] font-semibold tracking-[-0.01em] text-[#475569]">
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

function PendingCVError({ onRetry }: { onRetry: () => void }) {
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
    <div className="group relative flex min-w-0 flex-col justify-between gap-5 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white p-5 shadow-[0_5px_25px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cbd8ea] hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)] sm:p-6">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px]"

        style={{ backgroundColor: background, color }}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-[#64748b] sm:text-[13px]">
          {label}
        </p>

        <p
          className="mt-2 break-words text-[25px] font-extrabold leading-tight tracking-[-0.045em] tabular-nums sm:text-[29px]"

          style={{ color }}
        >
          {value}
        </p>

        {subtitle && (
          <p className="mt-1 text-[11px] text-[#94a3b8]">{subtitle}</p>
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

  const [fetchNextPage, { isFetching: isFetchingMore }] =
    useLazyGetIgniteFloatingCvTxsQuery();

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

  const [selectedSettlementWeek, setSelectedSettlementWeek] = useState("all");

  const [newestFirst, setNewestFirst] = useState(true);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
            String(value ?? "")
              .toLowerCase()
              .includes(query),
          );

        const date = getDatePart(transaction.created_at);

        const matchesStartDate = !startDate || date >= startDate;

        const matchesEndDate = !endDate || date <= endDate;

        const matchesSide =
          selectedSide === "all" || String(transaction.side) === selectedSide;

        const matchesSalesWeek =
          selectedSalesWeek === "all" ||
          getWeekKey(transaction.sales_week) === selectedSalesWeek;

        const matchesSettlementWeek =
          selectedSettlementWeek === "all" ||
          getWeekKey(transaction.settlement_week) === selectedSettlementWeek;

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
    const left = transactions.filter((transaction) => transaction.side === 1);

    const right = transactions.filter((transaction) => transaction.side === 2);

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

    const lastLoadedId = transactions[transactions.length - 1]?.id ?? 0;

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

      const lastReturnedId = newRecords[newRecords.length - 1]?.id ?? cursor;

      setNextCursor(nextResponse.after_id || lastReturnedId);

      setHasMore(nextResponse.has_more);
    } catch {
      setLoadMoreError("Unable to load more pending CV records. Please retry.");
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
    return <PendingCVError onRetry={() => void refetch()} />;
  }

  // --------------------------------------------------

  // Shared input styles

  // --------------------------------------------------

  const inputBase =
    "h-[46px] w-full rounded-[12px] border border-[#dfe6f0] bg-white text-[13px] font-medium text-[#1e293b] outline-none transition-all placeholder:text-[#94a3b8] hover:border-[#c0cee0] focus:border-[#4266b2] focus:ring-[3px] focus:ring-[#4266b2]/10";

  const selectBase =
    "h-[46px] w-full cursor-pointer appearance-none rounded-[12px] border border-[#dfe6f0] bg-white pl-3 pr-9 text-[13px] font-medium text-[#1e293b] outline-none transition-all hover:border-[#c0cee0] focus:border-[#4266b2] focus:ring-[3px] focus:ring-[#4266b2]/10";

  // --------------------------------------------------

  // UI

  // --------------------------------------------------

  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}

      className="min-w-0 space-y-5 rounded-[24px] bg-[#f6f8fc] p-3 text-[#172b4d] sm:p-5 lg:p-6"
    >
      <FontImport />

      {/* =========================================*

          HEADER

      ========================================= */}

      <section className="relative isolate overflow-hidden rounded-[24px] bg-gradient-to-br from-[#12254a] via-[#1d396b] to-[#325a99] px-5 py-6 text-white shadow-[0_20px_45px_rgba(23,43,80,0.16)] sm:px-7 sm:py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border-[55px] border-white/[0.045]"
        />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <Network size={23} />
            </div>
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#c9daf8]">
                <Sparkles size={12} /> Network performance
              </div>
              <h1 className="text-[23px] font-extrabold tracking-[-.045em] sm:text-[30px]">
                CV Breakdown
              </h1>
              <p className="mt-2 max-w-2xl text-[12px] leading-6 text-[#d4e1f7] sm:text-[13px]">
                Explore your floating CV transactions, identify which leg
                received volume, and see the related buyers, orders and sales
                weeks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/30 bg-white/15 px-5 text-[12px] font-bold text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 disabled:opacity-60"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />{" "}
            {isFetching ? "Refreshing..." : "Refresh records"}
          </button>
        </div>
      </section>
      <div className="flex items-start gap-3 rounded-[15px] border border-[#dce7f5] bg-[#edf4fd] px-4 py-3 text-[12px] leading-5 text-[#496382]">
        <Info className="mt-0.5 shrink-0 text-[#4266b2]" size={17} />
        <p>
          <strong className="text-[#193d72]">How to use this page:</strong>{" "}
          Check the CV summary, search by BA ID or order number, then select a
          leg or open more filters to narrow transactions. Totals below reflect
          the currently loaded records.
        </p>
      </div>

      {/* =========================================*

          SUMMARY CARDS

      ========================================= */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total CV"

          value={formatCV(summary.totalCV)}

          icon={<TrendingUp size={20} />}

          color={NAVY}

          background="#eceefb"

          subtitle="Sum of loaded transactions"
        />

        <StatCard
          label="Left leg CV"

          value={formatCV(summary.leftCV)}

          icon={<GitBranch size={20} />}

          color={EMERALD}

          background="#eaf7f0"

          subtitle="Volume from left leg"
        />

        <StatCard
          label="Right leg CV"

          value={formatCV(summary.rightCV)}

          icon={<GitBranch size={20} />}

          color={INDIGO}

          background="#eceffb"

          subtitle="Volume from right leg"
        />

        <StatCard
          label="Orders represented"

          value={summary.distinctOrders}

          icon={<Users size={20} />}

          color={BRASS}

          background="#f8f1e4"

          subtitle="Unique orders in loaded records"
        />
      </div>

      {/* =========================================*

          FILTERS

      ========================================= */}

      <div className="rounded-[22px] border border-[#e5eaf3] bg-white p-4 shadow-[0_5px_24px_rgba(15,23,42,0.035)] sm:p-6">
        {/* Filter header row */}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-[#3955A6]" />

            <h2 className="text-[17px] font-bold tracking-[-0.03em] text-[#172b4d]">
              Find transactions
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

        <p className="mb-4 text-[12px] text-[#74839a]">
          Search is instant and applies to the records loaded so far.
        </p>
        <div
          className="mb-5 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter transactions by leg"
        >
          {(
            [
              ["all", "All legs"],
              ["1", "Left leg"],
              ["2", "Right leg"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedSide(key)}
              aria-pressed={selectedSide === key}
              className={`inline-flex min-h-[39px] items-center gap-2 rounded-xl border px-4 text-[12px] font-bold transition-all ${selectedSide === key ? "border-[#244577] bg-[#244577] text-white shadow-[0_5px_13px_rgba(36,69,119,.14)]" : "border-[#e0e7f0] bg-white text-[#61738e] hover:border-[#b6c8e0] hover:bg-[#f7faff]"}`}
            >
              {key !== "all" && (
                <span
                  className={`h-2 w-2 rounded-full ${key === "1" ? "bg-[#31c38c]" : "bg-[#94b7ff]"}`}
                />
              )}{" "}
              {label}
            </button>
          ))}
        </div>
        {/* Row 1: Search + Start Date + End Date */}

        <div className="mb-3.5 grid grid-cols-1 gap-4 md:grid-cols-4">
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

                  onChange={(event) => setSearchQuery(event.target.value)}

                  placeholder="Search buyer BA ID, order, description..."

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

        <button
          type="button"
          onClick={() => setShowAdvancedFilters((value) => !value)}
          aria-expanded={showAdvancedFilters}
          className="mb-3 inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#e2e9f3] bg-[#f7f9fd] px-4 text-[12px] font-bold text-[#385a8c] transition hover:bg-[#edf3fc]"
        >
          <SlidersHorizontal size={15} />{" "}
          {showAdvancedFilters
            ? "Hide advanced filters"
            : "More filters (sales & settlement week)"}{" "}
          <ChevronDown
            size={15}
            className={`transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`}
          />
        </button>
        {/* Row 2: Leg + Sales Week + Settlement Week */}

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-4 rounded-xl bg-[#f8faff] p-3 md:grid-cols-3">
            {/* Side / Leg */}

            <FilterField label="Leg">
              <div className="relative">
                <select
                  value={selectedSide}

                  onChange={(event) => setSelectedSide(event.target.value)}

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

                  onChange={(event) => setSelectedSalesWeek(event.target.value)}

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
        )}
      </div>

      {/* =========================================*

          TABLE

      ========================================= */}

      <section className="rounded-[22px] border border-[#e5eaf3] bg-white p-4 shadow-[0_5px_24px_rgba(15,23,42,0.035)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-bold tracking-[-0.03em] text-[#172b4d]">
              CV transaction history
            </h2>
            <p className="mt-1 text-[12px] text-[#718096]">
              {filteredTransactions.length} matching transactions from{" "}
              {transactions.length} loaded records
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNewestFirst((v) => !v)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dce5f1] bg-[#f8faff] px-3 text-[12px] font-bold text-[#385a8c]"
          >
            <ArrowDownUp size={15} />
            {newestFirst ? "Newest first" : "Oldest first"}
          </button>
        </div>
        {/* Mobile-friendly transaction cards: desktop table remains below for detailed comparison. */}
        <div className="space-y-3 lg:hidden">
          {filteredTransactions.length ? (
            filteredTransactions.map((transaction) => (
              <article
                key={transaction.id}
                className="rounded-2xl border border-[#e4eaf3] bg-[#fbfcff] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b9ab0]">
                      Buyer / Member
                    </p>
                    <p className="mt-1 break-all text-[14px] font-bold text-[#172b4d]">
                      {getBuyer(transaction)}
                    </p>
                    <p className="mt-1 text-[11px] text-[#8290a6]">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                  <SideBadge side={transaction.side} />
                </div>
                <div className="mt-4 flex items-end justify-between gap-3 rounded-xl border border-[#e5eaf4] bg-white p-3">
                  <div>
                    <p className="text-[11px] text-[#8592a7]">
                      Floating CV amount
                    </p>
                    <p
                      className="mt-1 text-[22px] font-extrabold tabular-nums"
                      style={{ color: getSideColor(transaction.side) }}
                    >
                      {formatCV(transaction.amount)}{" "}
                      <span className="text-[11px] font-semibold">CV</span>
                    </p>
                  </div>
                  <TrendingUp size={19} className="text-[#a9b8ce]" />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-[11px]">
                  <div>
                    <dt className="text-[#8b97a8]">Order number</dt>
                    <dd className="mt-1 break-all font-semibold text-[#385a8c]">
                      {transaction.order_no || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#8b97a8]">Member ID</dt>
                    <dd className="mt-1 font-semibold text-[#233957]">
                      {transaction.buyer_member_id ?? "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#8b97a8]">Sales week</dt>
                    <dd className="mt-1 font-semibold text-[#233957]">
                      {formatWeek(transaction.sales_week)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#8b97a8]">Settlement week</dt>
                    <dd className="mt-1 font-semibold text-[#233957]">
                      {formatWeek(transaction.settlement_week)}
                    </dd>
                  </div>
                </dl>
                {transaction.description && (
                  <p className="mt-3 border-t border-[#e8edf5] pt-3 text-[11px] leading-5 text-[#718096]">
                    {humanize(transaction.description)}
                  </p>
                )}
              </article>
            ))
          ) : (
            <div className="rounded-2xl bg-[#f7f9fc] px-4 py-10 text-center">
              <FileSearch size={28} className="mx-auto text-[#9caac0]" />
              <p className="mt-3 font-bold text-[#31435e]">
                No matching transactions
              </p>
              <p className="mt-1 text-[12px] text-[#7a8aa2]">
                Try changing your search or filters.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-[12px] font-bold text-[#4266b2]"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
        <div className="hidden overflow-x-auto rounded-[14px] border border-[#e5eaf3] lg:block">
          <div className="min-w-[1100px]">
            {/* Header */}

            <div className="grid grid-cols-[1.15fr_0.75fr_1.35fr_0.85fr_1.25fr_1fr_1fr] items-center gap-3 border-b border-[#e7e9ee] bg-[#f2f6fc] px-4 py-4 text-[11px] font-bold tracking-wide text-[#60728e]">
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

                  className="grid grid-cols-[1.15fr_0.75fr_1.35fr_0.85fr_1.25fr_1fr_1fr] items-center gap-3 border-b border-[#edf1f7] px-4 py-4 text-[12px] transition-colors last:border-b-0 hover:bg-[#f7faff]"
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
      </section>

      {/* =========================================*

          PAGINATION

      ========================================= */}

      <div className="flex flex-col gap-3 rounded-[17px] border border-[#e5eaf3] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
            <strong className="text-[#101828]">{transactions.length}</strong> of{" "}
            {totalRecords}
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

            className="flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] px-5 text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(23,43,80,.16)] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"

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
