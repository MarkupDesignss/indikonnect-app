"use client";




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

// --------------------------------------------------// Calendar helpers (API is authoritative)// --------------------------------------------------
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


/** The supplied backend timestamps are without an explicit timezone.*

* * For the poster we display their DATE COMPONENTS as-is: this avoids*

* * silently converting a payout date into a different day.*

* * The raw timestamp is kept in the title attribute for precise review.*

* */

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


/** Image's rank-basis rules, retained separately from the API schedule.*

* * Only applied for the supplied 2026 poster. They are not returned by the API.*

* */

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


/** Actual weeks from sales_calendar.all_months have priority over generated options. */

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

  return [];
}


export function getCvYearOptions(calendar?: SalesCalendar): number[] {
  const currentYear = getCalendarYear(calendar);

  return calendar?.all_months?.length ? [currentYear] : [];
}

// --------------------------------------------------// Dropdown types// --------------------------------------------------
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


export type PairingsResponse = {
  data?: unknown;
  isFetching: boolean;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => unknown;
};


export type MetricRow = { name: string; value: string | number };


export function extractPairingRows(value: unknown): MetricRow[] {
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


export function getErrorText(error: unknown) {
  if (!error || typeof error !== "object")
    return "Unable to load CV data. Please try again.";

  const e = error as { data?: { message?: string }; message?: string };

  return (
    e.data?.message || e.message || "Unable to load CV data. Please try again."
  );
}
