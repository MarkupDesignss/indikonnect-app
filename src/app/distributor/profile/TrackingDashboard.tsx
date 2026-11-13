"use client";

import { useEffect, useMemo, useState, useRef } from "react";

import {
  AlertCircle,
  CalendarDays,
  Loader2,
  RefreshCw,
  Timer,
  UserRound,
  Trophy,
  ArrowRight,
  Target,
  ListChecks,
} from "lucide-react";

import { useGetDistributorStatsQuery } from "../../../lib/redux/api/distributor/distributorStatsApi";

import { useGetUserDashboardQuery } from "@/lib/redux/api/distributor/userDashboardApi";

import type {
  DistributorRank,
  DistributorStatsData,
  RankCondition,
  RankProgress,
} from "../../../lib/redux/api/distributor/distributorStatsApi";

import Loding from "@/components/common/Loding";

type Props = { variant?: "cv" | "commission" };

type ConditionEntry = { key: string; condition: RankCondition };

const number = (v: unknown) => {
  const n = Number(v ?? 0);

  return Number.isFinite(n) ? n : 0;
};

const fmt = (v: unknown) =>
  number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const pct = (current: number, required: number) =>
  required > 0 ? Math.max(0, Math.min(100, (current / required) * 100)) : 100;

const title = (text: string) =>
  text.replace(/[_-]/g, " ").replace(/\b\w/g, (a) => a.toUpperCase());

const conditionsOf = (rank?: DistributorRank | null): ConditionEntry[] =>
  Object.entries(rank?.conditions ?? {})

    .filter(
      (entry): entry is [string, RankCondition] =>
        !!entry[1] && typeof entry[1] === "object" && "required" in entry[1],
    )

    .map(([key, condition]) => ({ key, condition }));

const rankName = (no: number | null | undefined, ranks: DistributorRank[]) =>
  no && number(no) > 0
    ? (ranks.find((r) => number(r.rank_no) === number(no))?.name ??
      `Rank ${no}`)
    : "Not ranked";

const nextRankOf = (progress: RankProgress) => {
  const ranks = [...(progress.ranks ?? [])].sort(
    (a, b) => number(a.rank_no) - number(b.rank_no),
  );

  return (
    ranks.find(
      (r) => number(r.rank_no) > number(progress.current?.rank_no) && !r.met,
    ) ??
    ranks.find((r) => !r.met) ??
    null
  );
};

const conditionLabel = (key: string) =>
  (
    ({
      steps: "Steps",

      direct_cv: "Direct CV per annum",

      downlines_one_below: "Downlines (one rank below)",

      downlines_two_below: "Downlines (two ranks below)",

      tenure: "Consecutive months",
    }) as Record<string, string>
  )[key] ?? title(key);

const isDownline = (key: string) => key.startsWith("downlines_");

