"use client";

import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";

import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

// --------------------------------------------------
// Design tokens
// --------------------------------------------------

const EMERALD = "#1f9d6b";
const AMBER = "#B8935A";
const RED = "#DC2626";
const NAVY = "#0E1B3D";

// --------------------------------------------------
// Font
// --------------------------------------------------

const FontImport = () => (
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

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function formatDate(dateStr: string | null | undefined): string {
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

function formatDateTime(
  dateStr: string | null | undefined
): string {
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

function maskLast(
  value: string | number | null | undefined,
  lastN = 4
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

function maskPhone(
  phone: string | null | undefined
): string {
  if (!phone) return "—";

  const cleaned = phone.replace(/\s+/g, "");

  if (cleaned.length < 6) return phone;

  return `${cleaned.slice(0, cleaned.length - 4)}XXXX`;
}

// --------------------------------------------------
// Shared card styles
// --------------------------------------------------

const cardClass =
  "min-w-0 rounded-[14px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:rounded-[16px] sm:p-5 lg:p-6";

// --------------------------------------------------
// Loading skeleton
// --------------------------------------------------

function KycLoading() {
  return (
    <div
      className={`kyc-status-page ${cardClass}`}
      aria-label="Loading KYC status"
      aria-busy="true"
    >
      <FontImport />

      <div className="flex items-center gap-3">
        <Loader2
          className="h-5 w-5 shrink-0 animate-spin"
          style={{ color: NAVY }}
        />

        <div className="min-w-0 flex-1">
          <div className="h-5 w-36 max-w-full animate-pulse rounded bg-[#f2f4f7]" />
          <div className="mt-2 h-3.5 w-56 max-w-full animate-pulse rounded bg-[#f2f4f7]" />
        </div>
      </div>

      <div className="mt-6 rounded-[14px] border border-[#e7e9ee] p-4 sm:mt-8 sm:p-6">
        <div className="h-4 w-40 max-w-full animate-pulse rounded bg-[#f2f4f7]" />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-[#f2f4f7] sm:h-14 sm:w-14" />
          <div className="h-7 w-36 max-w-full animate-pulse rounded bg-[#f2f4f7]" />
        </div>

        <div className="mt-4 h-4 w-full max-w-[440px] animate-pulse rounded bg-[#f2f4f7]" />
        <div className="mt-2 h-4 w-4/5 max-w-[360px] animate-pulse rounded bg-[#f2f4f7]" />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex min-w-0 flex-col items-center rounded-[12px] bg-[#f7f8fa] p-3 sm:p-4"
            >
              <div className="h-9 w-9 animate-pulse rounded-full bg-[#e7e9ee]" />
              <div className="mt-3 h-3 w-20 max-w-full animate-pulse rounded bg-[#e7e9ee]" />
              <div className="mt-2 h-3 w-16 max-w-full animate-pulse rounded bg-[#e7e9ee]" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-2">
        <div className="h-52 animate-pulse rounded-[14px] bg-[#f7f8fa] sm:rounded-[16px]" />
        <div className="h-52 animate-pulse rounded-[14px] bg-[#f7f8fa] sm:rounded-[16px]" />
      </div>
    </div>
  );
}

// --------------------------------------------------
// Error state
// --------------------------------------------------

function KycError({
  onRetry,
}: {
  onRetry: () => void;
}) {
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
          Something went wrong while fetching your profile. Please try
          again.
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

// --------------------------------------------------
// Detail row
// --------------------------------------------------

function DetailRow({
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

// --------------------------------------------------
// Timeline step
// --------------------------------------------------

function TimelineStep({
  label,
  date,
  done,
  color,
  nextDone,
  isLast,
}: {
  label: string;
  date: string;
  done: boolean;
  color: string;
  nextDone: boolean;
  isLast: boolean;
}) {
  return (
    <div className="relative flex min-w-0 flex-col items-center px-1 text-center">
      {/* Connector: desktop only, behind the step icons */}
      {!isLast && (
        <div
          className="absolute left-1/2 top-[17px] z-0 hidden h-[2px] w-full sm:block"
          style={{
            backgroundColor: nextDone ? color : "#e7e9ee",
          }}
          aria-hidden="true"
        />
      )}

      <div
        className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
        style={{
          backgroundColor: done ? color : "#e7e9ee",
        }}
      >
        <CheckCircle2
          className="h-[18px] w-[18px] sm:h-5 sm:w-5"
          style={{
            color: done ? "#ffffff" : "#98a2b3",
          }}
        />
      </div>

      <p className="mt-2 w-full break-words text-[11px] font-semibold leading-4 text-[#101828] sm:text-[12px]">
        {label}
      </p>

      <p className="mt-1 w-full break-words text-[10px] leading-4 text-[#98a2b3] sm:text-[11px]">
        {date}
      </p>
    </div>
  );
}

// --------------------------------------------------
// KYC details card
// --------------------------------------------------

function KycDetailsCard({
  user,
  status,
}: {
  user: any;
  status: {
    label: string;
    color: string;
  };
}) {
  const details = [
    {
      label: "Application ID",
      value: `KYC${String(user.id).padStart(10, "0")}`,
    },
    {
      label: "Full name",
      value: user.full_name || "—",
      capitalize: true,
    },
    {
      label: "Aadhaar number",
      value: maskLast(user.aadhaar_last4),
    },
    {
      label: "Mobile number",
      value: maskPhone(user.phone),
    },
    {
      label: "PAN number",
      value: maskLast(user.pan_last4),
    },
  ];

  return (
    <div className={cardClass}>
      <h3 className="break-words text-[15px] font-bold text-[#101828] sm:text-[16px]">
        KYC details
      </h3>

      <div className="mt-4 space-y-3 border-b border-[#e7e9ee] pb-4 sm:space-y-3.5">
        {details.map((item) => (
          <DetailRow
            key={item.label}
            label={item.label}
            value={item.value}
            capitalize={item.capitalize}
          />
        ))}
      </div>

      <div className="mt-4">
        <DetailRow
          label="KYC status"
          value={status.label}
          valueColor={status.color}
        />
      </div>
    </div>
  );
}

// --------------------------------------------------
// Document verification card
// --------------------------------------------------

function DocumentVerificationCard({
  bp,
  documents,
}: {
  bp: any;
  documents: {
    label: string;
    status: string;
    verified: boolean;
    notApplicable: boolean;
  }[];
}) {
  return (
    <div className={cardClass}>
      <h3 className="break-words text-[15px] font-bold text-[#101828] sm:text-[16px]">
        Document verification status
      </h3>

      <div className="mt-4 space-y-3 border-b border-[#e7e9ee] pb-4 sm:space-y-3.5">
        {documents.map((document) => {
          const color = document.notApplicable
            ? "#98a2b3"
            : document.verified
              ? EMERALD
              : AMBER;

          return (
            <div
              key={document.label}
              className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3"
            >
              <p className="min-w-0 break-words text-[12px] leading-5 text-[#667085] sm:text-[13px] sm:text-[13.5px]">
                {document.label}
              </p>

              <span
                className="inline-flex max-w-full items-center justify-end gap-1.5 break-words text-right text-[11px] font-semibold leading-5 sm:text-[12px] sm:text-[13px]"
                style={{ color }}
              >
                {document.verified && (
                  <CheckCircle2
                    size={13}
                    className="shrink-0"
                  />
                )}

                {!document.verified && !document.notApplicable && (
                  <Clock
                    size={13}
                    className="shrink-0"
                  />
                )}

                <span>{document.status}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-3 sm:space-y-3.5">
        <DetailRow
          label="Bank name"
          value={bp.bank_name || "—"}
        />

        <DetailRow
          label="Account type"
          value={bp.account_type || "—"}
          capitalize
        />
      </div>
    </div>
  );
}

// ============================================
// MAIN KYC STATUS COMPONENT
// ============================================

const KycStatus = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetUserProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (isLoading) {
    return <KycLoading />;
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (isError || !data?.user) {
    return <KycError onRetry={() => refetch()} />;
  }

  // --------------------------------------------------
  // User and business profile
  // --------------------------------------------------

  const user = data.user;
  const bp =
    user.distributor_profile ??
    user.business_profile ??
    {};

  const kycStatus: string = (
    bp.kyc_status || ""
  ).toLowerCase();

  const aadhaarVerified = !!bp.aadhaar_verified;
  const panVerified = !!bp.pan_verified;
  const bankVerified = !!bp.bank_verified;

  // --------------------------------------------------
  // Overall KYC status
  // --------------------------------------------------

  const STATUS_META: Record<
    string,
    {
      label: string;
      color: string;
      bg: string;
      Icon: typeof CheckCircle2;
      description: string;
      successMsg: string;
      successTitle: string;
    }
  > = {
    verified: {
      label: "Completed",
      color: EMERALD,
      bg: "#eaf7f0",
      Icon: CheckCircle2,
      description:
        "Your KYC verification is complete. Thank you — your details have been verified successfully.",
      successTitle: "Great! Your KYC is completed",
      successMsg:
        "All your details have been verified successfully. You now have full access to all features.",
    },

    pending: {
      label: "Under Review",
      color: AMBER,
      bg: "#f8f1e4",
      Icon: Clock,
      description:
        "Your KYC verification is currently under review. This usually takes 24–48 hours.",
      successTitle: "KYC under review",
      successMsg:
        "We're reviewing your submitted documents. You'll be notified once the verification is complete.",
    },

    rejected: {
      label: "Rejected",
      color: RED,
      bg: "#fef2f2",
      Icon: XCircle,
      description: bp.rejection_reason
        ? `Your KYC was rejected. Reason: ${bp.rejection_reason}`
        : "Your KYC verification was rejected. Please re-submit with correct details.",
      successTitle: "KYC rejected",
      successMsg: bp.rejection_reason
        ? `Reason: ${bp.rejection_reason}`
        : "Please contact support or re-submit your KYC documents.",
    },
  };

  const status =
    STATUS_META[kycStatus] ?? STATUS_META.pending;

  const StatusIcon = status.Icon;

  // --------------------------------------------------
  // Timeline
  // --------------------------------------------------

  const timeline = [
    {
      label: "Submitted",
      date: formatDate(bp.submitted_at),
      done: !!bp.submitted_at,
    },
    {
      label: "Under review",
      date: formatDate(bp.submitted_at),
      done: !!bp.submitted_at,
    },
    {
      label: "In verification",
      date: formatDate(
        bp.aadhaar_verified_at || bp.pan_verified_at
      ),
      done: aadhaarVerified || panVerified,
    },
    {
      label: status.label,
      date: formatDate(
        bp.reviewed_at ||
          bp.updated_at ||
          bp.submitted_at
      ),
      done:
        kycStatus === "verified" ||
        kycStatus === "rejected",
    },
  ];

  // --------------------------------------------------
  // Documents
  // --------------------------------------------------

  const documents = [
    {
      label: "Aadhaar proof",
      status: aadhaarVerified ? "Verified" : "Pending",
      verified: aadhaarVerified,
      notApplicable: false,
    },
    {
      label: "PAN card",
      status: panVerified ? "Verified" : "Pending",
      verified: panVerified,
      notApplicable: false,
    },
    {
      label: "Bank account",
      status: bankVerified ? "Verified" : "Pending",
      verified: bankVerified,
      notApplicable: false,
    },
    {
      label: "Address proof",
      status: bp.location_consent
        ? "Verified"
        : "Not applicable",
      verified: !!bp.location_consent,
      notApplicable: !bp.location_consent,
    },
  ];

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className={`kyc-status-page ${cardClass}`}>
      <FontImport />

      {/* Page heading */}
      <div className="min-w-0">
        <h1 className="text-[20px] font-black tracking-[-0.01em] text-[#101828] sm:text-[22px]">
          KYC status
        </h1>

        <p className="mt-1 break-words text-[12px] leading-5 text-[#667085] sm:text-[13.5px]">
          Track and manage your KYC verification status.
        </p>
      </div>

      {/* Overall status card */}
      <section className="mt-5 min-w-0 rounded-[14px] border border-[#e7e9ee] bg-white p-4 sm:mt-8 sm:rounded-[16px] sm:p-5 lg:p-6">
        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start xl:gap-8">
          {/* Status information */}
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#667085] sm:text-[13.5px]">
              Overall KYC status
            </p>

            <div className="mt-3 flex min-w-0 items-center gap-3 sm:gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14"
                style={{
                  backgroundColor: status.bg,
                }}
              >
                <StatusIcon
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  style={{ color: status.color }}
                />
              </div>

              <h2
                className="min-w-0 break-words text-[22px] font-black leading-tight sm:text-[26px]"
                style={{ color: status.color }}
              >
                {status.label}
              </h2>
            </div>

            <p className="mt-4 max-w-[440px] break-words text-[12px] leading-5 text-[#667085] sm:text-[13px] sm:leading-[1.7]">
              {status.description}
            </p>
          </div>

          {/* Responsive timeline */}
          <div className="min-w-0 rounded-[12px] bg-[#fafbfc] p-3 sm:p-4">
            <h3 className="mb-4 text-[12px] font-bold text-[#475066] sm:text-[13px]">
              Verification timeline
            </h3>

            <div className="grid min-w-0 grid-cols-2 gap-x-2 gap-y-5 sm:grid-cols-4 sm:gap-x-0 sm:gap-y-3">
              {timeline.map((item, index) => (
                <TimelineStep
                  key={item.label}
                  label={item.label}
                  date={item.date}
                  done={item.done}
                  color={status.color}
                  nextDone={
                    index < timeline.length - 1
                      ? timeline[index + 1].done
                      : false
                  }
                  isLast={index === timeline.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Status message */}
        <div
          className="mt-5 flex min-w-0 items-start gap-3 rounded-[12px] p-3.5 sm:mt-8 sm:gap-4 sm:rounded-[14px] sm:p-4"
          style={{
            backgroundColor: status.bg,
          }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white sm:h-10 sm:w-10">
            <StatusIcon
              className="h-[18px] w-[18px] sm:h-5 sm:w-5"
              style={{ color: status.color }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="break-words text-[13px] font-bold leading-5 sm:text-[14px]"
              style={{ color: status.color }}
            >
              {status.successTitle}
            </p>

            <p className="mt-1 break-words text-[12px] leading-5 text-[#475066] sm:text-[13px]">
              {status.successMsg}
            </p>
          </div>
        </div>

        {/* Last updated */}
        <div className="mt-4 flex min-w-0 items-start gap-2 border-t border-[#f0f2f5] pt-4 sm:mt-6">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#98a2b3]" />

          <p className="min-w-0 break-words text-[11px] leading-5 text-[#98a2b3] sm:text-[12px]">
            <span className="font-semibold">Last updated:</span>{" "}
            {formatDateTime(bp.updated_at || user.updated_at)}
          </p>
        </div>
      </section>

      {/* Bottom cards */}
      <div className="mt-4 grid min-w-0 grid-cols-1 items-start gap-4 sm:mt-6 sm:gap-5 lg:grid-cols-2">
        <KycDetailsCard
          user={user}
          status={status}
        />

        <DocumentVerificationCard
          bp={bp}
          documents={documents}
        />
      </div>
    </div>
  );
};

export default KycStatus;