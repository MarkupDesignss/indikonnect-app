"use client";

import { ChevronDown, Wallet } from "lucide-react";


// Complete presentation component. Connect your existing Redux / RTK Query
// response through props. No fabricated balances or commissions are displayed.
export type Metric = number | string | null | undefined;


export const card =
  "min-w-0 rounded-[15px] border border-[#E7E9EF] bg-white shadow-[0_3px_14px_rgba(15,23,42,0.025)]";

export const heading =
  "text-[15px] font-bold tracking-[-.025em] text-[#202630] sm:text-[16px]";

export const sub = "text-[11px] leading-5 text-[#86909F]";

export const blackButton =
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[9px] bg-[#171717] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#333333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#D6D8DD] disabled:text-[#7E8490]";


export function numeric(value: Metric): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}


/** Formats a number using Indian rupee grouping (₹1,23,456.78). */
export function fmt(value: Metric) {
  const n = numeric(value);
  return n === null
    ? "—"
    : `₹${new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
      }).format(n)}`;
}


/** Formats a plain count (no currency symbol). */
export function fmtCount(value: Metric) {
  const n = numeric(value);
  return n === null
    ? "—"
    : new Intl.NumberFormat("en-IN").format(n);
}


export function dateShort(value: string) {
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


export function MetricCard({
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


export function SelectField({
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


export function ValueCell({
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


// ------------------------------------------------------------
// LIVE DATA ADAPTER — connects the exact existing account and
// dashboard hooks to the CV Counter RTK Query endpoint.
// ------------------------------------------------------------

export type UnknownObject = Record<string, unknown>;


export function asObject(value: unknown): UnknownObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownObject)
    : {};
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function pickValue(source: UnknownObject, ...keys: string[]): Metric {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "")
      return source[key] as Metric;
  }
  return undefined;
}

export function extractAccountRows(response: unknown): UnknownObject[] {
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

export function extractCalendar(response: unknown): UnknownObject {
  const root = asObject(response);
  const data = asObject(root.data);
  return asObject(data.sales_calendar ?? root.sales_calendar);
}

export function extractIgnite(response: unknown): UnknownObject {
  const root = asObject(response);
  return asObject(asObject(root.data).ignite ?? root.ignite);
}

export function extractCvPayload(response: unknown): UnknownObject {
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