function ProgressBar({
  value,

  className = "",
}: {
  value: number;

  className?: string;
}) {
  return (
    <div
      className={`h-[10px] w-full overflow-hidden rounded-full bg-[#E8EEF7] ${className}`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#3269C5] to-[#59A4F7] transition-[width] duration-500"

        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function SmallMetric({
  label,

  value,

  sub,
}: {
  label: string;

  value: string;

  sub?: string;
}) {
  return (
    <div className="min-w-0 rounded-[15px] border border-[#E1E9F4] bg-[#F7FAFF] p-4">
      <p className="text-[11px] font-bold uppercase leading-4 text-[#65758D]">
        {label}
      </p>

      <p className="mt-1 break-words text-[14px] font-bold text-[#172B4D]">
        {value}
      </p>

     
    </div>
  );
}

function AccountCard({
  data,

  progress,
}: {
  data: DistributorStatsData;

  progress: RankProgress;
}) {
  const currentName = rankName(progress.current?.rank_no, progress.ranks ?? []);

  const payRankName = nextRankOf(progress)?.name ?? currentName;

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#DCE7F7] bg-gradient-to-br from-[#FFFFFF] via-[#FFFFFF] to-[#F1F6FF] p-5 shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#3269C5]">
          <UserRound size={20} />
        </div>

        <div className="min-w-0">
          <p className="break-all text-[14px] font-bold text-[#172B4D]">
            {data.distributor_id || "Distributor"}
          </p>

          <p className="mt-0.5 break-words text-[13px] text-[#65758D]">
            {data.full_name || "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SmallMetric
          label="Title Rank"
          value={currentName}
        />

        <SmallMetric label="pay rank" value="Silver" />

        {/* <SmallMetric
          label="Account type"
          value={data.account_type ? title(data.account_type) : "—"}
        />
        <SmallMetric label="Total CV" value={`${fmt(data.total_cv)} CV`} /> */}
      </div>
    </section>
  );
}

function NextProgressCard({ progress }: { progress: RankProgress }) {
  const next = nextRankOf(progress);
  const entries = conditionsOf(next);
  const completed = entries.filter(({ condition }) => condition.met).length;
  const progressPercent = entries.length
    ? Math.round((completed / entries.length) * 100)
    : 0;
  const steps = next?.conditions?.steps;

  return (
    <section className="flex min-h-[282px] flex-col rounded-[22px] border border-[#E1E9F4] bg-white p-5 shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)] sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#3269C5]">
          <Trophy size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="break-words text-[22px] font-extrabold leading-tight text-[#172B4D]">
            {next?.name ?? "All ranks achieved"}
          </h2>
        </div>
      </div>

      {next ? (
        <>
          <div className="mt-7">
            <p className="text-[12px] font-semibold text-[#66758D]">
              Requirements met
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <ProgressBar value={progressPercent} />
              </div>
              <span className="min-w-[46px] shrink-0 text-right text-[17px] font-extrabold tabular-nums text-[#3269C5]">
                {completed}/{entries.length}
              </span>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#65758D]">
              Steps to complete
            </p>
            {steps ? (
              <span
                className={`inline-flex items-center rounded-lg px-3 py-2 text-[12px] font-bold ${steps.met ? "bg-[#E5F8EF] text-[#18875B]" : "bg-[#FFF1DF] text-[#A76513]"}`}
              >
                {fmt(steps.current)} of {fmt(steps.required)} steps
              </span>
            ) : (
              <span className="text-[12px] text-[#65758D]">
                No steps requirement provided
              </span>
            )}
          </div>
        </>
      ) : (
        <p className="mt-6 rounded-xl bg-[#EAF7F0] p-4 text-[13px] font-semibold text-[#168255]">
          All available ranks have been achieved.
        </p>
      )}
    </section>
  );
}

// Sales calendar is authoritative. Bare timestamps are interpreted in Asia/Kolkata;
// explicitly offset timestamps preserve their timezone. No browser-local date parsing.
type SalesCalendarWeek = {
  year?: number;

  week_no?: number;

  start?: string | null;

  end?: string | null;

  is_current?: boolean;
};

type SalesCalendarMonth = {
  month_no: number;

  label?: string;

  is_current?: boolean;

  start?: string | null;

  end?: string | null;

  weeks?: SalesCalendarWeek[];
};

type SalesCalendar = {
  year?: number;

  current_month?: {
    year?: number;

    month_no?: number;

    label?: string;

    start?: string | null;

    end?: string | null;
  };

  all_months?: SalesCalendarMonth[];

  current_week?: SalesCalendarWeek;
};

// Use the sales-calendar week supplied by the backend, including custom sales weeks.
// Do not substitute ISO week numbers: sales periods may cross calendar boundaries.
function getCurrentSalesWeek(
  calendar: SalesCalendar | undefined,
  now: number | null,
): SalesCalendarWeek | null {
  if (!calendar) return null;

  if (
    calendar.current_week &&
    (calendar.current_week.week_no != null || calendar.current_week.start)
  ) {
    return calendar.current_week;
  }

  const allWeeks = (calendar.all_months ?? []).flatMap(
    (month) => month.weeks ?? [],
  );
  const flagged = allWeeks.find((week) => week.is_current);
  if (flagged) return flagged;

  if (now != null) {
    const matching = allWeeks.find((week) => {
      const start = parseSalesInstant(week.start);
      const end = parseSalesInstant(week.end, true);
      return start !== null && end !== null && now >= start && now <= end;
    });
    if (matching) return matching;
  }

  return null;
}

type SalesMonthPeriod = {
  start: number;

  endExclusive: number;

  label: string;

  startLabel: string;

  endLabel: string;

  endHasExplicitTime: boolean;
};

const IST_OFFSET_MS = 330 * 60 * 1000;

// Offset-aware, validates invalid dates/times and accepts API SQL/ISO formats.
function parseSalesInstant(
  value: string | null | undefined,

  endOfDay = false,
): number | null {
  if (typeof value !== "string" || !value.trim()) return null;

  const match = value

    .trim()

    .match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?)?(?:\s*(Z|[+-]\d{2}:?\d{2}))?$/i,
    );

  if (!match) return null;

  const year = Number(match[1]);

  const month = Number(match[2]);

  const day = Number(match[3]);

  const timed = match[4] !== undefined;

  const h = timed ? Number(match[4]) : endOfDay ? 23 : 0;

  const m = timed ? Number(match[5]) : endOfDay ? 59 : 0;

  const sec = timed ? Number(match[6] ?? 0) : endOfDay ? 59 : 0;

  const ms = timed
    ? Number((match[7] ?? "0").slice(0, 3).padEnd(3, "0"))
    : endOfDay
      ? 999
      : 0;

  const checked = new Date(Date.UTC(year, month - 1, day));

  if (
    checked.getUTCFullYear() !== year ||
    checked.getUTCMonth() !== month - 1 ||
    checked.getUTCDate() !== day ||
    h > 23 ||
    m > 59 ||
    sec > 59
  )
    return null;

  let offset = IST_OFFSET_MS;

  const zone = match[8];

  if (zone) {
    if (zone.toUpperCase() === "Z") offset = 0;
    else {
      const raw = zone.replace(":", "");

      const zh = Number(raw.slice(1, 3));

      const zm = Number(raw.slice(3, 5));

      if (zh > 23 || zm > 59) return null;

      offset = (raw.startsWith("+") ? 1 : -1) * (zh * 60 + zm) * 60_000;
    }
  }

  return Date.UTC(year, month - 1, day, h, m, sec, ms) - offset;
}

function hasSalesTime(value: string | null | undefined): boolean {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(value.trim())
  );
}

const salesDateFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",

  day: "2-digit",

  month: "short",

  year: "numeric",
});

const salesDateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",

  day: "2-digit",

  month: "short",

  year: "numeric",

  hour: "2-digit",

  minute: "2-digit",

  second: "2-digit",

  hour12: true,
});

function salesMonthFromDates(
  startDate: string | null | undefined,

  endDate: string | null | undefined,

  label?: string,
): SalesMonthPeriod | null {
  const start = parseSalesInstant(startDate);

  const end = parseSalesInstant(endDate, true);

  if (start === null || end === null || end < start) return null;

  const periodLabel =
    label?.trim() ||
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",

      month: "long",

      year: "numeric",
    }).format(new Date(start));

  return {
    start,

    endExclusive: end + 1,

    label: periodLabel,

    startLabel: salesDateTimeFormatter.format(new Date(start)),

    endLabel: salesDateTimeFormatter.format(new Date(end)),

    endHasExplicitTime: hasSalesTime(endDate),
  };
}

// Match the exact current period first, then honor current_month from backend,
// then derive boundaries using all_months weeks, including cross-calendar months.
function getSalesMonthPeriod(
  calendar: SalesCalendar | undefined,

  now: number,
): SalesMonthPeriod | null {
  if (!calendar) return null;

  const current = calendar.current_month;

  const preferred = salesMonthFromDates(
    current?.start,

    current?.end,

    current?.label,
  );

  const periods = (calendar.all_months ?? [])

    .map((month) => {
      const validWeeks = (month.weeks ?? []).filter(
        (w) =>
          parseSalesInstant(w.start) !== null &&
          parseSalesInstant(w.end, true) !== null,
      );

      const starts = validWeeks

        .map((w) => w.start!)

        .sort(
          (a, b) => (parseSalesInstant(a) ?? 0) - (parseSalesInstant(b) ?? 0),
        );

      const ends = validWeeks

        .map((w) => w.end!)

        .sort(
          (a, b) =>
            (parseSalesInstant(a, true) ?? 0) -
            (parseSalesInstant(b, true) ?? 0),
        );

      return {
        month,

        period: salesMonthFromDates(
          month.start ?? starts[0],

          month.end ?? ends[ends.length - 1],

          month.label,
        ),
      };
    })

    .filter(
      (item): item is { month: SalesCalendarMonth; period: SalesMonthPeriod } =>
        item.period !== null,
    );

  // Explicit current_month fields are the source of truth if they cover now.
  if (preferred && now >= preferred.start && now < preferred.endExclusive)
    return preferred;

  const covering = periods.find(
    (p) => now >= p.period.start && now < p.period.endExclusive,
  );

  if (covering) return covering.period;

  // If API's active month is provided, keep it instead of silently switching
  // to some unrelated calendar month merely because no range covers now.
  if (preferred) return preferred;

  const flagged = periods.find(
    (p) => p.month.is_current || p.month.weeks?.some((w) => w.is_current),
  );

  if (flagged) return flagged.period;

  return (
    periods

      .map((p) => p.period)

      .filter((p) => p.start > now)

      .sort((a, b) => a.start - b.start)[0] ??
    periods.sort((a, b) => b.period.endExclusive - a.period.endExclusive)[0]
      ?.period ??
    null
  );
}

