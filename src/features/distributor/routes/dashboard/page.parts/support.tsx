"use client";

import type { IgniteDashboard } from "@/lib/redux/api/distributor/userDashboardApi";
import Loding from "@/components/common/Loding";


// --------------------------------------------------
// Shared design primitives
// --------------------------------------------------

export const CARD =
  "min-w-0 rounded-[20px] border border-[#E2E9F3] bg-white shadow-[0_6px_22px_rgba(36,55,90,.04)]";


// --------------------------------------------------
// Font
// --------------------------------------------------

export const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

    .distributor-dashboard, .distributor-dashboard * { box-sizing: border-box; }
    .distributor-dashboard button { -webkit-tap-highlight-color: transparent; }
    .distributor-dashboard ::selection { background: #dadada; color: #101010; }
    .distributor-dashboard .dashboard-number { font-variant-numeric: tabular-nums; }


    @media (prefers-reduced-motion: reduce) {
      .distributor-dashboard *, .distributor-dashboard *::before, .distributor-dashboard *::after {
        scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important;
      }
    }

    .distributor-dashboard { color: #1D2C46; }
    .distributor-dashboard button, .distributor-dashboard select, .distributor-dashboard input { font-family: inherit; }
    .distributor-dashboard button:focus-visible, .distributor-dashboard a:focus-visible, .distributor-dashboard select:focus-visible, .distributor-dashboard input:focus-visible { outline: 2px solid #3972CB; outline-offset: 2px; }
    .distributor-dashboard button:not(:disabled) { cursor: pointer; }
    .distributor-dashboard [id] { scroll-margin-top: 20px; }
    .distributor-dashboard details > summary { list-style-position: inside; }
    .distributor-dashboard .dashboard-number { font-variant-numeric: tabular-nums; }
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

export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}


export function formatNumber(value: number | string | null | undefined): string {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}


export function formatStatus(value?: string | null): string {
  if (!value) return "N/A";

  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}


export function formatCurrency(
  value: number | string | null | undefined,
  currency: "USD" | "INR",
): string {
  const formattedValue = formatNumber(value);

  return currency === "USD" ? `$${formattedValue}` : `₹${formattedValue}`;
}


// --------------------------------------------------
// Section title
// --------------------------------------------------

export function SectionTitle({
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

export function DashboardLoader() {
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


export type LedgerEntry = {
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

export type CommissionBreakdown = {
  cash_count?: number | string | null;
  yellow_count?: number | string | null;
  green_count?: number | string | null;
  blue_count?: number | string | null;
  other_count?: number | string | null;
};


export type ExtendedIgnite = IgniteDashboard & {
  cash_bal_inr?: number | string | null;
  retail_profit_usd?: number | string | null;
  weekly_pairing_usd?: number | string | null;
  unilevel_green_coin?: number | string | null;
  tds_summary?: { gst_in?: string | null } | null;
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

// GSTIN is provided by the dashboard API in ignite.tds_summary.gst_in.
export function getDashboardGstValue(ignite?: IgniteDashboard | null): string {
  if (!ignite) return "—";
  const gst = (ignite as ExtendedIgnite).tds_summary?.gst_in?.trim();
  return gst || "URP";
}


// --------------------------------------------------
// Coin value API fields
// --------------------------------------------------

export type RedeemPointType = "yellow_bal" | "blue_bal";


export type IgniteCoinValues = {
  yellow_value_usd?: number | string | null;
  yellow_value_inr?: number | string | null;
  green_value_usd?: number | string | null;
  green_value_inr?: number | string | null;
  blue_value_usd?: number | string | null;
  blue_value_inr?: number | string | null;
};


// --------------------------------------------------
// Account details table
// --------------------------------------------------

export type BankedTcSide = 1 | 2;


// --------------------------------------------------
// Recent activity
// --------------------------------------------------

export const MAX_VISIBLE_ACTIVITY = 4;

export const ACTIVITY_ITEM_HEIGHT = 70;


// --------------------------------------------------
// CV filters + Sales calendar
// --------------------------------------------------

export type SalesCalendarWeek = {
  year?: number;
  week_no?: number;
  start?: string | null;
  end?: string | null;
  payout_date?: string | null;
  is_current?: boolean;
  is_settled?: boolean;
};


export type SalesCalendarMonth = {
  month_no: number;
  label?: string;
  is_current?: boolean;
  weeks?: SalesCalendarWeek[];
};


export type SalesCalendar = {
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


export type CvSearchFilters = {
  year: number;
  week_no: number;
};


export type PairingsQueryResult = {
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

export function parseCalendarDate(value?: string | null): Date | null {
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


export function formatCalendarDate(value?: string | null): string {
  const date = parseCalendarDate(value);
  if (!date) return value || "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}


export function formatDateObject(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}


export function getCalendarYear(calendar?: SalesCalendar): number {
  const year = Number(calendar?.current_week?.year ?? calendar?.year);
  return Number.isFinite(year) && year > 0 ? year : new Date().getFullYear();
}


export function getCurrentMonth(
  calendar?: SalesCalendar,
): SalesCalendarMonth | undefined {
  return calendar?.all_months?.find(
    (month) => month.is_current || month.weeks?.some((week) => week.is_current),
  );
}


export function getActiveCalendarWeek(
  calendar?: SalesCalendar,
): SalesCalendarWeek | undefined {
  if (calendar?.current_week?.week_no) return calendar.current_week;
  for (const month of calendar?.all_months ?? []) {
    const found = month.weeks?.find((week) => week.is_current);
    if (found) return { ...found, year: found.year ?? calendar?.year };
  }
  return undefined;
}


export function getCurrentCalendarWeek(calendar?: SalesCalendar): number {
  const week = Number(getActiveCalendarWeek(calendar)?.week_no);
  return Number.isFinite(week) && week > 0 ? week : 1;
}


export function formatPosterApiDate(value?: string | null): string {
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


export const POSTER_RANK_BASIS_2026: Record<
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


export function buildCvWeekOptions(
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


export function getCvYearOptions(calendar?: SalesCalendar): number[] {
  const currentYear = getCalendarYear(calendar);
  return Array.from({ length: 6 }, (_, index) => currentYear - index);
}


// --------------------------------------------------
// Pairings metrics
// --------------------------------------------------

export function getPairingsMetrics(response: any): Record<string, any> | null {
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

export type DropdownOption<T extends string | number> = {
  value: T;
  label: string;
  description?: string;
};


export type SearchableDropdownProps<T extends string | number> = {
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
// API-driven financial and network reporting
// --------------------------------------------------

export function DataValue({
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


export const ledgerCategories = [
  "all",
  "cash_bal",
  "yellow_bal",
  "green_bal",
  "blue_bal",
] as const;

export function formatLedgerDate(value?: string | null) {
  if (!value) return "—";
  return value.replace("T", " ").slice(0, 19);
}


// ============================================================================
// INLINE TRACKING CENTER (My Accounts + Sales Calendar + CV Counter API)
// ============================================================================
export type TrackingRecord = Record<string, unknown>;

export const trackObj = (x: unknown): TrackingRecord =>
  x && typeof x === "object" && !Array.isArray(x) ? (x as TrackingRecord) : {};

export const trackList = (x: unknown): TrackingRecord[] =>
  Array.isArray(x) ? x.map(trackObj) : [];

export const trackField = (x: TrackingRecord, ...names: string[]): unknown => {
  for (const key of names)
    if (x[key] !== undefined && x[key] !== null) return x[key];
  return undefined;
};

export const trackFmt = (x: unknown) => {
  if (x == null || x === "") return "—";
  const n = Number(x);
  return Number.isFinite(n)
    ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : String(x);
};

export const trackDate = (x: unknown) => {
  const m = String(x ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "—";
  return `${m[3]} ${new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}`;
};


export type TrackWeek = {
  year: number;
  weekNo: number;
  start: string;
  end: string;
  isCurrent: boolean;
  isSettled: boolean;
};

export type TrackAccount = {
  baId: string;
  baseId: string;
  label: string;
  sequence: number;
  rank: string;
  status: string;
};

export type TrackHistory = {
  id?: number | string;
  category?: string;
  tx_type?: string;
  amount?: number | string;
  date_created?: string;
};


// --------------------------------------------------
// Searchable selectors for TC Slot, Sales Week and Year
// --------------------------------------------------
export type TrackingSearchOption = { value: string; label: string; detail?: string };
