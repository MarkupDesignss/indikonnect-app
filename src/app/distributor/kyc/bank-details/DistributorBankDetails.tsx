"use client";

import {
  UserRound,
  Hash,
  CreditCard,
  Landmark,
  BadgeCheck,
  CalendarDays,
  RefreshCw,
  Loader2,
  AlertCircle,
  UserCheck,
  ClipboardCheck,
  FileText,
  FileCheck2,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";

// ==================================================
// TYPES
// ==================================================

interface DistributorBankProfile {
  id: number;
  user_id: number;

  company_name?: string | null;
  gst_in?: string | null;
  title?: string | null;
  type_of_entity?: string | null;

  bank_name?: string | null;
  bank_holder_name?: string | null;
  bank_ifsc?: string | null;
  branch_name?: string | null;
  account_type?: string | null;

  bank_verified?: boolean;
  aadhaar_verified?: boolean;
  pan_verified?: boolean;

  aadhaar_verified_at?: string | null;
  pan_verified_at?: string | null;
  kyc_status?: string | null;
  application_status?: string | null;

  location_consent?: boolean;
  location_consent_at?: string | null;

  pincode?: string | null;
  city?: string | null;
  state?: string | null;

  registration_completed?: boolean;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  withdrawn_at?: string | null;
  reviewed_by?: number | string | null;
  rejection_reason?: string | null;

  terms_accepted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface DistributorProfileUser {
  id: number;
  distributor_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  account_last4?: string | null;
  
  distributor_profile?: DistributorBankProfile | null;
}

interface DistributorProfileResponse {
  status: boolean;
  message?: string;
  user?: DistributorProfileUser;
}

// ==================================================
// DESIGN TOKENS
// ==================================================

const NAVY = "#0E1B3D";
const INDIGO = "#3955A6";

// ==================================================
// HELPERS
// ==================================================

function displayValue(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  return String(value);
}

function formatStatus(value?: string | null): string {
  if (!value) return "Not available";

  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string | null): string {
  if (!value) return "Not available";

  return value.replace("T", " ").replace(/\.\d+Z$/, "").replace(/Z$/, "");
}

function maskLastFour(
  value: string | null | undefined,
  type: "account",
): string {
  if (!value?.trim()) return "Not available";

  const lastFour = value.trim();

  return `•••• •••• ${lastFour}`;
}

// ==================================================
// LOADING
// ==================================================

function ProfileLoader() {
  return (
    <div
      className="flex min-h-[350px] w-full items-center justify-center rounded-[16px] border border-[#e7e9ee] bg-white"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2
          size={30}
          className="animate-spin"
          style={{ color: INDIGO }}
        />

        <p className="text-[13px] font-semibold text-[#667085]">
          Loading bank details...
        </p>
      </div>
    </div>
  );
}

// ==================================================
// ERROR
// ==================================================

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
      <AlertCircle size={34} className="text-[#c0392b]" />

      <h2 className="mt-3 text-[16px] font-bold text-[#101828]">
        Unable to load bank details
      </h2>

      <p className="mt-1 max-w-md text-[12px] text-[#667085]">
        Bank details could not be fetched. Please try again.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-[12px] font-semibold text-white"
        style={{ backgroundColor: NAVY }}
      >
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  );
}

// ==================================================
// FIELD COMPONENT
// ==================================================

