"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useGetMyAccountsQuery,
  useGetUserDashboardQuery,
} from "@/lib/redux/api/distributor/userDashboardApi";
import { useLazyGetTrackingCvCounterQuery } from "@/lib/redux/api/distributor/trackingCvCounterApi";
import Sidebar from "@/components/Distributor/distributor/Sidebar";
import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Coins,
  GitBranch,
  HandCoins,
  Link2,
  Loader2,
  Network,
  Search,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
  AlertCircle,
  BarChart3,
  RefreshCw,
} from "lucide-react";

// Complete presentation component. Connect your existing Redux / RTK Query
// response through props. No fabricated balances or commissions are displayed.
type Metric = number | string | null | undefined;
export type TrackingAccount = { id: string; label?: string; baId?: string };
export type TrackingWeek = {
  weekNo: number;
  year: number;
  start: string;
  end: string;
  label?: string;
};
export type TrackingSummary = {
  retailProfit?: Metric;
  floatingRetailProfit?: Metric;
  totalPairedCv?: Metric;
  pairingCommission?: Metric;
  unilevelCommission?: Metric;
  greenCoinEarned?: Metric;
  yellowCoinEarned?: Metric;
  blueCoinEarned?: Metric;
};
export type TrackingCv = {
  accountId?: string;
  baId?: string;
  leftCv?: Metric;
  rightCv?: Metric;
  carryForwardLeft?: Metric;
  carryForwardRight?: Metric;
  pairedCv?: Metric;
  pairingCommission?: Metric;
  greenCoins?: Metric;
  yellowCoins?: Metric;
  blueCoins?: Metric;
  floatingCvLeft?: Metric;
  floatingCvRight?: Metric;
  totalCvLeft?: Metric;
  totalCvRight?: Metric;
  rankNo?: Metric;
  totalSteps?: Metric;
  isSettled?: boolean;
  weekYear?: number;
  weekNo?: number;
  hasWeekResult?: boolean;
};
export type TrackingCommission = {
  pairingCommission?: Metric;
  retailProfit?: Metric;
  unilevelCommission?: Metric;
};
export type TrackingTree = {
  totalDirects?: Metric;
  totalDownline?: Metric;
};
export type TrackingTrendPoint = {
  label: string;
  value: number; // cash credits in USD, sourced from cash_bal history
  outflow?: number; // absolute cash debits in USD
  isCurrent?: boolean;
};
export type HistoryEntry = {
  id?: number | string;
  category?: string;
  tx_type?: string;
  description?: string;
  amount?: number | string;
  date_created?: string;
};
export interface TrackingCenterPremiumProps {
  summary?: TrackingSummary | null;
  accounts?: TrackingAccount[];
  weeks?: TrackingWeek[];
  years?: number[];
  cv?: TrackingCv | null;
  commission?: TrackingCommission | null;
  commissionHistory?: HistoryEntry[];
  trend?: TrackingTrendPoint[];
  tree?: TrackingTree | null;
  initialAccountId?: string;
  initialWeekNo?: number;
  initialYear?: number;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: string | null;
  onShowCv?: (selection: {
    accountId: string;
    weekNo: number;
    year: number;
  }) => Promise<void> | void;
  onRefresh?: () => Promise<void> | void;
  onViewGenealogy?: () => void;
}

const card =
  "min-w-0 rounded-[15px] border border-[#E7E9EF] bg-white shadow-[0_3px_14px_rgba(15,23,42,0.025)]";
const heading =
  "text-[15px] font-bold tracking-[-.025em] text-[#202630] sm:text-[16px]";
