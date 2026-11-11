"use client";

import { useEffect, useMemo, useState, useRef } from "react";

import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Info,
  Loader2,
  RefreshCw,
  Timer,
  TrendingUp,
  UserRound,
  Trophy,
  ArrowRight,
  Target,
  ListChecks,
  ShieldCheck,
  Sparkles,
  ChevronRight,
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

function conditionDetail(
  key: string,

  condition: RankCondition,

  ranks: DistributorRank[],
) {
  const requirement = fmt(condition.required);

  if (isDownline(key))
    return `${requirement} downline${number(condition.required) === 1 ? "" : "s"} with ${rankName(condition.rank_no, ranks)} rank or above`;

  if (key === "tenure")
    return `${requirement} consecutive month${number(condition.required) === 1 ? "" : "s"}`;

  if (key === "direct_cv") return `${requirement} Direct CV required`;

  if (key === "steps") return `${requirement} steps required`;

  return `${requirement} required`;
}

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

function Chip({ met, text }: { met: boolean; text?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${met ? "bg-[#e3f7eb] text-[#13804e]" : "bg-[#fff3df] text-[#bf790c]"}`}
    >
      {met ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}

      {text ?? (met ? "Completed" : "In progress")}
    </span>
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

      {sub && <p className="mt-0.5 text-[12px] text-[#65758D]">{sub}</p>}
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
          label="Your current rank"

          value={currentName}

          sub="Your achieved title"
        />

        <SmallMetric
          label="pay rank"

          value={payRankName}

          sub="Next rank"
        />

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

  const pending = entries.filter(({ condition }) => !condition.met);

  const progressPercent = entries.length
    ? Math.round((completed / entries.length) * 100)
    : 0;

  return (
    <section className="flex min-h-[282px] flex-col rounded-[22px] border border-[#E1E9F4] bg-white p-5 shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#172B4D]">
          <TrendingUp size={19} className="text-[#3269C5]" />
          Next rank progress
        </h2>

        {next && (
          <span className="rounded-full bg-[#faebdb] px-3 py-1 text-[11px] font-semibold text-[#977044]">
            {next.name}
          </span>
        )}
      </div>

      {next ? (
        <>
          <div className="mt-6">
            <p className="text-[13px] font-semibold text-[#667085]">
              Requirements met
            </p>

            <div className="mt-1 flex items-end justify-between gap-3">
              <span className="text-[32px] font-bold leading-none text-[#172B4D]">
                {completed} / {entries.length}
              </span>

              <span className="text-[19px] font-bold text-[#3269C5]">
                {progressPercent}%
              </span>
            </div>

            <ProgressBar value={progressPercent} className="mt-3" />
          </div>

          <div className="mt-auto pt-7">
            <p className="mb-2 text-[11px] font-bold uppercase text-[#65758D]">
              Still to complete
            </p>

            <div className="flex flex-wrap gap-2">
              {pending.length ? (
                pending.map(({ key, condition }) => (
                  <span
                    key={key}

                    className="rounded-lg bg-[#fff2e1] px-2.5 py-1.5 text-[11px] font-semibold text-[#ac6a16]"
                  >
                    {conditionLabel(key)} {fmt(condition.current)} of{" "}
                    {fmt(condition.required)}
                  </span>
                ))
              ) : (
                <Chip met text="All requirements met" />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-xl bg-[#edf9f1] p-4 text-[13px] font-semibold text-[#188153]">
          All available ranks have been achieved.
        </div>
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

function RequirementsCard({ progress }: { progress: RankProgress }) {
  const next = nextRankOf(progress);

  if (!next)
    return (
      <section className="rounded-[22px] border border-[#E1E9F4] bg-white p-6 shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)]">
        <h2 className="text-[18px] font-bold">Rank requirements</h2>

        <p className="mt-3 text-[13px] text-[#168255]">
          All available ranks achieved.
        </p>
      </section>
    );

  const entries = conditionsOf(next);

  const completed = entries.filter(({ condition }) => condition.met).length;

  const parentRank = [...(progress.ranks ?? [])]

    .filter((r) => number(r.rank_no) < number(next.rank_no))

    .sort((a, b) => number(b.rank_no) - number(a.rank_no))[0];

  return (
    <section className="rounded-[22px] border border-[#E1E9F4] bg-white p-5 shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EAF0F7] pb-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#172B4D]">
            {next.name} requirements
          </h2>

          <p className="mt-1 text-[13px] leading-5 text-[#65758D]">
            Your next rank after{" "}
            {rankName(progress.current?.rank_no, progress.ranks ?? [])}
          </p>
        </div>

        <span className="text-[13px] leading-5 text-[#65758D]">
          {completed} of {entries.length} met
        </span>
      </div>

      {parentRank && (
        <div className="flex items-center justify-between gap-4 border-b border-[#EAF0F7] py-4">
          <div>
            <p className="text-[13px] font-semibold text-[#172B4D]">
              Must have achieved the {parentRank.name} rank
            </p>

            <p className="mt-1 text-[13px] leading-5 text-[#65758D]">
              {parentRank.met
                ? `${parentRank.name} achieved`
                : `${parentRank.name} not yet achieved`}
            </p>
          </div>

          <Chip met={!!parentRank.met} />
        </div>
      )}

      {entries.length ? (
        entries.map(({ key, condition }) => (
          <div
            key={key}

            className="border-b border-[#EAF0F7] py-4 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold text-[#172B4D]">
                  {conditionLabel(key)}
                </h3>

                <p className="mt-1 text-[13px] leading-5 text-[#65758D]">
                  {key === "direct_cv" && number(condition.required) === 0
                    ? "No direct CV required"
                    : `${fmt(condition.current)} of ${fmt(condition.required)} completed`}

                  {isDownline(key) && condition.rank_no
                    ? ` · ${rankName(condition.rank_no, progress.ranks ?? [])} rank`
                    : ""}
                </p>
              </div>

              <Chip met={!!condition.met} />
            </div>

            {number(condition.required) > 0 && (
              <ProgressBar
                className="mt-3"

                value={pct(
                  number(condition.current),

                  number(condition.required),
                )}
              />
            )}
          </div>
        ))
      ) : (
        <p className="py-5 text-[13px] text-[#65758D]">
          The API has not provided conditions for this rank.
        </p>
      )}
    </section>
  );
}

function ActionCard({ progress }: { progress: RankProgress }) {
  const next = nextRankOf(progress);

  if (!next)
    return (
      <section className="rounded-[22px] border border-[#E1E9F4] bg-white p-6 shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)]">
        <h2 className="text-[18px] font-bold">What to do next</h2>

        <p className="mt-3 text-[13px] text-[#168255]">
          You have met the available rank requirements.
        </p>
      </section>
    );

  const entries = conditionsOf(next);

  const pending = entries.filter(({ condition }) => !condition.met);

  const met = entries.filter(({ condition }) => condition.met);

  const focus = pending[0];

  return (
    <section className="rounded-[22px] border border-[#E1E9F4] bg-white p-5 shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)] sm:p-6">
      <h2 className="flex items-center gap-2 text-[18px] font-bold text-[#172B4D]">
        <Target size={20} className="text-[#3269C5]" /> Your next steps
      </h2>

      <p className="mt-1 text-[13px] leading-5 text-[#65758D]">
        Complete these milestones to qualify for {next.name}.
      </p>

      {focus ? (
        <div className="mt-5 rounded-[13px] border border-[#E1E9F4] bg-[#F7FAFF] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase text-[#65758D]">
                Still to complete
              </p>

              <p className="mt-2 text-[14px] font-semibold text-[#172B4D]">
                {conditionLabel(focus.key)}:{" "}
                {fmt(
                  Math.max(
                    0,

                    number(focus.condition.required) -
                      number(focus.condition.current),
                  ),
                )}{" "}
                more
              </p>
            </div>

            <p className="whitespace-nowrap text-[19px] font-bold text-[#172B4D]">
              {fmt(focus.condition.current)}

              <span className="text-[12px] font-normal text-[#65758D]">
                {" "}
                / {fmt(focus.condition.required)}
              </span>
            </p>
          </div>

          <ProgressBar
            className="mt-3"

            value={pct(
              number(focus.condition.current),

              number(focus.condition.required),
            )}
          />

          <div className="mt-2 flex justify-between gap-3 text-[12px] text-[#65758D]">
            <span>{fmt(focus.condition.current)} completed</span>

            <span>{fmt(focus.condition.required)} required</span>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-[#e8f7ee] p-4 text-[13px] font-semibold text-[#168255]">
          All listed requirements met.
        </div>
      )}

      {!!pending.length && (
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase text-[#65758D]">
            Pending requirements
          </p>

          <div className="mt-3 space-y-3">
            {pending.map(({ key, condition }) => (
              <div
                key={key}

                className="flex items-start gap-2 text-[12px] text-[#334963]"
              >
                <Clock3 size={15} className="mt-0.5 shrink-0 text-[#c28224]" />

                <span>
                  {conditionLabel(key)}:{" "}
                  {conditionDetail(key, condition, progress.ranks ?? [])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!!met.length && (
        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase text-[#65758D]">
            Already met
          </p>

          <div className="mt-3 space-y-3">
            {met.map(({ key, condition }) => (
              <div
                key={key}

                className="flex items-start gap-2 text-[12px] text-[#334963]"
              >
                <CheckCircle2
                  size={15}

                  className="mt-0.5 shrink-0 text-[#139155]"
                />

                <span>
                  {conditionLabel(key)} ({fmt(condition.current)} /{" "}
                  {fmt(condition.required)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function RequirementBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[13px] border border-[#E1E9F4] bg-[#F7FAFF] px-4 py-3">
      <p className="text-[11px] font-bold uppercase leading-4 text-[#65758D]">
        {label}
      </p>

      <p className="mt-1 break-words text-[13px] font-semibold leading-5 text-[#172B4D]">
        {value}
      </p>
    </div>
  );
}

function getValue(
  rank: DistributorRank,

  key: string,

  ranks: DistributorRank[],
) {
  const condition = (
    rank.conditions as Record<string, RankCondition | undefined> | undefined
  )?.[key];

  return condition
    ? isDownline(key)
      ? conditionDetail(key, condition, ranks)
      : `${fmt(condition.required)}${key === "direct_cv" ? " CV" : key === "tenure" ? " months" : ""}`
    : "—";
}

function RankTimeline({ progress }: { progress: RankProgress }) {
  const ranks = [...(progress.ranks ?? [])].sort(
    (a, b) => number(a.rank_no) - number(b.rank_no),
  );

  const next = nextRankOf(progress);

  return (
    <section className="rounded-[22px] border border-[#E1E9F4] bg-white p-5 shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EAF0F7] pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#3269C5]">
            Rank progression
          </p>

          <h2 className="mt-1 text-[18px] font-bold text-[#172B4D]">
            Ranks chart
          </h2>

          <p className="mt-1 text-[13px] leading-5 text-[#65758D]">
            Requirements for each rank, based on the API
          </p>
        </div>

        <span className="rounded-full bg-[#f0f1f5] px-3 py-1.5 text-[12px] font-semibold text-[#172B4D]">
          Current rank: {rankName(progress.current?.rank_no, ranks)}
        </span>
      </div>

      {!ranks.length ? (
        <p className="pt-5 text-[13px] text-[#65758D]">
          No rank definitions available.
        </p>
      ) : (
        <div className="mt-6">
          {ranks.map((rank, index) => {
            const achieved = !!rank.met;

            const isNext = next?.rank_no === rank.rank_no;

            const isCurrent =
              number(rank.rank_no) === number(progress.current?.rank_no);

            const downlines = ["downlines_one_below", "downlines_two_below"]

              .map((k) => getValue(rank, k, ranks))

              .filter((s) => s !== "—");

            const extraConditions = conditionsOf(rank).filter(
              ({ key }) =>
                ![
                  "steps",

                  "direct_cv",

                  "downlines_one_below",

                  "downlines_two_below",

                  "tenure",
                ].includes(key),
            );

            const previous = index ? ranks[index - 1] : null;

            return (
              <div
                key={rank.rank_no}

                className="relative flex gap-4 pb-8 last:pb-0"
              >
                <div className="relative flex w-7 shrink-0 justify-center">
                  {index < ranks.length - 1 && (
                    <div
                      className={`absolute bottom-[-6px] top-4 w-[2px] ${achieved ? "bg-[#15945a]" : "bg-[#e1e5ed]"}`}
                    />
                  )}

                  <span
                    className={`relative z-10 mt-[1px] flex h-6 w-6 items-center justify-center rounded-full border-2 ${achieved ? "border-[#3269C5] bg-[#3269C5] text-white" : isNext ? "border-[#3269C5] bg-white" : "border-[#d3d9e3] bg-white"}`}
                  >
                    {achieved && <Check size={13} strokeWidth={3} />}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[16px] font-bold text-[#172B4D]">
                      {rank.name}
                    </h3>

                    <Chip
                      met={achieved}

                      text={achieved ? "Achieved" : "Pending"}
                    />

                    {isNext && (
                      <span className="rounded-full bg-[#faebdb] px-2.5 py-1 text-[11px] font-semibold text-[#9d7650]">
                        Next
                      </span>
                    )}

                    {isCurrent && (
                      <span className="rounded-full bg-[#EAF2FF] px-2.5 py-1 text-[11px] font-semibold text-[#3269C5]">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[13px] leading-5 text-[#65758D]">
                    {previous
                      ? `Must have achieved the ${previous.name} rank`
                      : "Starting rank"}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
                    <div className="lg:col-span-2">
                      <RequirementBox
                        label="Steps"

                        value={getValue(rank, "steps", ranks)}
                      />
                    </div>

                    {number(rank.conditions?.direct_cv?.required) > 0 && (
                      <div className="lg:col-span-2">
                        <RequirementBox
                          label="Direct CV*"

                          value={getValue(rank, "direct_cv", ranks)}
                        />
                      </div>
                    )}

                    <div className="lg:col-span-4">
                      <RequirementBox
                        label="Downlines (unilevel structure)"

                        value={downlines.length ? downlines.join(" AND ") : "—"}
                      />
                    </div>

                    <div className="lg:col-span-4">
                      <RequirementBox
                        label="Consecutive months"

                        value={getValue(rank, "tenure", ranks)}
                      />
                    </div>
                  </div>

                  {extraConditions.length > 0 && (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {extraConditions.map(({ key, condition }) => (
                        <RequirementBox
                          key={key}

                          label={conditionLabel(key)}

                          value={conditionDetail(key, condition, ranks)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 border-t border-[#EAF0F7] pt-4 text-[11px] leading-5 text-[#65758D]">
        *Direct CV and other requirements are shown exactly as returned by your
        distributor statistics API. Qualification periods and business rules
        must be confirmed with the backend.
      </p>
    </section>
  );
}

function RankTable({ progress }: { progress: RankProgress }) {
  const ranks = [...(progress.ranks ?? [])].sort(
    (a, b) => number(a.rank_no) - number(b.rank_no),
  );

  return (
    <section className="overflow-hidden rounded-[22px] border border-[#E1E9F4] bg-white shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)]">
      <div className="border-b border-[#EAF0F7] p-5 sm:p-6">
        <h2 className="text-[18px] font-bold text-[#172B4D]">
          Rank requirements table
        </h2>

        <p className="mt-1 text-[13px] leading-5 text-[#65758D]">
          Scroll horizontally on smaller screens
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-[12px]">
          <thead className="bg-[#f7f8fb] text-[#677184]">
            <tr>
              {[
                "Rank",

                "Status",

                "Steps",

                "Direct CV",

                "Downlines",

                "Consecutive months",
              ].map((h) => (
                <th
                  key={h}

                  className="border-b border-[#EAF0F7] px-4 py-3 font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {ranks.map((r) => (
              <tr
                key={r.rank_no}

                className="border-b border-[#ECF1F7] last:border-0"
              >
                <td className="px-4 py-4 font-semibold text-[#172B4D]">
                  {r.name}
                </td>

                <td className="px-4 py-4">
                  <Chip met={!!r.met} text={r.met ? "Achieved" : "Pending"} />
                </td>

                <td className="px-4 py-4">{getValue(r, "steps", ranks)}</td>

                <td className="px-4 py-4">
                  {number(r.conditions?.direct_cv?.required) > 0 ? (
                    <span className="font-semibold text-[#172B4D]">
                      {getValue(r, "direct_cv", ranks)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7F0] px-2.5 py-1 text-[11px] font-semibold text-[#168255]">
                      <Check size={12} /> Not required
                    </span>
                  )}
                </td>

                <td className="max-w-[330px] px-4 py-4">
                  {["downlines_one_below", "downlines_two_below"]

                    .map((k) => getValue(r, k, ranks))

                    .filter((v) => v !== "—")

                    .join(" AND ") || "—"}
                </td>

                <td className="px-4 py-4">{getValue(r, "tenure", ranks)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

  const [isRankTableOpen, setIsRankTableOpen] = useState(false);

  const [isRankJourneyOpen, setIsRankJourneyOpen] = useState(false);

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

                    .getElementById("rank-next-actions")

                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }

                className="mt-1 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-white px-4 text-[12px] font-bold text-[#24519B] transition hover:bg-[#EAF2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                View my next steps <ArrowRight size={15} />
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

        <section id="rank-next-actions" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-[#172B4D] sm:text-[21px]">
              <Target size={21} className="text-[#3269C5]" /> What should I do
              next?
            </h2>

            <p className="mt-1 text-[13px] text-[#65758D]">
              Start with your pending requirements. Completed ones are clearly
              marked.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.9fr)]">
            <RequirementsCard progress={progress} />

            <ActionCard progress={progress} />
          </div>
        </section>

        <section className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-[#172B4D] sm:text-[21px]">
              <ListChecks size={21} className="text-[#3269C5]" /> Explore all
              ranks
            </h2>

            <p className="mt-1 text-[13px] text-[#65758D]">
              Open the rank journey for a simple overview, or the table for a
              detailed comparison.
            </p>
          </div>

          <div className="rounded-[22px] border border-[#E1E9F4] bg-white p-4 shadow-[0_12px_38px_-26px_rgba(21,43,80,.25)] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"

                onClick={() => setIsRankTableOpen((v) => !v)}

                aria-expanded={isRankTableOpen}

                aria-controls="rank-requirements-table-content"

                className="inline-flex min-h-[46px] flex-1 items-center justify-between gap-3 rounded-xl border border-[#D8E5F8] bg-white px-4 text-left text-[13px] font-bold text-[#24519B] hover:bg-[#F7FAFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3269C5]"
              >
                <span className="inline-flex items-center gap-2">
                  <ListChecks size={17} /> {isRankTableOpen ? "Hide" : "View"}{" "}
                  requirements table
                </span>

                <ChevronDown
                  size={17}

                  className={`transition-transform ${isRankTableOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Rank requirements are available on demand without visual/table view toggles. */}

            <div
              id="rank-journey-content"

              className={isRankJourneyOpen ? "mt-5" : ""}
            >
              {isRankJourneyOpen && <RankTimeline progress={progress} />}
            </div>

            <div
              id="rank-requirements-table-content"

              className={isRankTableOpen ? "mt-5" : ""}
            >
              {isRankTableOpen && <RankTable progress={progress} />}
            </div>
          </div>
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
