"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Info,
  LayoutGrid,
  List,
  Loader2,
  RefreshCw,
  Timer,
  TrendingUp,
  UserRound,
  Wallet,
  ShoppingBag,
  Coins,
  Layers,
  IndianRupee,
} from "lucide-react";
// import { useGetDistributorStatsQuery } from "../../../lib/redux/api/distributor/distributorStatsApi";
import { useGetDistributorStatsQuery } from "@/lib/redux/api/distributor/distributorStatsApi";
import type {
  DistributorRank,
  DistributorStatsData,
  RankCondition,
  RankProgress,
} from "../../../../lib/redux/api/distributor/distributorStatsApi";

import Loding from "@/components/common/Loding";

type Props = { variant?: "cv" | "commission" };
type ConditionEntry = { key: string; condition: RankCondition };

const number = (v: unknown) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};
const fmt = (v: unknown) =>
  number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const money = (v: unknown) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number(v));
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
      className={`h-[8px] w-full overflow-hidden rounded-full bg-[#e9ebf2] ${className}`}
    >
      <div
        className="h-full rounded-full bg-[#4353aa] transition-[width] duration-500"
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
      {text ?? (met ? "Met" : "Pending")}
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
    <div className="min-w-0 rounded-[13px] border border-[#e0e5ee] bg-[#f8f9fc] p-3">
      <p className="text-[10px] font-semibold uppercase leading-4 text-[#697487]">
        {label}
      </p>
      <p className="mt-1 break-words text-[14px] font-bold text-[#151b2b]">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-[#697487]">{sub}</p>}
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
  const eligibleName = rankName(
    progress.current?.eligible_rank_no,
    progress.ranks ?? [],
  );
  return (
    <section className="rounded-[17px] border border-[#e0e5ef] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef1fb] text-[#4254a9]">
          <UserRound size={20} />
        </div>
        <div className="min-w-0">
          <p className="break-all text-[14px] font-bold text-[#172033]">
            {data.distributor_id || "Distributor"}
          </p>
          <p className="mt-0.5 break-words text-[14px] text-[#697487]">
            {data.full_name || "—"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SmallMetric label="Title rank" value={currentName} />
        <SmallMetric label="Eligible rank" value={eligibleName} />
        <SmallMetric
          label="Account type"
          value={data.account_type ? title(data.account_type) : "—"}
        />
        <SmallMetric label="Total CV" value={`${fmt(data.total_cv)} CV`} />
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
    <section className="flex min-h-[282px] flex-col rounded-[17px] border border-[#e0e5ef] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#172033]">
          <TrendingUp size={19} className="text-[#4053aa]" />
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
              <span className="text-[32px] font-bold leading-none text-[#151b2b]">
                {completed} / {entries.length}
              </span>
              <span className="text-[19px] font-bold text-[#4053aa]">
                {progressPercent}%
              </span>
            </div>
            <ProgressBar value={progressPercent} className="mt-3" />
          </div>
          <div className="mt-auto pt-7">
            <p className="mb-2 text-[10px] font-semibold uppercase text-[#697487]">
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
// The API does not expose a rank-qualification period or its cut-off.
// This clock is explicitly for the *calendar month*, not a fabricated business cycle.
function useISTCalendarCountdown() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  if (!now) return null;
  const ist = new Date(now.getTime() + 330 * 60_000);
  const year = ist.getUTCFullYear(),
    monthIndex = ist.getUTCMonth();
  const start = Date.UTC(year, monthIndex, 1);
  const end = Date.UTC(year, monthIndex + 1, 1);
  const remainingMs = Math.max(0, end - ist.getTime());
  const seconds = Math.floor(remainingMs / 1000);
  const elapsed = pct(ist.getTime() - start, end - start);
  const label = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(now);
  const deadline = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(end - 1));
  return {
    label,
    deadline,
    elapsed,
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
  };
}
function CalendarCard() {
  const clock = useISTCalendarCountdown();
  return (
    <section className="flex min-h-[282px] flex-col rounded-[17px] border border-[#e0e5ef] bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#172033]">
        <Timer size={19} className="text-[#4353aa]" />
        Time left this calendar month
      </h2>
      <p className="mt-2 text-[12px] text-[#697487]">
        {clock
          ? `${clock.label} ends ${clock.deadline}, 11:59 PM IST`
          : "Calendar month · IST"}
      </p>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {(["Days", "Hours", "Minutes", "Seconds"] as const).map((unit, i) => {
          const n = clock
            ? [clock.days, clock.hours, clock.minutes, clock.seconds][i]
            : 0;
          return (
            <div
              key={unit}
              className="rounded-[13px] border border-[#e0e5ef] bg-[#f8f9fc] px-1 py-3 text-center"
            >
              <p className="text-[clamp(18px,2.1vw,29px)] font-bold leading-tight tabular-nums text-[#171d2d]">
                {clock ? String(n).padStart(2, "0") : "--"}
              </p>
              <p className="mt-1 text-[10px] text-[#697487]">{unit}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-auto pt-6">
        <div className="mb-2 flex justify-between text-[11px] text-[#697487]">
          <span>Calendar month elapsed</span>
          <span>{clock ? `${Math.round(clock.elapsed)}%` : "—"}</span>
        </div>
        <ProgressBar value={clock?.elapsed ?? 0} />
        <p className="mt-2 text-[10px] text-[#8b93a3]">
          Your rank qualification cut-off may differ.
        </p>
      </div>
    </section>
  );
}
function RequirementsCard({ progress }: { progress: RankProgress }) {
  const next = nextRankOf(progress);
  if (!next)
    return (
      <section className="rounded-[17px] border border-[#e0e5ef] bg-white p-6">
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
    <section className="rounded-[17px] border border-[#e0e5ef] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e9ebf1] pb-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#172033]">
            {next.name} requirements
          </h2>
          <p className="mt-1 text-[12px] text-[#697487]">
            Your next rank after{" "}
            {rankName(progress.current?.rank_no, progress.ranks ?? [])}
          </p>
        </div>
        <span className="text-[12px] text-[#697487]">
          {completed} of {entries.length} met
        </span>
      </div>
      {parentRank && (
        <div className="flex items-center justify-between gap-4 border-b border-[#e9ebf1] py-4">
          <div>
            <p className="text-[13px] font-semibold text-[#172033]">
              Must have achieved the {parentRank.name} rank
            </p>
            <p className="mt-1 text-[12px] text-[#697487]">
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
            className="border-b border-[#e9ebf1] py-4 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold text-[#172033]">
                  {conditionLabel(key)}
                </h3>
                <p className="mt-1 text-[12px] text-[#697487]">
                  {fmt(condition.current)} of {fmt(condition.required)}{" "}
                  completed
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
        <p className="py-5 text-[13px] text-[#697487]">
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
      <section className="rounded-[17px] border border-[#e0e5ef] bg-white p-6">
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
    <section className="rounded-[17px] border border-[#e0e5ef] bg-white p-5 sm:p-6">
      <h2 className="text-[18px] font-bold text-[#172033]">What to do next</h2>
      <p className="mt-1 text-[12px] text-[#697487]">To reach {next.name}</p>
      {focus ? (
        <div className="mt-5 rounded-[13px] border border-[#e0e5ee] bg-[#f8f9fc] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase text-[#697487]">
                Still to complete
              </p>
              <p className="mt-2 text-[14px] font-semibold text-[#172033]">
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
            <p className="whitespace-nowrap text-[19px] font-bold text-[#172033]">
              {fmt(focus.condition.current)}
              <span className="text-[12px] font-normal text-[#697487]">
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
          <div className="mt-2 flex justify-between gap-3 text-[11px] text-[#697487]">
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
          <p className="text-[10px] font-semibold uppercase text-[#697487]">
            Pending requirements
          </p>
          <div className="mt-3 space-y-3">
            {pending.map(({ key, condition }) => (
              <div
                key={key}
                className="flex items-start gap-2 text-[12px] text-[#354052]"
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
          <p className="text-[10px] font-semibold uppercase text-[#697487]">
            Already met
          </p>
          <div className="mt-3 space-y-3">
            {met.map(({ key, condition }) => (
              <div
                key={key}
                className="flex items-start gap-2 text-[12px] text-[#354052]"
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
    <div className="min-w-0 rounded-[13px] border border-[#e0e5ef] bg-[#f8f9fc] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase leading-4 text-[#697487]">
        {label}
      </p>
      <p className="mt-1 break-words text-[13px] font-semibold leading-5 text-[#172033]">
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
    <section className="rounded-[17px] border border-[#e0e5ef] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e9ebf1] pb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#4053aa]">
            Rank progression
          </p>
          <h2 className="mt-1 text-[18px] font-bold text-[#172033]">
            Ranks chart
          </h2>
          <p className="mt-1 text-[12px] text-[#697487]">
            Requirements for each rank, based on the API
          </p>
        </div>
        <span className="rounded-full bg-[#f0f1f5] px-3 py-1.5 text-[12px] font-semibold text-[#172033]">
          Current rank: {rankName(progress.current?.rank_no, ranks)}
        </span>
      </div>
      {!ranks.length ? (
        <p className="pt-5 text-[13px] text-[#697487]">
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
                    className={`relative z-10 mt-[1px] flex h-6 w-6 items-center justify-center rounded-full border-2 ${achieved ? "border-[#4353aa] bg-[#4353aa] text-white" : isNext ? "border-[#4353aa] bg-white" : "border-[#d3d9e3] bg-white"}`}
                  >
                    {achieved && <Check size={13} strokeWidth={3} />}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[16px] font-bold text-[#172033]">
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
                      <span className="rounded-full bg-[#eff0fa] px-2.5 py-1 text-[11px] font-semibold text-[#4353aa]">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-[#697487]">
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
                    <div className="lg:col-span-2">
                      <RequirementBox
                        label="Direct CV*"
                        value={getValue(rank, "direct_cv", ranks)}
                      />
                    </div>
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
      <p className="mt-6 border-t border-[#e9ebf1] pt-4 text-[11px] leading-5 text-[#697487]">
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
    <section className="overflow-hidden rounded-[17px] border border-[#e0e5ef] bg-white">
      <div className="border-b border-[#e9ebf1] p-5 sm:p-6">
        <h2 className="text-[18px] font-bold text-[#172033]">
          Rank requirements table
        </h2>
        <p className="mt-1 text-[12px] text-[#697487]">
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
                  className="border-b border-[#e9ebf1] px-4 py-3 font-semibold"
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
                className="border-b border-[#edf0f5] last:border-0"
              >
                <td className="px-4 py-4 font-semibold text-[#172033]">
                  {r.name}
                </td>
                <td className="px-4 py-4">
                  <Chip met={!!r.met} text={r.met ? "Achieved" : "Pending"} />
                </td>
                <td className="px-4 py-4">{getValue(r, "steps", ranks)}</td>
                <td className="px-4 py-4">{getValue(r, "direct_cv", ranks)}</td>
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
function OverviewStats({ data }: { data: DistributorStatsData }) {
  const stats = [
    { icon: ShoppingBag, label: "Total orders", value: fmt(data.total_orders) },
    {
      icon: IndianRupee,
      label: "Total MRP",
      value: money(data.total_amount_mrp),
    },
    { icon: Wallet, label: "Total savings", value: money(data.total_savings) },
    { icon: Layers, label: "Total CV", value: fmt(data.total_cv) },
    {
      icon: Coins,
      label: "Coins redeemed",
      value: fmt(data.total_coins_redeemed),
    },
  ];
  return (
    <section className="rounded-[17px] border border-[#e0e5ef] bg-white p-5 sm:p-6">
      <h2 className="text-[17px] font-bold text-[#172033]">
        Distributor overview
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="min-w-0 rounded-xl border border-[#e0e5ef] bg-[#f8f9fc] p-3"
          >
            <Icon size={17} className="text-[#4353aa]" />
            <p className="mt-2 text-[11px] text-[#697487]">{label}</p>
            <p className="mt-1 break-words text-[15px] font-bold text-[#172033]">
              {value}
            </p>
          </div>
        ))}
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
  const [view, setView] = useState<"visual" | "table">("visual");
  const [showOverview, setShowOverview] = useState(false);
  const [isRankTableOpen, setIsRankTableOpen] = useState(false);
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
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#e0e5ef] bg-white">
        <Loding />
      </div>
    );
  if (isError || response?.success === false || !data || !progress)
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#e0e5ef] bg-white p-6 text-center">
        <AlertCircle size={32} className="text-[#c94a47]" />
        <h2 className="mt-3 text-[17px] font-bold text-[#172033]">
          Unable to load rank dashboard
        </h2>
        <p className="mt-1 text-[12px] text-[#697487]">
          Please check your connection and try again.
        </p>
        <button
          onClick={() => void refetch()}
          className="mt-4 rounded-lg bg-[#4353aa] px-4 py-2 text-[12px] font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  return (
    <div
      className="w-full min-w-0 space-y-6 bg-[#f7f8fd] p-3 text-[#172033] sm:p-5 lg:p-7"
      style={{ fontFamily: "Lato, Arial, sans-serif" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight sm:text-[29px]">
            Rank Advancement
          </h1>
          <p className="mt-1 text-[13px] text-[#697487]">
            Track your progress towards your next rank
            {variant === "commission" ? " and commission eligibility" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#e0e5ef] bg-white px-3 py-2.5 text-[12px] text-[#354052]">
            <CalendarDays size={16} className="text-[#697487]" />
            Calendar month: {nowLabel}
          </div>
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            aria-label="Refresh rank statistics"
            title="Refresh stats"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-xl border border-[#e0e5ef] bg-white text-[#4353aa] disabled:opacity-50"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
        <AccountCard data={data} progress={progress} />
        <NextProgressCard progress={progress} />
        <CalendarCard />
      </div>
      <div className="flex items-start gap-3 rounded-xl border border-[#dfe5f8] bg-[#eef1fb] px-4 py-4 text-[12px] leading-5 text-[#3c465a]">
        <Info size={18} className="mt-0.5 shrink-0 text-[#4353aa]" />
        <p>
          Rank requirements and progress are loaded from the distributor API.
          The calendar countdown is for the standard calendar month; the backend
          does not currently provide a separate rank qualification period.
        </p>
      </div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <RequirementsCard progress={progress} />
        <ActionCard progress={progress} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-full bg-[#e9ebf2] p-1"
          role="group"
          aria-label="Rank view"
        >
          <button
            type="button"
            aria-pressed={view === "visual"}
            onClick={() => setView("visual")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition ${view === "visual" ? "bg-white text-[#4053aa] shadow-sm" : "text-[#697487]"}`}
          >
            <LayoutGrid size={15} />
            Visual view
          </button>
          <button
            type="button"
            aria-pressed={view === "table"}
            onClick={() => {
              setView("table");
              setIsRankTableOpen(false);
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition ${view === "table" ? "bg-white text-[#4053aa] shadow-sm" : "text-[#697487]"}`}
          >
            <List size={15} />
            Table view
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {view === "table" && (
            <button
              type="button"
              onClick={() => setIsRankTableOpen((open) => !open)}
              aria-expanded={isRankTableOpen}
              aria-controls="rank-requirements-table-panel"
              title={
                isRankTableOpen
                  ? "Hide rank requirements table"
                  : "View rank requirements table"
              }
              className="inline-flex min-h-[36px] items-center gap-2 rounded-xl border border-[#dce3f1] bg-white px-3 text-[12px] font-semibold text-[#4053aa] transition hover:border-[#b9c7e8] hover:bg-[#f0f3ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4053aa]/30"
            >
              <Info size={16} />
              {isRankTableOpen ? "Hide information" : "Information"}
              <ChevronDown
                size={14}
                className={`transition-transform ${isRankTableOpen ? "rotate-180" : ""}`}
              />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowOverview((v) => !v)}
            className="flex items-center gap-2 text-[12px] font-semibold text-[#4053aa]"
          >
            {showOverview ? "Hide" : "Show"} performance stats{" "}
            <ChevronDown
              size={15}
              className={showOverview ? "rotate-180" : ""}
            />
          </button>
        </div>
      </div>
      {view === "visual" ? (
        <RankTimeline progress={progress} />
      ) : (
        <div id="rank-requirements-table-panel">
          {isRankTableOpen ? (
            <RankTable progress={progress} />
          ) : (
            <div className="flex min-h-[105px] flex-col items-center justify-center gap-2 rounded-[17px] border border-dashed border-[#dfe5f0] bg-white px-5 py-6 text-center">
              <Info size={18} className="text-[#4053aa]" />
              <p className="text-[12px] font-medium text-[#697487]">
                Click Information above to view the rank requirements table.
              </p>
            </div>
          )}
        </div>
      )}
      {showOverview && <OverviewStats data={data} />}
      {isFetching && (
        <p className="flex items-center justify-end gap-2 text-[11px] text-[#697487]">
          <Loader2 size={13} className="animate-spin" />
          Refreshing distributor stats…
        </p>
      )}
    </div>
  );
}