const sub = "text-[11px] leading-5 text-[#86909F]";
const blackButton =
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[9px] bg-[#171717] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#333333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#D6D8DD] disabled:text-[#7E8490]";

function numeric(value: Metric): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function fmt(value: Metric) {
  const n = numeric(value);
  return n === null
    ? "—"
    : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
}
function dateShort(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const d = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    });
  }
  return value || "—";
}
function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
  tint,
}: {
  label: string;
  value: Metric;
  icon: typeof Wallet;
  accent: string;
  tint: string;
}) {
  return (
    <div
      className={`${card} group flex min-h-[103px] items-center gap-3 p-3.5 transition-shadow hover:shadow-[0_10px_22px_rgba(15,23,42,.05)] sm:p-4`}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]"
        style={{ backgroundColor: tint, color: accent }}
      >
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium leading-4 text-[#697386] sm:text-[12px]">
          {label}
        </p>
        <p className="mt-1 break-all text-[22px] font-bold leading-none tracking-[-.035em] text-[#202630] sm:text-[24px]">
          {fmt(value)}
        </p>
      </div>
    </div>
  );
}
function SelectField({
  label,
  value,
  onChange,
  children,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className="min-w-0 flex-1">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#566070]">
        {label}
      </span>
      <span className="relative block">
        <select
          className="h-[42px] w-full appearance-none rounded-[9px] border border-[#E3E6EC] bg-white px-3 pr-9 text-[12px] font-medium text-[#293344] outline-none transition focus:border-[#8D9AAE] focus:ring-2 focus:ring-[#CBD2DC]/35 disabled:bg-[#F5F6F8] disabled:text-[#9AA1AA]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {children}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-3.5 text-[#626E7E]"
        />
      </span>
    </label>
  );
}
function ValueCell({
  label,
  value,
  tone = "#252B34",
}: {
  label: string;
  value: Metric;
  tone?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-[#7B8492]">{label}</p>
      <p
        className="mt-1.5 break-words text-[19px] font-bold tracking-[-.025em] sm:text-[21px]"
        style={{ color: tone }}
      >
        {fmt(value)}
      </p>
    </div>
  );
}
function CvOverview({
  cv,
  isFetching,
}: {
  cv?: TrackingCv | null;
  isFetching?: boolean;
}) {
  return (
    <section className={`${card} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className={heading}>{cv?.accountId || "CV Overview"}</h3>
          <p className={`mt-1 ${sub}`}>
            Selected account’s sales week performance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {cv?.weekNo != null && (
            <span className="rounded-[7px] border border-[#E8EAED] bg-[#F6F7F9] px-2.5 py-1.5 text-[10px] font-semibold text-[#5F6773]">
              Week {cv.weekNo} · {cv.weekYear}
            </span>
          )}
          {cv?.isSettled !== undefined && (
            <span
              className={`rounded-[7px] border px-2.5 py-1.5 text-[10px] font-semibold ${cv.isSettled ? "border-[#D7EADB] bg-[#F1F9F3] text-[#277A51]" : "border-[#F0E1C1] bg-[#FFF9EB] text-[#956B25]"}`}
            >
              {cv.isSettled ? "Settled" : "Not settled"}
            </span>
          )}
          {cv?.baId && (
            <span className="max-w-full break-all rounded-[7px] border border-[#E8EAED] bg-[#F6F7F9] px-2.5 py-1.5 text-[10px] font-semibold text-[#5F6773]">
              {cv.baId}
            </span>
          )}
        </div>
      </div>
      {cv ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 border-b border-[#EDF0F3] pb-5">
            <ValueCell label="Left CV" value={cv.leftCv} tone="#4166A2" />
            <div className="border-l border-[#EBEDF1] pl-4">
              <ValueCell label="Right CV" value={cv.rightCv} tone="#26354B" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-[11px] border border-[#E7ECF3] bg-[#FAFBFD] p-3.5 sm:grid-cols-4">
            <ValueCell
              label="Floating left CV"
              value={cv.floatingCvLeft}
              tone="#4166A2"
            />
            <ValueCell label="Floating right CV" value={cv.floatingCvRight} />
            <ValueCell label="Total left CV" value={cv.totalCvLeft} />
            <ValueCell label="Total right CV" value={cv.totalCvRight} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 rounded-[11px] border border-[#EDF0F3] p-3 sm:grid-cols-3">
            <ValueCell label="Current rank" value={cv.rankNo} />
            <ValueCell label="Total steps" value={cv.totalSteps} />
            <div className="col-span-2 flex items-center text-[11px] text-[#697386] sm:col-span-1">
              {cv.hasWeekResult === false
                ? "Weekly result not available yet; settlement is pending."
                : "Weekly result available"}
            </div>
          </div>
          {/* <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
            <span className="text-[#768090]">Carry forward</span>
            <span className="font-semibold text-[#2D3540]">
              Left: {fmt(cv.carryForwardLeft)}
            </span>
            <span className="font-semibold text-[#2D3540]">
              Right: {fmt(cv.carryForwardRight)}
            </span>
          </div> */}
          {/* <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 rounded-[11px] border border-[#EDF0F3] bg-[#FAFBFC] p-3.5 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { label: "Paired CV", value: cv.pairedCv },
              { label: "Pairing commission", value: cv.pairingCommission },
              { label: "Green coins", value: cv.greenCoins },
              { label: "Yellow coins", value: cv.yellowCoins },
              { label: "Blue coins", value: cv.blueCoins },
            ].map((item) => (
              <div key={item.label} className="min-w-0">
                <p className="text-[10px] text-[#7D8794]">{item.label}</p>
                <p className="mt-1.5 text-[15px] font-bold text-[#253041]">
                  {fmt(item.value)}
                </p>
              </div>
            ))}
          </div> */}
        </>
      ) : (
        <div className="flex min-h-[205px] flex-col items-center justify-center gap-2 text-center">
          {isFetching ? (
            <Loader2 size={24} className="animate-spin text-[#7D899B]" />
          ) : (
            <BarChart3 size={24} className="text-[#AEB6C3]" />
          )}
          <p className="text-[12px] font-semibold text-[#5C6878]">
            {isFetching
              ? "Loading CV details…"
              : "Select an account and week to view CV"}
          </p>
          <p className={sub}>
            CV figures will be shown using your backend response.
          </p>
        </div>
      )}
    </section>
  );
}
function CommissionChart({ history }: { history?: HistoryEntry[] }) {
  // The history contains both dollar transactions and coin quantities.
  // Never sum them as if they shared a currency: visualize transaction COUNTS.
  const groups = [
    {
      category: "cash_bal",
      label: "Cash wallet",
      color: "#4C70B1",
      unit: "USD",
    },
    {
      category: "yellow_bal",
      label: "Yellow coins",
      color: "#E8B34F",
      unit: "coins",
    },
    {
      category: "green_bal",
      label: "Green coins",
      color: "#42A985",
      unit: "coins",
    },
    {
      category: "blue_bal",
      label: "Blue coins",
      color: "#91B2E8",
      unit: "coins",
    },
  ];
  const rows = groups.map((g) => {
    const entries = (history ?? []).filter((h) => h.category === g.category);
    const credited = entries.reduce(
      (total, h) => total + Math.max(0, numeric(h.amount) ?? 0),
      0,
    );
    const debited = entries.reduce(
      (total, h) => total + Math.max(0, -(numeric(h.amount) ?? 0)),
      0,
    );
    return { ...g, count: entries.length, credited, debited };
  });
  const otherCount = (history ?? []).filter(
    (h) => !groups.some((g) => g.category === h.category),
  ).length;
  if (otherCount)
    rows.push({
      category: "other",
      label: "Other entries",
      color: "#A3AAB8",
      unit: "mixed",
      count: otherCount,
      credited: 0,
      debited: 0,
    });
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  let offset = 0;
  const stops = rows.flatMap((row) => {
    const part = total > 0 ? (row.count / total) * 100 : 0;
    if (!part) return [];
    const result = `${row.color} ${offset}% ${offset + part}%`;
    offset += part;
    return [result];
  });
  return (
    <section className={`${card} h-full p-4 sm:p-5`}>
      <div className="flex items-start gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#F0F3F8] text-[#536987]">
          <CircleDollarSign size={17} />
        </span>
        <div>
          <h3 className={heading}>Commission History Breakdown</h3>
          <p className={`mt-1 ${sub}`}>
            Actual dashboard commission-history transactions, grouped by wallet
          </p>
        </div>
      </div>
      <div
        className="mx-auto my-5 flex h-[176px] w-[176px] items-center justify-center rounded-full sm:h-[190px] sm:w-[190px]"
        style={{
          background: total ? `conic-gradient(${stops.join(", ")})` : "#EBEEF3",
        }}
        role="img"
        aria-label={`Commission history: ${total} transactions across wallet categories`}
      >
        <div className="flex h-[124px] w-[124px] flex-col items-center justify-center rounded-full bg-white sm:h-[134px] sm:w-[134px]">
          <span className="text-[28px] font-bold tracking-tight text-[#202B3C]">
            {history ? fmt(total) : "—"}
          </span>
          <span className="text-[11px] font-medium text-[#86909B]">
            Transactions
          </span>
        </div>
      </div>
      <div className="overflow-hidden rounded-[10px] border border-[#EDF0F3]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 bg-[#FAFBFC] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#7A8493]">
          <span>Wallet category</span>
          <span>Entries</span>
        </div>
        {rows.map((row) => (
          <div
            key={row.category}
            className="border-t border-[#EDF0F3] px-3 py-2.5"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-[11px]">
              <span className="flex items-center gap-2 font-medium text-[#525D6E]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                {row.label}
              </span>
              <span className="font-bold text-[#283241]">
                {history ? row.count : "—"}
              </span>
            </div>
            {row.count > 0 && row.unit !== "mixed" && (
              <p className="mt-1 pl-[18px] text-[10px] text-[#8993A2]">
                In: {fmt(row.credited)} · Out: {fmt(row.debited)} {row.unit}
              </p>
            )}
          </div>
        ))}
        <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-[#E4E8EF] bg-[#F4F6FA] px-3 py-3 text-[12px] font-bold text-[#222C3A]">
          <span>Total transactions</span>
          <span>{history ? total : "—"}</span>
        </div>
      </div>
 
    </section>
  );
}
function WeeklyTrend({ trend }: { trend?: TrackingTrendPoint[] }) {
  const entries = (trend ?? []).filter((p) => Number.isFinite(p.value));
  const maxValue = Math.max(
    1,
    ...entries.flatMap((p) => [p.value, p.outflow ?? 0]),
  );
  const plotted = entries.map((p, i) => ({
    ...p,
    x: 33 + i * (343 / Math.max(1, entries.length - 1)),
    yIn: 153 - (Math.max(0, p.value) / maxValue) * 116,
    yOut: 153 - (Math.max(0, p.outflow ?? 0) / maxValue) * 116,
  }));
  const inflowPoints = plotted.map((p) => `${p.x},${p.yIn}`).join(" ");
  const outflowPoints = plotted.map((p) => `${p.x},${p.yOut}`).join(" ");
  return (
    <section className={`${card} h-full p-4 sm:p-5`}>
      <h3 className={heading}>Weekly Cash Activity</h3>
      <p className={`mt-1 ${sub}`}>
        Dashboard history mapped to actual sales-calendar weeks · USD
      </p>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-medium text-[#657386]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#5279B7]" />
          Cash credits
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#DCA06F]" />
          Cash debits / payouts
        </span>
      </div>
      {plotted.length ? (
        <svg
          className="mt-4 h-auto w-full overflow-visible"
          viewBox="0 0 410 204"
          role="img"
          aria-label="Weekly actual cash credits and debits in USD"
        >
          {[37, 76, 115, 153].map((y, i) => (
            <g key={y}>
              <line
                x1="33"
                x2="382"
                y1={y}
                y2={y}
                stroke="#E8ECF1"
                strokeWidth="1"
              />
              <text
                x="27"
                y={y + 3}
                textAnchor="end"
                fill="#8A95A4"
                fontSize="10"
              >
                {fmt((maxValue * (3 - i)) / 3)}
              </text>
            </g>
          ))}
          <polyline
            points={inflowPoints}
            fill="none"
            stroke="#5279B7"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polyline
            points={outflowPoints}
            fill="none"
            stroke="#DCA06F"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {plotted.map((p, i) => (
            <g key={`${p.label}-${i}`}>
              <circle cx={p.x} cy={p.yIn} r="3.5" fill="#5279B7">
                <title>{`Week ${p.label} · Cash credits $${fmt(p.value)}`}</title>
              </circle>
              <circle cx={p.x} cy={p.yOut} r="3" fill="#DCA06F">
                <title>{`Week ${p.label} · Cash debits $${fmt(p.outflow ?? 0)}`}</title>
              </circle>
              <text
                x={p.x}
                y="180"
                textAnchor="middle"
                fill="#758196"
                fontSize="10"
              >
                {p.label}
              </text>
            </g>
          ))}
          <text
            x="207"
            y="199"
            textAnchor="middle"
            fontSize="10"
            fill="#8B96A5"
          >
            Sales week number
          </text>
        </svg>
      ) : (
        <div className="mt-4 flex h-[190px] flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#E9EDF2] bg-[#FAFBFC]">
          <TrendingUp size={25} className="text-[#AEB8C6]" />
          <p className="text-[11px] text-[#8994A3]">
            No calendar-linked cash history available
          </p>
        </div>
      )}
      <p className="mt-2 text-[10px] leading-4 text-[#8993A2]">
        Only cash_bal transaction amounts are plotted. Coin transactions are
        excluded because they use different units.
      </p>
    </section>
  );
}
function MyTree({
  tree,
  onViewGenealogy,
}: {
  tree?: TrackingTree | null;
  onViewGenealogy?: () => void;
}) {
  return (
    <section className={`${card} flex h-full flex-col p-4 sm:p-5`}>
      <h3 className={heading}>My Tree</h3>
      <div className="mt-6 flex flex-1 items-center gap-4 rounded-[11px] bg-[#FAFBFC] p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-[#EDF2F9] text-[#5B7398]">
          <Network size={22} />
        </span>
        <div className="grid flex-1 grid-cols-2 divide-x divide-[#E0E6EE]">
          <div className="pr-3">
            <p className="text-[11px] text-[#7E8896]">Total Directs</p>
            <p className="mt-1 text-[23px] font-bold text-[#253142]">
              {fmt(tree?.totalDirects)}
            </p>
          </div>
          <div className="pl-4">
            <p className="text-[11px] text-[#7E8896]">Total Downline</p>
            <p className="mt-1 text-[23px] font-bold text-[#253142]">
              {fmt(tree?.totalDownline)}
            </p>
          </div>
        </div>
      </div>
      {onViewGenealogy ? (
        <button
          type="button"
          onClick={onViewGenealogy}
          className={`${blackButton} mt-4 w-full`}
        >
          <GitBranch size={15} /> View Genealogy <ArrowRight size={14} />
        </button>
      ) : (
        <div className="mt-4 text-[11px] text-[#939CAA]">
          Genealogy navigation is not configured.
        </div>
      )}
    </section>
  );
}

/** Full screen body. Use inside the existing distributor layout to avoid
 * rendering another header/sidebar. */
export function IndieKonnectTrackingCenterPremium({
  summary,
  accounts = [],
  weeks = [],
  years = [],
  cv,
  commission,
  commissionHistory,
  trend,
  tree,
  initialAccountId,
  initialWeekNo,
  initialYear,
  isLoading = false,
  isFetching = false,
  error,
  onShowCv,
  onRefresh,
  onViewGenealogy,
}: TrackingCenterPremiumProps) {
  const yearOptions = useMemo(() => {
    const distinct = Array.from(
      new Set([...years, ...weeks.map((w) => w.year)]),
    );
    if (initialYear && !distinct.includes(initialYear))
      distinct.push(initialYear);
    return distinct.sort((a, b) => b - a);
  }, [years, weeks, initialYear]);
  const [accountId, setAccountId] = useState(
    initialAccountId ?? accounts[0]?.id ?? "",
  );
  const [year, setYear] = useState<number | "">(
    initialYear ?? yearOptions[0] ?? "",
  );
  const [weekNo, setWeekNo] = useState<number | "">(initialWeekNo ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const availableWeeks = useMemo(
    () =>
      weeks.filter((w) => w.year === year).sort((a, b) => a.weekNo - b.weekNo),
    [weeks, year],
  );
  useEffect(() => {
    if (
      (!accountId || !accounts.some((a) => a.id === accountId)) &&
      accounts.length
    )
      setAccountId(accounts[0].id);
  }, [accounts, accountId]);
  useEffect(() => {
    if (year === "" && yearOptions.length) setYear(yearOptions[0]);
  }, [year, yearOptions]);
  useEffect(() => {
    if (weekNo !== "" && !availableWeeks.some((w) => w.weekNo === weekNo))
      setWeekNo("");
  }, [availableWeeks, weekNo]);
  useEffect(() => {
    if (weekNo === "" && availableWeeks.length)
      setWeekNo(
        availableWeeks.find((w) => w.weekNo === initialWeekNo)?.weekNo ??
          availableWeeks.find((w) => w.label?.includes("Current"))?.weekNo ??
          availableWeeks[availableWeeks.length - 1].weekNo,
      );
  }, [weekNo, availableWeeks, initialWeekNo]);
  const stats = [
    {
      label: "Retail Profit",
      value: summary?.retailProfit,
      icon: ShoppingBag,
      accent: "#52729E",
      tint: "#EDF3FB",
    },
    {
      label: "Floating Retail Profit",
      value: summary?.floatingRetailProfit,
      icon: HandCoins,
      accent: "#B27E34",
      tint: "#FBF3E7",
    },
    {
      label: "Total Paired CV",
      value: summary?.totalPairedCv,
      icon: BarChart3,
      accent: "#6373AD",
      tint: "#F0F1FA",
    },
    {
      label: "Pairing Commission",
      value: summary?.pairingCommission,
      icon: Link2,
      accent: "#A86169",
      tint: "#FAEFF0",
    },
    {
      label: "Unilevel Commission",
      value: summary?.unilevelCommission,
      icon: Network,
      accent: "#567DAE",
      tint: "#EDF4FC",
    },
    {
      label: "Green Coin Earned",
      value: summary?.greenCoinEarned,
      icon: CircleDollarSign,
      accent: "#278566",
      tint: "#EAF6F0",
    },
    {
      label: "Yellow Coin Earned",
      value: summary?.yellowCoinEarned,
      icon: Coins,
      accent: "#B78B27",
      tint: "#FFF7E4",
    },
    {
      label: "Blue Coin Earned",
      value: summary?.blueCoinEarned,
      icon: CircleDollarSign,
      accent: "#4E78B5",
      tint: "#EDF3FC",
    },
  ];
  async function submit() {
    if (!onShowCv || !accountId || year === "" || weekNo === "") return;
    setActionError(null);
    setSubmitting(true);
    try {
      await onShowCv({ accountId, year, weekNo });
    } catch (e) {
      setActionError(
        e instanceof Error
          ? e.message
          : "Unable to load CV for the selected week.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main
      className="w-full min-w-0 bg-[#F8F9FB] px-3 py-5 text-[#202630] sm:px-5 sm:py-6 lg:px-7"
      style={{ fontFamily: "'Lato', Arial, sans-serif" }}
    >
      <div className="mx-auto max-w-[1536px]">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-[10px] font-semibold tracking-wide text-[#8B96A5]">
              Distributor / Tracking Center
            </p>
            <h1 className="text-[22px] font-bold tracking-[-.04em] text-[#202630] sm:text-[25px]">
              Tracking Center
            </h1>
            <p className={`mt-1 ${sub}`}>
              View commissions, coin earnings and weekly CV performance.
            </p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={() => void onRefresh()}
              disabled={isFetching}
              className="inline-flex h-9 items-center gap-2 rounded-[9px] border border-[#E4E7ED] bg-white px-3 text-[11px] font-semibold text-[#455165] hover:bg-[#F4F6F9] disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={isFetching ? "animate-spin" : ""}
              />{" "}
              Refresh
            </button>
          )}
        </div>
        {(error || actionError) && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-[10px] border border-[#F0D6D6] bg-[#FFF6F6] p-3 text-[12px] text-[#A94848]"
          >
            <AlertCircle size={16} />
            {actionError || error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 sm:gap-3">
          {stats.map((s) => (
            <MetricCard
              key={s.label}
              {...s}
              value={isLoading ? null : s.value}
            />
          ))}
        </div>
        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#E6EAF0] bg-white text-[#5B708E]">
              <Activity size={17} />
            </span>
            <div>
              <h2 className="text-[17px] font-bold tracking-[-.03em] text-[#202630]">
                Tracking Center
              </h2>
              <p className={sub}>Select your TC account and settlement week</p>
            </div>
          </div>
          <div className={`${card} p-3.5 sm:p-4`}>
            <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.35fr)_minmax(125px,.55fr)_auto]">
              <SelectField
                label="TC Account"
                value={accountId}
                onChange={setAccountId}
                disabled={!accounts.length}
              >
                <option value="">Select an account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label || a.id}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Sales week"
                value={String(weekNo)}
                onChange={(v) => setWeekNo(v ? Number(v) : "")}
                disabled={!availableWeeks.length}
              >
                <option value="">Select a week</option>
                {availableWeeks.map((w) => (
                  <option key={`${w.year}-${w.weekNo}`} value={w.weekNo}>
                    {w.label ||
                      `Week ${w.weekNo} (${dateShort(w.start)} – ${dateShort(w.end)} ${w.year})`}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Year"
                value={String(year)}
                onChange={(v) => {
                  setYear(v ? Number(v) : "");
                  setWeekNo("");
                }}
                disabled={!yearOptions.length}
              >
                <option value="">Year</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </SelectField>
              <button
                type="button"
                onClick={() => void submit()}
                className={`${blackButton} w-full lg:w-auto`}
                disabled={
                  !onShowCv ||
                  !accountId ||
                  weekNo === "" ||
                  year === "" ||
                  submitting ||
                  isFetching
                }
              >
                {submitting || isFetching ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Search size={15} />
                )}{" "}
                Show CV
              </button>
            </div>
          </div>
          <div className="mt-3 grid items-stretch gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(310px,.8fr)]">
            <div className="grid gap-3">
              <CvOverview cv={cv} isFetching={isFetching} />
              <div className="grid gap-3 md:grid-cols-2">
                <WeeklyTrend trend={trend} />
                <MyTree tree={tree} onViewGenealogy={onViewGenealogy} />
              </div>
            </div>
            <CommissionChart history={commissionHistory} />
          </div>
        </section>
      </div>
    </main>
  );
}

// ------------------------------------------------------------
// LIVE DATA ADAPTER — connects the exact existing account and
// dashboard hooks to the CV Counter RTK Query endpoint.
// ------------------------------------------------------------

type UnknownObject = Record<string, unknown>;

function asObject(value: unknown): UnknownObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownObject)
    : {};
}
function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
function pickValue(source: UnknownObject, ...keys: string[]): Metric {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "")
      return source[key] as Metric;
  }
  return undefined;
}
function extractAccountRows(response: unknown): UnknownObject[] {
  const responseObj = asObject(response);
  const data = responseObj.data;
  const node = asObject(data);
  const candidates = [
    data,
    node.accounts,
    node.items,
    node.records,
    responseObj.accounts,
    responseObj.items,
    responseObj.records,
    asObject(node.data).accounts,
  ];
  const array = candidates.find(Array.isArray);
  return asArray(array).map(asObject);
}
function extractCalendar(response: unknown): UnknownObject {
  const root = asObject(response);
  const data = asObject(root.data);
  return asObject(data.sales_calendar ?? root.sales_calendar);
}
function extractIgnite(response: unknown): UnknownObject {
  const root = asObject(response);
  return asObject(asObject(root.data).ignite ?? root.ignite);
}
function extractCvPayload(response: unknown): UnknownObject {
  const root = asObject(response);
  const one = asObject(root.data ?? root);
  const two = asObject(one.data ?? one);
  const nested = [
    two.cv_counter,
    two.cv,
    two.summary,
    two.pairing,
    two.ignite,
    two.result,
  ]
    .map(asObject)
    .find((item) =>
      Object.keys(item).some((k) => /cv|pair|coin|carry/i.test(k)),
    );
  return { ...two, ...(nested || {}) };
}
function mapCv(
  response: unknown,
  account: TrackingAccount | undefined,
): TrackingCv {
  const payload = asObject(asObject(response).data ?? response);
  const current = asObject(payload.current);
  const weekResult = asObject(payload.week_result);
  const week = asObject(payload.week);
  const currentData = Object.keys(current).length
    ? current
    : extractCvPayload(response);
  // Weekly settlement values must come from week_result, never from the live/current CV snapshot.
  const settledData = payload.week_result != null ? weekResult : {};
  return {
    accountId: account?.label || account?.id || String(payload.ba_id || ""),
    baId: String(payload.ba_id || account?.baId || account?.id || ""),
    leftCv: pickValue(currentData, "cv_left", "left_cv", "leftCv"),
    rightCv: pickValue(currentData, "cv_right", "right_cv", "rightCv"),
    floatingCvLeft: pickValue(currentData, "floating_cv_left"),
    floatingCvRight: pickValue(currentData, "floating_cv_right"),
    totalCvLeft: pickValue(currentData, "total_cv_left"),
    totalCvRight: pickValue(currentData, "total_cv_right"),
    rankNo: pickValue(currentData, "rank_no"),
    totalSteps: pickValue(currentData, "total_steps"),
    carryForwardLeft: pickValue(
      settledData,
      "carry_forward_left",
      "carry_forward_cv_left",
      "left_carry_forward",
      "carry_left",
      "cf_left",
    ),
    carryForwardRight: pickValue(
      settledData,
      "carry_forward_right",
      "carry_forward_cv_right",
      "right_carry_forward",
      "carry_right",
      "cf_right",
    ),
    pairedCv: pickValue(
      settledData,
      "paired_cv",
      "total_paired_cv",
      "pair_cv",
      "matching_cv",
    ),
    pairingCommission: pickValue(
      settledData,
      "pairing_commission",
      "pairing_commission_usd",
      "weekly_pairing_usd",
    ),
    greenCoins: pickValue(
      settledData,
      "green_coins",
      "green_coin",
      "green_coin_earned",
      "green_bal",
    ),
    yellowCoins: pickValue(
      settledData,
      "yellow_coins",
      "yellow_coin",
      "yellow_coin_earned",
      "yellow_bal",
    ),
    blueCoins: pickValue(
      settledData,
      "blue_coins",
      "blue_coin",
      "blue_coin_earned",
      "blue_bal",
    ),
    isSettled:
      typeof payload.is_settled === "boolean" ? payload.is_settled : undefined,
    weekYear: Number(week.year) || undefined,
    weekNo: Number(week.week_no) || undefined,
    hasWeekResult: payload.week_result != null,
  };
}

/** The default export is a ready-to-render page for the existing distributor layout.
 *  It does not require the parent to pass any props. */
export default function TrackingCenterLivePage() {
  const myAccounts = useGetMyAccountsQuery();
  const dashboard = useGetUserDashboardQuery();
  const [loadCv, cvQuery] = useLazyGetTrackingCvCounterQuery();
  const [selection, setSelection] = useState<{
    accountId: string;
    year: number;
    weekNo: number;
  } | null>(null);
  const [shownResponse, setShownResponse] = useState<unknown>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const accounts = useMemo((): TrackingAccount[] => {
    const unique = new Set<string>();
    return extractAccountRows(myAccounts.data).flatMap((item) => {
      const baId = String(item.ba_id ?? item.account_id ?? "").trim();
      if (!baId || unique.has(baId)) return [];
      unique.add(baId);
      const label = String(item.account_id ?? item.ba_id ?? baId);
      return [{ id: baId, baId, label }];
    });
  }, [myAccounts.data]);

  const calendar = useMemo(
    () => extractCalendar(dashboard.data),
    [dashboard.data],
  );
  const year = Number(calendar.year || new Date().getFullYear());
  const months = asArray(calendar.all_months).map(asObject);
  const weeks = useMemo((): TrackingWeek[] => {
    const seen = new Set<string>();
    return asArray(calendar.all_months)
      .flatMap((monthItem) => {
        const month = asObject(monthItem);
        return asArray(month.weeks).flatMap((weekItem) => {
          const w = asObject(weekItem);
          const weekNo = Number(w.week_no);
          const weekYear = Number(w.year || calendar.year);
          const key = `${weekYear}:${weekNo}`;
          if (
            !Number.isFinite(weekNo) ||
            !Number.isFinite(weekYear) ||
            !weekNo ||
            seen.has(key)
          )
            return [];
          seen.add(key);
          return [
            {
              weekNo,
              year: weekYear,
              start: String(w.start || ""),
              end: String(w.end || ""),
              label: `Week ${weekNo} (${dateShort(String(w.start || ""))} – ${dateShort(String(w.end || ""))} ${weekYear})${w.is_current ? " • Current" : ""}`,
            },
          ];
        });
      })
      .sort((a, b) => a.year - b.year || a.weekNo - b.weekNo);
  }, [calendar]);
  const currentWeek = months
    .flatMap((m) => asArray(m.weeks).map(asObject))
    .find((w) => w.is_current === true);
  const initialWeekNo =
    Number(
      currentWeek?.week_no || asObject(calendar.current_week).week_no || 0,
    ) || undefined;
  const ignite = useMemo(() => extractIgnite(dashboard.data), [dashboard.data]);
  const summary: TrackingSummary = {
    retailProfit: pickValue(ignite, "retail_profit_usd"),
    floatingRetailProfit: pickValue(ignite, "floating_retail_profit_usd"),
    totalPairedCv: pickValue(ignite, "total_paired_cv"),
    pairingCommission: pickValue(ignite, "weekly_pairing_usd"),
    unilevelCommission: pickValue(ignite, "unilevel_commission_usd"),
    greenCoinEarned: pickValue(ignite, "unilevel_green_coin"),
    yellowCoinEarned: pickValue(ignite, "yellow_coin_earned"),
    blueCoinEarned: pickValue(ignite, "blue_coin_earned"),
  };
  const commissionHistory = useMemo((): HistoryEntry[] | undefined => {
    if (!dashboard.data) return undefined;
    return asArray(ignite.commissions_history).map(
      (item) => asObject(item) as HistoryEntry,
    );
  }, [dashboard.data, ignite]);

  const weeklyCashTrend = useMemo((): TrackingTrendPoint[] => {
    if (!commissionHistory?.length || !weeks.length) return [];
    const cashRows = commissionHistory.filter(
      (row) =>
        row.category === "cash_bal" &&
        row.date_created &&
        numeric(row.amount) !== null,
    );
    // API date strings and calendar boundaries use identical YYYY-MM-DD HH:mm:ss format.
    // A closed end timestamp is exclusive for assigning a transaction to its correct sales week.
    const mapped = weeks.map((w) => {
      const transactions = cashRows.filter((row) => {
        const date = String(row.date_created || "")
          .replace("T", " ")
          .slice(0, 19);
        return date >= w.start.slice(0, 19) && date <= w.end.slice(0, 19);
      });
      return {
        label: String(w.weekNo),
        value: transactions.reduce(
          (sum, row) => sum + Math.max(0, numeric(row.amount) ?? 0),
          0,
        ),
        outflow: transactions.reduce(
          (sum, row) => sum + Math.max(0, -(numeric(row.amount) ?? 0)),
          0,
        ),
        isCurrent: w.weekNo === initialWeekNo && w.year === year,
        hasRecords: transactions.length > 0,
      };
    });
    const lastWithHistory = mapped.reduce(
      (last, w, index) => (w.hasRecords ? index : last),
      -1,
    );
    if (lastWithHistory < 0) return [];
    const end = Math.min(
      mapped.length,
      Math.max(lastWithHistory + 1, mapped.findIndex((w) => w.isCurrent) + 1),
    );
    return mapped
      .slice(Math.max(0, end - 8), end)
      .map(({ hasRecords: _hasRecords, ...point }) => point);
  }, [commissionHistory, weeks, initialWeekNo, year]);

  const displayed =
    shownResponse === null
      ? null
      : mapCv(
          shownResponse,
          accounts.find((a) => a.id === selection?.accountId),
        );
  const responseData =
    shownResponse === null ? null : asObject(asObject(shownResponse).data);
  const commission: TrackingCommission | undefined =
    shownResponse === null
      ? undefined
      : {
          pairingCommission: displayed?.pairingCommission,
          retailProfit:
            responseData?.week_result != null
              ? pickValue(
                  asObject(responseData.week_result),
                  "retail_profit_usd",
                  "retail_profit",
                )
              : undefined,
          unilevelCommission:
            responseData?.week_result != null
              ? pickValue(
                  asObject(responseData.week_result),
                  "unilevel_commission",
                  "unilevel_commission_usd",
                )
              : undefined,
        };
  async function showCv(selected: {
    accountId: string;
    year: number;
    weekNo: number;
  }) {
    if (!accounts.some((a) => a.baId === selected.accountId))
      throw new Error("Please select a valid TC account.");
    if (
      !weeks.some(
        (w) => w.year === selected.year && w.weekNo === selected.weekNo,
      )
    )
      throw new Error("Please select a valid sales week.");
    setSelection(selected);
    setShownResponse(null);
    setRequestError(null);
    try {
      const result = await loadCv({
        ba_id: selected.accountId,
        year: selected.year,
        week_no: selected.weekNo,
      }).unwrap();
      const obj = asObject(result);
      if (obj.success === false)
        throw new Error(String(obj.message || "CV data unavailable"));
      setShownResponse(result);
    } catch (error) {
      const e = asObject(error);
      const msg = String(
        asObject(e.data).message ||
          e.message ||
          e.error ||
          "Unable to retrieve CV. Please try again.",
      );
      setRequestError(msg);
      throw new Error(msg);
    }
  }
  return (
    <div
      className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-white"
      style={{ fontFamily: "'Lato', Arial, sans-serif" }}
    >
      <DashboardHeader
        distributorId={String(ignite.ba_id || accounts[0]?.baId || "N/A")}
      />
      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Sidebar />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#F8F9FB]">
          <IndieKonnectTrackingCenterPremium
            accounts={accounts}
            weeks={weeks}
            years={Array.from(new Set(weeks.map((w) => w.year)))}
            initialYear={year}
            initialWeekNo={initialWeekNo}
            summary={summary}
            cv={displayed}
            commission={commission}
            commissionHistory={commissionHistory}
            trend={weeklyCashTrend}
            isLoading={myAccounts.isLoading || dashboard.isLoading}
            isFetching={cvQuery.isFetching}
            error={
              requestError ||
              (myAccounts.isError
                ? "Unable to load My Accounts."
                : dashboard.isError
                  ? "Unable to load Sales Calendar."
                  : null)
            }
            onShowCv={showCv}
            onRefresh={async () => {
              await Promise.all([myAccounts.refetch(), dashboard.refetch()]);
            }}
          />
         
        </main>
      </div>
    </div>
  );
}
