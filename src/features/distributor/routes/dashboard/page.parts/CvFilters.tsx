"use client";

import { CalendarDays, Loader2, Search } from "lucide-react";
import { SalesCalendar, buildCvWeekOptions, formatCalendarDate, getActiveCalendarWeek, getCalendarYear, getCurrentCalendarWeek, getCurrentMonth, getCvYearOptions } from "@/features/distributor/routes/dashboard/page.parts/support";
import { SearchableDropdown } from "@/features/distributor/routes/dashboard/page.parts/SearchableDropdown";


// --------------------------------------------------
// CV filters
// --------------------------------------------------

export function CvFilters({
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
          className="inline-flex h-12 w-full min-w-0 items-center justify-center gap-2 rounded-[12px] bg-[#171717] px-5 text-[13px] font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.10)] transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[13.5px] xl:w-auto xl:min-w-[128px]"
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
