"use client";

import { MapPin, LockKeyhole, Landmark, CircleUserRound, Camera, Loader2, Phone, AlertCircle, UserRound, HelpCircle, Users } from "lucide-react";


export const NAVY = "#172B4D";

export const EMERALD = "#128364";

export const RED = "#d92d20";

export const AMBER = "#B8935A";


export const stickyColumnClass =
  "min-w-0 grid grid-cols-1 items-start gap-5 lg:sticky lg:top-[104px] lg:self-start";


export const inputClass =
  "box-border h-[50px] min-w-0 w-full rounded-[13px] border border-[#DDE5F0] bg-white px-4 text-[14px] font-medium text-[#1F3048] outline-none placeholder:font-normal placeholder:text-[#98A6B9] transition-all duration-150 hover:border-[#AFC2DF] focus:border-[#3869C8] focus:ring-[4px] focus:ring-[#3869C8]/10 disabled:cursor-not-allowed disabled:opacity-60";


export const readOnlyClass =
  "box-border h-[50px] min-w-0 w-full rounded-[13px] border border-[#EDF1F6] bg-[#F6F8FC] px-4 text-[13px] font-medium text-[#64748B] outline-none cursor-not-allowed";


export const labelClass =
  "mb-2 block break-words text-[13px] font-bold leading-5 text-[#334155]";


export const sectionClass =
  "min-w-0 w-full rounded-[22px] border border-[#E2EAF4] bg-white p-5 shadow-[0_10px_35px_-18px_rgba(23,43,77,0.20)] sm:p-6 2xl:p-7";


export const MAX_PHONE_CHANGE_REASON_WORDS = 150;

export const MIN_PHONE_CHANGE_REASON_CHARACTERS = 10;


export const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Other",
];


export const getWordCount = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;


export type ApiError = {
  data?: {
    errors?: Record<string, string | string[]>;
    message?: string;
  };
  message?: string;
};


export type CorrectionRequest = {
  id?: number;
  type?: string;
  status?: string;
  created_at?: string | null;
  updated_at?: string | null;
  rejected_at?: string | null;
  rejected_reason?: string | null;
  reason?: string | null;
};


export type ProfileApiResponse = {
  status?: boolean;
  message?: string;
  user?: any;
  next_allowed_at?: string | null;
  can_resubmit_correction?: boolean;
  correction_rejection_days?: number;
  beneficiaries?: any[];
};


export function getErrorMessage(err: unknown, fallback: string): string {
  const error = err as ApiError;
  const data = error?.data;

  if (data?.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    const firstValue = firstKey ? data.errors[firstKey] : undefined;

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0]);
    }

    if (typeof firstValue === "string") {
      return firstValue;
    }
  }

  return data?.message || error?.message || fallback;
}


export function parseApiDate(value?: string | null): number | null {
  if (!value) return null;
  const normalized = value.trim().replace(" ", "T");
  const timestamp = new Date(normalized).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}


export function formatApiDate(value?: string | null): string | null {
  const timestamp = parseApiDate(value);
  if (timestamp === null) return null;

  return new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}


/**
 * IMPORTANT FIX
 * The API returns `latest_correction_request` as an object keyed by type:
 *   { phone: {...}, email: {...} }
 * The old code pushed the whole object as a single entry, so filtering by
 * `request.type === "email_request"` never matched.
 *
 * This helper flattens every possible shape into a clean CorrectionRequest[].
 */