// Optional server clock supplied in a dashboard API response. If absent, device
// time remains the fallback; a server timestamp/header is needed to eliminate
// intentionally misconfigured client clocks completely.
function readServerNow(response: unknown): number | null {
  const root = response as any;

  const candidates = [
    root?.server_now,

    root?.server_time,

    root?.current_time,

    root?.data?.server_now,

    root?.data?.server_time,

    root?.data?.current_time,

    root?.data?.sales_calendar?.server_now,

    root?.data?.sales_calendar?.server_time,
  ];

  for (const value of candidates) {
    if (typeof value === "string") {
      const parsed = parseSalesInstant(value);

      if (parsed !== null) return parsed;
    }

    // Unix timestamp fields, only when explicitly present in the API.
    if (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value > 1_000_000_000
    ) {
      return value < 100_000_000_000 ? value * 1000 : value;
    }
  }

  return null;
}

function useSalesMonthCountdown(
  calendar?: SalesCalendar,

  serverNow?: number | null,
) {
  const [now, setNow] = useState<number | null>(null);

  const serverAnchor = useRef<{ serverMs: number; perfMs: number } | null>(
    null,
  );

  useEffect(() => {
    if (serverNow !== null && serverNow !== undefined) {
      serverAnchor.current = { serverMs: serverNow, perfMs: performance.now() };
    } else {
      serverAnchor.current = null;
    }
  }, [serverNow]);

  useEffect(() => {
    const update = () => {
      const anchor = serverAnchor.current;

      setNow(
        anchor
          ? anchor.serverMs + performance.now() - anchor.perfMs
          : Date.now(),
      );
    };

    update();

    const interval = window.setInterval(update, 1000);

    const onFocus = () => {
      if (!document.hidden) update();
    };

    window.addEventListener("focus", update);

    document.addEventListener("visibilitychange", onFocus);

    return () => {
      clearInterval(interval);

      window.removeEventListener("focus", update);

      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [serverNow]);

  const period = useMemo(
    () => (now === null ? null : getSalesMonthPeriod(calendar, now)),

    [calendar, now],
  );

  if (now === null || !period) return null;

  const upcoming = now < period.start;

  const ended = now >= period.endExclusive;

  const remainingMs = upcoming
    ? period.start - now
    : Math.max(0, period.endExclusive - now);

  const remainingSeconds = Math.ceil(remainingMs / 1000);

  const elapsed = upcoming
    ? 0
    : ended
      ? 100
      : pct(now - period.start, period.endExclusive - period.start);

  return {
    ...period,

    now,

    upcoming,

    ended,

    elapsed,

    days: Math.floor(remainingSeconds / 86400),

    hours: Math.floor(remainingSeconds / 3600) % 24,

    minutes: Math.floor(remainingSeconds / 60) % 60,

    seconds: remainingSeconds % 60,
  };
}

function CalendarCard({
  calendar,

  loading,

  serverNow,
}: {
  calendar?: SalesCalendar;

  loading: boolean;

  serverNow?: number | null;
}) {
  const clock = useSalesMonthCountdown(calendar, serverNow);
  const currentSalesWeek = getCurrentSalesWeek(
    calendar,
    clock?.now ?? serverNow ?? null,
  );
  const weekStart = currentSalesWeek?.start
    ? parseSalesInstant(currentSalesWeek.start)
    : null;
  const weekEnd = currentSalesWeek?.end
    ? parseSalesInstant(currentSalesWeek.end, true)
    : null;

  return (
    <section className="flex min-h-[282px] flex-col rounded-[22px] border border-[#E1E9F4] bg-white p-5 shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)] sm:p-6">
      <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#172B4D]">
        <Timer size={19} className="text-[#3269C5]" />
        Sales period countdown
      </h2>

      <p className="mt-2 text-[12px] leading-5 text-[#65758D]">
        {clock
          ? `${clock.label} · ${salesDateFormatter.format(new Date(clock.start))} – ${salesDateFormatter.format(new Date(clock.endExclusive - 1))}`
          : loading
            ? "Loading the sales calendar…"
            : "Sales month dates are unavailable from the API."}
      </p>

      {currentSalesWeek && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#DAE6F8] bg-[#F4F8FF] px-3 py-2.5">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-[#285DB3]">
            <CalendarDays size={15} />
            {currentSalesWeek.week_no != null
              ? `Sales Week ${currentSalesWeek.week_no}`
              : "Current sales week"}
          </span>
          {weekStart !== null && weekEnd !== null && (
            <span className="text-[11px] font-medium text-[#65758D]">
              {salesDateFormatter.format(new Date(weekStart))} –{" "}
              {salesDateFormatter.format(new Date(weekEnd))}
            </span>
          )}
        </div>
      )}

      {clock && (
        <div className="mt-2 space-y-0.5 text-[10px] leading-4 text-[#65758D]">
          <p>
            <strong>Starts:</strong> {clock.startLabel} IST
          </p>

          <p>
            <strong>Ends:</strong> {clock.endLabel} IST
          </p>
        </div>
      )}

      <div className="mt-5 grid grid-cols-4 gap-2">
        {(["Days", "Hours", "Minutes", "Seconds"] as const).map((unit, i) => {
          const values = clock
            ? [clock.days, clock.hours, clock.minutes, clock.seconds]
            : [];

          return (
            <div
              key={unit}

              className="rounded-[13px] border border-[#E1E9F4] bg-[#F7FAFF] px-1 py-3 text-center"
            >
              <p className="text-[clamp(18px,2.1vw,29px)] font-bold leading-tight tabular-nums text-[#172B4D]">
                {clock ? String(values[i]).padStart(2, "0") : "--"}
              </p>

              <p className="mt-1 text-[10px] text-[#65758D]">{unit}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <div className="mb-2 flex justify-between text-[12px] text-[#65758D]">
          <span>
            {clock?.upcoming
              ? "Starts in"
              : clock?.ended
                ? "Sales period completed"
                : "Sales month elapsed"}
          </span>

          <span>{clock ? `${Math.round(clock.elapsed)}%` : "—"}</span>
        </div>

        <ProgressBar value={clock?.elapsed ?? 0} />

        <p className="mt-2 text-[10px] leading-4 text-[#8b93a3]">
          {clock?.upcoming
            ? "Countdown until the next sales period (IST)."
            : clock?.ended
              ? "This sales period has ended. Awaiting the next API calendar period."
              : clock
                ? `Countdown ends at ${clock.endLabel} IST.`
                : "Waiting for valid sales calendar start and end dates from the dashboard API."}
        </p>
      </div>
    </section>
  );
}

function RankTable({ progress }: { progress: RankProgress }) {
  const ranks = [...(progress.ranks ?? [])].sort(
    (a, b) => number(a.rank_no) - number(b.rank_no),
  );
  const next = nextRankOf(progress);

  const baseCriteria: { key: string; label: string }[] = [
    { key: "qualification", label: "Previous rank" },
    { key: "steps", label: "Steps" },
    { key: "direct_cv", label: "Direct CV per annum" },
    { key: "downlines_one_below", label: "Downlines · one rank below" },
    { key: "downlines_two_below", label: "Downlines · two ranks below" },
    { key: "tenure", label: "Consecutive months" },
  ];

  // Keep any additional API-supplied rank requirements visible.
  const knownKeys = new Set(baseCriteria.map((item) => item.key));
  const extraKeys = Array.from(
    new Set(ranks.flatMap((rank) => Object.keys(rank.conditions ?? {}))),
  ).filter((key) => !knownKeys.has(key));
  const criteria = [
    ...baseCriteria,
    ...extraKeys.map((key) => ({ key, label: conditionLabel(key) })),
  ];

  const requirement = (
    rank: DistributorRank,
    index: number,
    key: string,
  ): string => {
    if (key === "qualification") {
      return index === 0
        ? "Qualified distributor status"
        : `Must have achieved ${ranks[index - 1].name}`;
    }

    const condition = (
      rank.conditions as Record<string, RankCondition | undefined> | undefined
    )?.[key];
    if (!condition) return "—";

    const required = number(condition.required);
    if (key === "steps")
      return required === 0 ? "No steps required" : `${fmt(required)} steps`;
    if (key === "direct_cv")
      return required === 0 ? "Not required" : `${fmt(required)} Direct CV`;
    if (key === "tenure")
      return required === 0
        ? "Not required"
        : `${fmt(required)} consecutive month${required === 1 ? "" : "s"}`;
    if (isDownline(key)) {
      if (required === 0) return "Not required";
      const downlineRank = condition.rank_no
        ? `${rankName(condition.rank_no, ranks)} or above`
        : "the required rank";
      return `${fmt(required)} downline${required === 1 ? "" : "s"} at ${downlineRank}`;
    }
    return `${fmt(required)} required`;
  };

  return (
    <section className="overflow-hidden rounded-[22px] border border-[#DCE6F4] bg-white shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9EFF7] px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-[17px] font-extrabold text-[#172B4D]">
            Rank requirements comparison
          </h2>
          <p className="mt-1 text-[12px] text-[#65758D]">
            Compare each rank side by side. Values are taken from your rank API.
          </p>
        </div>
        <span className="rounded-full border border-[#DFE8F5] bg-[#F5F8FD] px-3 py-1.5 text-[11px] font-semibold text-[#65758D]">
          {ranks.length} ranks
        </span>
      </div>

      {ranks.length ? (
        <>
          <div className="flex items-center gap-1.5 px-5 py-2.5 text-[11px] text-[#70809A] sm:px-6 lg:hidden">
            <ArrowRight size={13} /> Swipe horizontally to compare ranks
          </div>
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-max min-w-full border-collapse text-left text-[12px]">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-20 w-[205px] min-w-[205px] border-r border-[#2D5CA9] bg-[#17458E] px-4 py-5 text-[13px] font-extrabold text-white shadow-[4px_0_8px_rgba(22,48,95,.05)] sm:w-[228px] sm:min-w-[228px]"
                  >
                    Requirements
                  </th>
                  {ranks.map((rank) => {
                    const isCurrent =
                      number(rank.rank_no) ===
                      number(progress.current?.rank_no);
                    const isNext = next?.rank_no === rank.rank_no;
                    return (
                      <th
                        key={rank.rank_no}
                        scope="col"
                        className="w-[175px] min-w-[175px] border-r border-[#F2D278] bg-[#FFD34F] px-4 py-4 align-top text-[#24344C] last:border-r-0 sm:w-[195px] sm:min-w-[195px]"
                      >
                        <div className="flex flex-col items-start gap-2">
                          <span className="text-[13px] font-black uppercase leading-5 tracking-[.02em]">
                            {rank.name}
                          </span>
                          {isCurrent ? (
                            <span className="rounded-full bg-[#17458E] px-2 py-0.5 text-[10px] font-bold text-white">
                              Current
                            </span>
                          ) : isNext ? (
                            <span className="rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-[#17458E]">
                              Next rank
                            </span>
                          ) : null}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {criteria.map(({ key, label }, rowIndex) => (
                  <tr
                    key={key}
                    className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#F8FAFE]"}
                  >
                    <th
                      scope="row"
                      className="sticky left-0 z-10 w-[205px] min-w-[205px] border-b border-r border-[#E4ECF5] bg-inherit px-4 py-5 align-top text-[12px] font-bold leading-5 text-[#18365F] shadow-[4px_0_8px_rgba(22,48,95,.04)] sm:w-[228px] sm:min-w-[228px]"
                    >
                      {label}
                    </th>
                    {ranks.map((rank, rankIndex) => {
                      const value = requirement(rank, rankIndex, key);
                      return (
                        <td
                          key={`${rank.rank_no}-${key}`}
                          className="w-[175px] min-w-[175px] border-b border-r border-[#E9EFF7] px-4 py-5 align-top text-[12px] leading-[1.65] text-[#33435F] last:border-r-0 sm:w-[195px] sm:min-w-[195px]"
                        >
                          {value === "—" ? (
                            <span className="text-[#A3AEC0]">—</span>
                          ) : (
                            <span className="flex items-start gap-2">
                              <span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#376FC3]" />
                              <span>{value}</span>
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="px-6 py-7 text-[13px] text-[#65758D]">
          No rank definitions are available from the API.
        </p>
      )}
    </section>
  );
}

export default function TrackingDashboard({ variant = "cv" }: Props) {
  const {
    data: response,

    isLoading,

    isFetching,

    isError,

    refetch,
  } = useGetDistributorStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Fetch the sales calendar independently; the rank-stats API has no month boundaries.
  const salesDashboardQuery = useGetUserDashboardQuery(undefined, {
    refetchOnMountOrArgChange: true,

    refetchOnFocus: true,

    refetchOnReconnect: true,

    pollingInterval: 60_000,
  });

  const dashboardPayload = salesDashboardQuery.data as any;

  const salesCalendar: SalesCalendar | undefined =
    dashboardPayload?.data?.sales_calendar ?? dashboardPayload?.sales_calendar;

  const salesServerNow = useMemo(
    () => readServerNow(dashboardPayload),

    [dashboardPayload],
  );

  const data = response?.data;

  const progress = data?.rank_progress;

  const nowLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        month: "long",

        year: "numeric",

        timeZone: "Asia/Kolkata",
      }).format(new Date()),

    [],
  );

  if (isLoading)
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E1E9F4] bg-white">
        <Loding />
      </div>
    );

  if (isError || response?.success === false || !data || !progress)
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#E1E9F4] bg-white p-6 text-center">
        <AlertCircle size={32} className="text-[#c94a47]" />

        <h2 className="mt-3 text-[17px] font-bold text-[#172B4D]">
          Unable to load rank dashboard
        </h2>

        <p className="mt-1 text-[13px] leading-5 text-[#65758D]">
          Please check your connection and try again.
        </p>

        <button
          onClick={() => void refetch()}

          className="mt-4 rounded-lg bg-[#3269C5] px-4 py-2 text-[12px] font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );

  const nextRank = nextRankOf(progress);

  const nextConditions = conditionsOf(nextRank);

  const doneCount = nextConditions.filter(
    (entry) => entry.condition.met,
  ).length;

  const pendingCount = nextConditions.length - doneCount;

  const completion = nextConditions.length
    ? Math.round((doneCount / nextConditions.length) * 100)
    : 0;

  return (
    <main className="w-full min-w-0 bg-[#F5F8FE] p-3 font-sans text-[#172B4D] sm:p-5 lg:p-7">
      <div className="mx-auto max-w-[1550px] space-y-6">
        <header className="relative isolate overflow-hidden rounded-[26px] bg-gradient-to-br from-[#152A4B] via-[#244C86] to-[#3269C5] px-5 py-7 text-white shadow-[0_18px_42px_-22px_rgba(21,42,75,.7)] sm:px-8 sm:py-9 lg:px-10">
          <div
            aria-hidden="true"

            className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[52px] border-white/[.055]"
          />

          <div
            aria-hidden="true"

            className="pointer-events-none absolute bottom-[-90px] left-[45%] h-52 w-52 rounded-full bg-[#7AA8F6]/10 blur-3xl"
          />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[740px] min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-[.06em] text-blue-100">
                <Trophy size={14} /> DISTRIBUTOR GROWTH
              </span>

              <h1 className="mt-4 text-[27px] font-extrabold tracking-[-.045em] sm:text-[35px]">
                Your rank & growth
              </h1>

              <p className="mt-2 max-w-[600px] text-[13px] leading-6 text-[#DCE9FF] sm:text-[14px]">
                See where you stand, what's left for your next rank, and exactly
                which requirements need attention.
                {variant === "commission"
                  ? " Your eligible rank may also affect commission qualification."
                  : ""}
              </p>

              <div className="mt-5 inline-flex flex-wrap items-center gap-2 text-[12px] text-blue-100">
                <CalendarDays size={16} /> {nowLabel}{" "}
                <span className="opacity-50">•</span>{" "}
                <span>Live API rank data</span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 rounded-[19px] border border-white/20 bg-white/10 p-4 backdrop-blur-sm sm:w-auto sm:min-w-[270px] sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-blue-100">
                Your next milestone
              </span>

              <span className="break-words text-[22px] font-extrabold text-white">
                {nextRank?.name || "All available ranks met"}
              </span>

              {nextRank ? (
                <>
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-[12px] text-blue-100">
                      Requirements complete
                    </span>

                    <span className="text-[18px] font-extrabold">
                      {completion}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-[#8CDAFF] transition-[width] duration-500"

                      style={{ width: `${completion}%` }}
                    />
                  </div>

                  <span className="text-[12px] text-blue-100">
                    {pendingCount} remaining • {doneCount} completed
                  </span>
                </>
              ) : (
                <span className="text-[12px] text-blue-100">
                  You're up to date with the rank definitions returned by the
                  API.
                </span>
              )}

              <button
                type="button"

                onClick={() =>
                  document

                    .getElementById("rank-requirements")

                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }

                className="mt-1 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-white px-4 text-[12px] font-bold text-[#24519B] transition hover:bg-[#EAF2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                View rank requirements <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[19px] font-extrabold tracking-[-.025em] text-[#172B4D] sm:text-[21px]">
              Your progress at a glance
            </h2>

            <p className="mt-1 text-[13px] text-[#65758D]">
              Your current rank, next goal and sales period in one place.
            </p>
          </div>

          <button
            type="button"

            disabled={isFetching}

            onClick={() => void refetch()}

            className="inline-flex min-h-[43px] items-center gap-2 rounded-xl border border-[#D8E5F8] bg-white px-4 text-[12px] font-bold text-[#3269C5] shadow-sm transition hover:bg-[#EDF4FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3269C5] disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />{" "}
            {isFetching ? "Refreshing..." : "Refresh progress"}
          </button>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
          <AccountCard data={data} progress={progress} />

          <NextProgressCard progress={progress} />

          <CalendarCard
            calendar={salesCalendar}

            loading={
              salesDashboardQuery.isLoading || salesDashboardQuery.isFetching
            }

            serverNow={salesServerNow}
          />
        </div>

        <section id="rank-requirements" className="scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-[#172B4D] sm:text-[21px]">
                <ListChecks size={21} className="text-[#3269C5]" /> Rank
                requirements
              </h2>
              <p className="mt-1 text-[13px] text-[#65758D]">
                All rank criteria at a glance, just like a comparison chart.
              </p>
            </div>
            {nextRank?.conditions?.steps && (
              <div className="inline-flex items-center gap-3 rounded-xl border border-[#DCE7F7] bg-white px-4 py-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF4FF] text-[#3269C5]">
                  <Target size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#65758D]">
                    Steps for {nextRank.name}
                  </p>
                  <p className="mt-0.5 text-[15px] font-extrabold tabular-nums text-[#172B4D]">
                    {fmt(nextRank.conditions.steps.current)} /{" "}
                    {fmt(nextRank.conditions.steps.required)}
                  </p>
                </div>
              </div>
            )}
          </div>
          <RankTable progress={progress} />
        </section>

        {isFetching && (
          <p
            role="status"

            className="flex items-center justify-end gap-2 text-[12px] text-[#65758D]"
          >
            <Loader2 size={14} className="animate-spin" /> Refreshing
            distributor stats…
          </p>
        )}
      </div>
    </main>
  );
}