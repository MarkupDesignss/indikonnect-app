"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";

import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  Check,
  Search,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";

import Sidebar from "@/components/Distributor/distributor/Sidebar";

import { useGetUserDashboardQuery } from "@/lib/redux/api/distributor/userDashboardApi";

import { useGetPairingsQuery } from "@/lib/redux/api/distributor/pairingsApi";

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
// --------------------------------------------------// Calendar helpers (API is authoritative)// --------------------------------------------------
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

/** The supplied backend timestamps are without an explicit timezone.*

* * For the poster we display their DATE COMPONENTS as-is: this avoids*

* * silently converting a payout date into a different day.*

* * The raw timestamp is kept in the title attribute for precise review.*

* */

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

/** Image's rank-basis rules, retained separately from the API schedule.*

* * Only applied for the supplied 2026 poster. They are not returned by the API.*

* */

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

  return [];
}

function getCvYearOptions(calendar?: SalesCalendar): number[] {
  const currentYear = getCalendarYear(calendar);

  return calendar?.all_months?.length ? [currentYear] : [];
}
// --------------------------------------------------// Image-inspired 2026 sales calendar, dynamically populated from the API// --------------------------------------------------
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
    "border border-[#e2e9f2] px-1 py-1.5 text-center text-[10px] font-bold uppercase leading-[1.35] sm:text-[11px]";

  const cell =
    "border border-[#e2e9f2] px-1 py-[5px] text-center text-[10px] leading-[1.4] sm:text-[11px]";

  return (
    <div className="min-w-0 overflow-x-auto rounded-[16px] border border-[#dce5f1] bg-white shadow-[0_8px_24px_rgba(20,50,100,.05)]">
      <table className="w-full min-w-[540px] table-fixed border-collapse bg-white">
        <thead>
          <tr className="bg-[#172c51] text-white">
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

          <tr className="bg-[#e9f0fa] text-[#253f68]">
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

                        className="border border-[#e2e9f2] bg-[#e9f0fa] px-0.5 text-center align-middle"
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

                        className={`mx-auto flex h-[22px] min-w-[24px] items-center justify-center rounded px-0.5 text-[10px] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#f2a91b] ${selected ? "bg-[#245cbd] text-white" : active ? "bg-[#ffe6a0] text-[#123d84] hover:bg-[#fbd473]" : "text-[#123d84] hover:bg-[#dceaff]"}`}
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
                      className={`${cell} whitespace-nowrap bg-[#fff7e8]`}

                      title={week.payout_date ?? ""}
                    >
                      <span className="rounded-sm bg-[#fff0ce] px-0.5 py-0.5 font-bold text-[#143f82]">
                        {formatPosterApiDate(week.payout_date)}
                      </span>
                    </td>

                    {index === 0 && (
                      <td
                        rowSpan={weeks.length}

                        className="border border-[#e2e9f2] bg-[#f9fafc] px-1 py-1.5 text-center align-middle"
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
    <section className="relative isolate mt-3 overflow-hidden rounded-[24px] border border-[#dce5f1] bg-gradient-to-br from-[#eaf1fb] via-[#f5f8fc] to-white p-3 shadow-[0_10px_32px_rgba(20,50,100,.06)] sm:p-5 lg:p-6">
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
        {activeWeek && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e2ee] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#34547f]">
            <span className="h-2 w-2 rounded-full bg-[#d09e36]" />
            Current week {activeWeek.week_no}
          </span>
        )}
      </div>

      {/* Find CV appears ABOVE the sales calendar, within the same card. */}

      {children && (
        <div className="relative mb-4 rounded-[12px] border border-[#dce5ef] bg-white/90 p-3 sm:p-4">
          {children}
        </div>
      )}

      <div className="relative mb-3 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h2 className="text-[20px] font-extrabold leading-tight tracking-[-.025em] text-[#1c3d71] sm:text-[23px] lg:text-[26px]">
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
// --------------------------------------------------// Dropdown types// --------------------------------------------------
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
// --------------------------------------------------// Searchable dropdown// --------------------------------------------------
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

        className="group flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-[13px] border border-[#dce5f2] bg-white px-3.5 text-left outline-none transition-all hover:border-[#ABABAB] hover:bg-[#FCFCFC] focus-visible:border-[#242424] focus-visible:ring-4 focus-visible:ring-[#242424]/10 disabled:cursor-not-allowed disabled:bg-[#f7f8fa] disabled:text-[#98a2b3] sm:px-4"
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

            className="absolute left-0 top-[calc(100%+8px)] z-[80] w-full min-w-[220px] overflow-hidden rounded-[16px] border border-[#dce5f2] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.13)]"
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
                        : "border-[#E7E7E7] bg-[#f8fbff] hover:bg-[#eaf1ff]"
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
                            ? "bg-[#eaf1ff] text-[#202020]"
                            : "text-[#344054] hover:bg-[#f1f5fc]"
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
// --------------------------------------------------// CV filters// --------------------------------------------------
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
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#ECECEC] bg-[#f1f5fc] text-[#313131]">
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

          className="inline-flex h-12 w-full min-w-0 items-center justify-center gap-2 rounded-[12px] bg-[#245cbd] px-5 text-[13px] font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.10)] transition-all hover:bg-[#1b4b9c] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245cbd]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[13.5px] xl:w-auto xl:min-w-[128px]"
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
                  ? "border border-[#dce5f2] bg-[#f8fbff] text-[#454545]"
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

type PairingsResponse = {
  data?: unknown;
  isFetching: boolean;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => unknown;
};

type MetricRow = { name: string; value: string | number };

function extractPairingRows(value: unknown): MetricRow[] {
  if (!value || typeof value !== "object") return [];

  const root = value as Record<string, unknown>;

  const payload =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const candidates = [
    payload.ignite,
    payload.cv_counter,
    payload.cv_summary,
    payload.summary,
    payload.stats,
    payload,
  ];

  const keys = [
    "cv_left",
    "cv_right",
    "total_cv_left",
    "total_cv_right",
    "floating_cv_left",
    "floating_cv_right",
    "total_steps",
    "paired_cv",
    "pairing_commission",
    "weekly_pairing_usd",
    "rank_no",
  ];

  const rows: MetricRow[] = [];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate))
      continue;

    const data = candidate as Record<string, unknown>;

    for (const key of keys) {
      const val = data[key];

      if (
        (typeof val === "string" || typeof val === "number") &&
        !rows.some((row) => row.name === key)
      ) {
        rows.push({ name: key, value: val });
      }
    }
  }

  return rows;
}