export function collectCorrectionRequests(user: any): CorrectionRequest[] {
  const collected: CorrectionRequest[] = [];

  const pushValue = (value: unknown) => {
    if (!value) return;

    // Array of requests
    if (Array.isArray(value)) {
      value.forEach(pushValue);
      return;
    }

    if (typeof value !== "object") return;

    const candidate = value as CorrectionRequest & Record<string, unknown>;

    // A real request object carries a `type` + `status`
    if (typeof candidate.type === "string" && candidate.status != null) {
      collected.push(candidate);
      return;
    }

    // Otherwise it's a type-keyed map: { phone: {...}, email: {...} }
    Object.values(candidate).forEach(pushValue);
  };

  pushValue(user?.correction_requests);
  pushValue(user?.latest_correction_request);

  // De-duplicate by id so the same request appearing in both sources
  // doesn't produce duplicate status cards.
  const seen = new Set<string>();
  return collected
    .filter((request) => {
      const key = String(request.id ?? `${request.type}-${request.created_at}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        (parseApiDate(b.created_at) ?? 0) - (parseApiDate(a.created_at) ?? 0),
    );
}


export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const HeaderIcon =
    title === "Profile"
      ? UserRound
      : title === "Profile picture"
        ? Camera
        : title === "Phone Number"
          ? Phone
          : title === "Address"
            ? MapPin
            : title === "Security"
              ? LockKeyhole
              : title === "Bank / Wallet Details"
                ? Landmark
                : title === "Help Center"
                  ? HelpCircle
                  : title === "Beneficiary"
                    ? Users
                    : CircleUserRound;

  return (
    <div className="mb-6 flex min-w-0 items-start gap-3.5 border-b border-[#EAF0F7] pb-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-[#DCE8FA] bg-[#EDF4FF] text-[#315FAE]">
        <HeaderIcon size={17} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="break-words text-[17px] font-extrabold leading-6 tracking-[-0.025em] text-[#172B4D] sm:text-[19px]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 break-words text-[12.5px] leading-5 text-[#64748B]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}


export function SaveButton({
  text = "Save changes",
  onClick,
  disabled = false,
  loading = false,
  type = "button",
}: {
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
}) {
  const unavailable = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={unavailable}
      className="inline-flex min-h-[43px] shrink-0 items-center justify-center gap-2 rounded-[12px] border border-[#2957A8] bg-[#2957A8] px-5 text-[13px] font-bold tracking-[-0.01em] text-white shadow-[0_4px_10px_-6px_rgba(0,0,0,0.35)] transition-all duration-150 hover:border-[#1D468D] hover:bg-[#1D468D] hover:shadow-[0_6px_15px_-7px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-black/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-[#DDDEE1] disabled:bg-[#DDDEE1] disabled:text-[#888B91] disabled:shadow-none"
    >
      {loading && <Loader2 size={15} className="shrink-0 animate-spin" />}
      {text}
    </button>
  );
}


export function GhostButton({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[43px] shrink-0 items-center justify-center rounded-[12px] border border-[#CBD9EB] bg-white px-5 text-[13px] font-semibold text-[#484B53] transition-all duration-150 hover:border-[#C8CAD0] hover:bg-[#F8F8F9] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-black/[0.07]"
    >
      {text}
    </button>
  );
}


// --------------------------------------------------
// KYC status — displayed inside Profile Overview
// --------------------------------------------------

export const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

    .kyc-status-page,
    .kyc-status-page * {
      box-sizing: border-box;
    }

    .kyc-status-page {
      min-width: 0;
      max-width: 100%;
      font-family: 'Lato', sans-serif;
    }

    .kyc-status-page p,
    .kyc-status-page h1,
    .kyc-status-page h2,
    .kyc-status-page h3 {
      overflow-wrap: anywhere;
    }

    .kyc-status-page button {
      -webkit-tap-highlight-color: transparent;
    }
  `}</style>
);


export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";

  try {
    const date = new Date(dateStr.replace(" ", "T"));
    if (isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}


export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";

  try {
    const date = new Date(dateStr.replace(" ", "T"));
    if (isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}


export function maskLast(
  value: string | number | null | undefined,
  lastN = 4,
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const stringValue = String(value);

  if (stringValue.length <= lastN) {
    return `XXXX ${stringValue}`;
  }

  return `XXXX XXXX ${stringValue.slice(-lastN)}`;
}


export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";

  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length < 6) return phone;

  return `${cleaned.slice(0, cleaned.length - 4)}XXXX`;
}


export const cardClass =
  "min-w-0 rounded-[22px] border border-[#E2EAF4] bg-white p-5 shadow-[0_10px_35px_-18px_rgba(23,43,77,0.20)] sm:p-6 lg:p-7";


export function KycError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={`kyc-status-page ${cardClass}`}>
      <FontImport />

      <div className="flex min-h-[260px] flex-col items-center justify-center px-1 py-10 text-center sm:min-h-[320px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fef2f2]">
          <AlertCircle className="h-7 w-7 text-[#DC2626]" />
        </div>

        <p className="mt-4 text-[14px] font-semibold text-[#101828] sm:text-[15px]">
          Failed to load KYC status
        </p>

        <p className="mt-2 max-w-sm text-[12px] leading-5 text-[#667085] sm:text-[13px]">
          Something went wrong while fetching your profile. Please try again.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[9px] bg-[#0E1B3D] px-5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#1a2a54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E1B3D]/30 focus-visible:ring-offset-2"
        >
          Retry
        </button>
      </div>
    </div>
  );
}


export function DetailRow({
  label,
  value,
  valueColor,
  capitalize = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  capitalize?: boolean;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-3 sm:gap-4">
      <p className="min-w-0 break-words text-[12px] leading-5 text-[#667085] sm:text-[13px] sm:text-[13.5px]">
        {label}
      </p>

      <p
        className={`min-w-0 break-words text-right text-[12px] font-semibold leading-5 text-[#101828] sm:text-[13px] sm:text-[13.5px] ${
          capitalize ? "capitalize" : ""
        }`}
        style={{ color: valueColor }}
      >
        {value}
      </p>
    </div>
  );
}