function DetailField({
  label,
  value,
  icon: Icon,
  mono = false,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
  icon: LucideIcon;
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-[12px] border border-[#e8ebf0] bg-white p-3.5 transition-colors hover:bg-[#fafcff] sm:p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#eef2ff]">
        <Icon size={18} className="text-[#3955A6]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a92a6] sm:text-[11px]">
          {label}
        </p>

        <p
          className={`mt-1.5 break-words text-[13px] font-bold text-[#101828] sm:text-[14px] ${
            mono ? "font-mono" : ""
          }`}
          style={{ overflowWrap: "anywhere" }}
        >
          {displayValue(value)}
        </p>
      </div>
    </div>
  );
}

// ==================================================
// SECTION HEADER
// ==================================================

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#eef2ff]">
        <Icon size={20} className="text-[#3955A6]" />
      </div>

      <div className="min-w-0">
        <h2 className="text-[16px] font-bold text-[#101828] sm:text-[17px]">
          {title}
        </h2>

        <p className="mt-0.5 text-[11px] text-[#8a92a6] sm:text-[12px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ==================================================
// MAIN COMPONENT — ONLY BANK DETAILS
// ==================================================

export default function DistributorBankDetails() {
  const {
    data: rawResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetUserProfileQuery();

  const response = rawResponse as DistributorProfileResponse | undefined;

  const user = response?.user;
  const profile = user?.distributor_profile;

  if (isLoading) {
    return <ProfileLoader />;
  }

  if (isError || response?.status === false) {
    return <ProfileError onRetry={() => void refetch()} />;
  }

  if (!user || !profile) {
    return <ProfileError onRetry={() => void refetch()} />;
  }

  const bankVerified =
    typeof profile?.bank_verified === "boolean"
      ? profile.bank_verified
      : null;

  return (
    <div
      className="w-full min-w-0 space-y-5"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      {/* =========================================
          BANK DETAILS SECTION ONLY
      ========================================= */}
      <section className="overflow-hidden rounded-[16px] border border-[#e7e9ee] bg-white shadow-[0_2px_8px_rgba(16,24,40,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f3] bg-[#fafcff] p-5 sm:p-6">
          <SectionHeading
            icon={Landmark}
            title="Bank account details"
            subtitle="Registered distributor bank information"
          />

          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${
              bankVerified
                ? "bg-[#eaf7f0] text-[#18794e]"
                : "bg-[#fff4e5] text-[#a15c07]"
            }`}
          >
            <BadgeCheck size={14} />

            {bankVerified ? "Bank verified" : "Verification pending"}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {/* Bank Highlight Card */}
          <div className="flex items-center gap-3 rounded-[13px] border border-[#e8ebf0] bg-white p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[#eef2ff]">
              <Landmark size={23} className="text-[#3955A6]" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#8a92a6]">
                Bank name
              </p>

              <h3 className="mt-1 break-words text-[18px] font-black text-[#101828]">
                {displayValue(profile?.bank_name)}
              </h3>

              <p className="mt-1 text-[11px] text-[#667085]">
                {formatStatus(profile?.account_type)} account
              </p>
            </div>
          </div>

          {/* Bank Details Grid */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <DetailField
              label="Account holder name"
              value={profile?.bank_holder_name}
              icon={UserRound}
            />

            <DetailField
              label="Account number"
              value={maskLastFour(user.account_last4, "account")}
              icon={CreditCard}
              mono
            />

            <DetailField
              label="IFSC code"
              value={profile?.bank_ifsc}
              icon={Hash}
              mono
            />

            <DetailField
              label="Branch name"
              value={profile?.branch_name}
              icon={Landmark}
            />

            <DetailField
              label="Account type"
              value={formatStatus(profile?.account_type)}
              icon={CreditCard}
            />

            <DetailField
              label="Application status"
              value={formatStatus(profile?.application_status)}
              icon={FileCheck2}
            />

            <DetailField
              label="Registration completed"
              value={
                profile?.registration_completed === undefined
                  ? "Not available"
                  : profile.registration_completed
                    ? "Yes"
                    : "No"
              }
              icon={ClipboardCheck}
            />

            <DetailField
              label="Submitted at"
              value={formatDate(profile?.submitted_at)}
              icon={CalendarDays}
            />

            <DetailField
              label="Reviewed at"
              value={formatDate(profile?.reviewed_at)}
              icon={CalendarDays}
            />

            <DetailField
              label="Reviewed by"
              value={profile?.reviewed_by}
              icon={UserCheck}
            />

            <DetailField
              label="Withdrawn at"
              value={formatDate(profile?.withdrawn_at)}
              icon={CalendarDays}
            />

            <DetailField
              label="Rejection reason"
              value={profile?.rejection_reason}
              icon={FileText}
            />
          </div>
        </div>
      </section>

      {/* =========================================
          REFRESH BUTTON
      ========================================= */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="flex h-10 items-center gap-2 rounded-[10px] border border-[#e5e9ef] bg-white px-4 text-[12px] font-semibold text-[#344054] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={isFetching ? "animate-spin" : ""}
          />

          {isFetching ? "Refreshing..." : "Refresh details"}
        </button>
      </div>
    </div>
  );
}