function getErrorText(error: unknown) {
  if (!error || typeof error !== "object")
    return "Unable to load CV data. Please try again.";

  const e = error as { data?: { message?: string }; message?: string };

  return (
    e.data?.message || e.message || "Unable to load CV data. Please try again."
  );
}

/** Standalone sales calendar page. Uses the exact Dashboard API sales_calendar.all_months and Pairings API. */

export default function DistributorSalesCalendarPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [authorized, setAuthorized] = useState(false);

  const redirectOnce = useRef(false);

  const [selectedYear, setSelectedYear] = useState(0);

  const [selectedWeek, setSelectedWeek] = useState(0);

  const [submitted, setSubmitted] = useState<CvSearchFilters | null>(null);

  const [initializedYear, setInitializedYear] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || redirectOnce.current) return;

    const token = localStorage.getItem("distributor_token");

    const authToken = localStorage.getItem("auth_token");

    const userType = (localStorage.getItem("user_type") || "")
      .trim()
      .toLowerCase();

    const loggedIn = localStorage.getItem("is_logged_in");

    if (
      token ||
      (authToken && userType === "distributor") ||
      (userType === "distributor" && loggedIn === "true")
    ) {
      setAuthorized(true);
    } else {
      redirectOnce.current = true;

      router.replace("/auth/distributor/login/");
    }
  }, [mounted, router]);

  const dashboardQuery = useGetUserDashboardQuery(undefined, {
    skip: !mounted || !authorized,
    refetchOnMountOrArgChange: true,
  });

  const data = dashboardQuery.data?.data;

  const calendar = (data as any)?.sales_calendar as SalesCalendar | undefined;

  const calendarYear = getCalendarYear(calendar);

  const currentWeek = getCurrentCalendarWeek(calendar);

  const availableWeeks = useMemo(
    () => buildCvWeekOptions(selectedYear || calendarYear, calendar),
    [selectedYear, calendarYear, calendar],
  );

  useEffect(() => {
    if (!calendar?.all_months?.length) return;

    if (initializedYear !== calendarYear) {
      setSelectedYear(calendarYear);

      setSelectedWeek(currentWeek);

      setInitializedYear(calendarYear);
    }
  }, [calendar, calendarYear, currentWeek, initializedYear]);

  const pairing = useGetPairingsQuery(
    (submitted
      ? { year: submitted.year, week_no: submitted.week_no }
      : undefined) as any,
    {
      skip: !authorized || !submitted,

      refetchOnMountOrArgChange: true,
    },
  ) as unknown as PairingsResponse;

  const rows = useMemo(() => extractPairingRows(pairing.data), [pairing.data]);

  function search() {
    if (!selectedYear || !availableWeeks.some((w) => w.value === selectedWeek))
      return;

    if (
      submitted?.year === selectedYear &&
      submitted.week_no === selectedWeek
    ) {
      void pairing.refetch();
      return;
    }

    setSubmitted({ year: selectedYear, week_no: selectedWeek });
  }

  if (!mounted || !authorized || dashboardQuery.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f3f6fb] text-[12px] text-[#667085]">
        <Loader2 size={18} className="mr-2 animate-spin" /> Loading Sales
        Calendar...
      </div>
    );
  }

  return (
    <div
      className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-white"
      style={{ fontFamily: "'Lato',Arial,sans-serif" }}
    >
      <DashboardHeader
        distributorId={String((data as any)?.ignite?.ba_id || "N/A")}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Sidebar />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f3f6fb] px-3 pb-10 pt-4 sm:px-4 lg:px-6">
          <div className="mx-auto w-full max-w-[1390px]">
            <section className="relative mb-5 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#142747] via-[#1e3c69] to-[#245ca7] px-5 py-6 text-white shadow-[0_12px_34px_rgba(22,51,95,.17)] sm:px-7 sm:py-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[36px] border-white/5"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-20 bottom-[-100px] h-48 w-48 rounded-full bg-[#70a8ff]/10 blur-2xl"
              />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <button
                    type="button"
                    aria-label="Back to dashboard"
                    onClick={() => router.push("/distributor/dashboard/")}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-blue-100/80">
                      Distributor / Sales Calendar
                    </p>
                    <h1 className="mt-1.5 text-[25px] font-extrabold tracking-tight sm:text-[31px]">
                      Sales Calendar
                    </h1>
                    <p className="mt-2 max-w-[600px] text-[12px] leading-5 text-blue-100/90 sm:text-[13px]">
                      Track sales weeks, commission payout dates and weekly CV
                      performance in one place.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold">
                        <CalendarDays size={13} /> Sales year {calendarYear}
                      </span>
                      {calendar?.current_week?.week_no && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold">
                          <CalendarClock size={13} /> Current week{" "}
                          {calendar.current_week.week_no}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void dashboardQuery.refetch()}
                  disabled={dashboardQuery.isFetching}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-[12px] font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={dashboardQuery.isFetching ? "animate-spin" : ""}
                  />{" "}
                  Refresh calendar
                </button>
              </div>
            </section>

            {dashboardQuery.isError && (
              <div
                role="alert"
                className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] text-red-700"
              >
                <AlertCircle size={15} />
                Unable to retrieve Sales Calendar from the dashboard API.
              </div>
            )}

            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[14px] border border-[#dce6f3] bg-white px-4 py-3 text-[12px] text-[#52647e] shadow-sm">
              <CalendarClock size={17} className="shrink-0 text-[#245cbd]" />
              <span>
                <strong className="text-[#213a60]">How it works:</strong> Choose
                a year and week, or tap a week in the calendar, then select{" "}
                <strong>Search</strong> to view its CV performance.
              </span>
            </div>
            <SalesCalendarPoster
              calendar={calendar}
              selectedWeek={selectedYear === calendarYear ? selectedWeek : -1}
              onSelectWeek={(weekNo) => {
                setSelectedYear(calendarYear);
                setSelectedWeek(weekNo);
                setSubmitted(null);
              }}
            >
              <CvFilters
                calendar={calendar}
                selectedYear={selectedYear || calendarYear}
                selectedWeek={selectedWeek}
                onYearChange={(year) => {
                  setSelectedYear(year);
                  setSelectedWeek(
                    buildCvWeekOptions(year, calendar)[0]?.value ?? 0,
                  );
                  setSubmitted(null);
                }}
                onWeekChange={(week) => {
                  setSelectedWeek(week);
                  setSubmitted(null);
                }}
                onSearch={search}
                isFetching={pairing.isFetching || pairing.isLoading}
                isError={pairing.isError}
                hasSearched={Boolean(submitted)}
                searchedYear={submitted?.year}
                searchedWeek={submitted?.week_no}
              />
            </SalesCalendarPoster>

            {submitted && (
              <section className="mt-4 rounded-[22px] border border-[#e0e8f3] bg-white p-4 shadow-[0_4px_18px_rgba(24,39,75,.03)] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-[14px] font-bold text-[#1E293B]">
                      CV Search Result
                    </h2>
                    <p className="mt-1 text-[11px] text-[#8490A1]">
                      Year {submitted.year} · Week {submitted.week_no}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#E7EAF0] bg-[#f3f6fb] px-2.5 py-1 text-[10px] text-[#657186]">
                    Pairings API
                  </span>
                </div>

                {pairing.isFetching ? (
                  <div className="flex items-center gap-2 py-8 text-[12px] text-[#667085]">
                    <Loader2 className="animate-spin" size={16} /> Loading CV
                    performance...
                  </div>
                ) : pairing.isError ? (
                  <div
                    role="alert"
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] text-red-700"
                  >
                    {getErrorText(pairing.error)}
                  </div>
                ) : rows.length ? (
                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                    {rows.map((row) => (
                      <div
                        key={row.name}
                        className="rounded-[16px] border border-[#e1e9f5] bg-gradient-to-br from-white to-[#f6f9ff] p-3"
                      >
                        <p className="text-[10px] capitalize text-[#7A8597]">
                          {row.name.replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 break-all text-[19px] font-bold text-[#27364A]">
                          {Number.isFinite(Number(row.value))
                            ? Number(row.value).toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })
                            : row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-[12px] text-[#7A8597]">
                    No CV metrics returned for this sales week.
                  </p>
                )}

                {pairing.data != null && (
                  <details className="mt-4 rounded-[11px] border border-[#E8ECF2] bg-[#FAFBFC] p-3">
                    <summary className="cursor-pointer text-[11px] font-semibold text-[#475467]">
                      View complete Pairings API response
                    </summary>
                    <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap break-all text-[10px] text-[#475467]">
                      {JSON.stringify(pairing.data, null, 2)}
                    </pre>
                  </details>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
