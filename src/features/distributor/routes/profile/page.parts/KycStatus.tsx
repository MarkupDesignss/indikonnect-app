"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { AMBER, EMERALD, FontImport, RED, cardClass, formatDate, formatDateTime } from "@/features/distributor/routes/profile/page.parts/support";
import { TimelineStep } from "@/features/distributor/routes/profile/page.parts/TimelineStep";
import { KycDetailsCard } from "@/features/distributor/routes/profile/page.parts/KycDetailsCard";
import { DocumentVerificationCard } from "@/features/distributor/routes/profile/page.parts/DocumentVerificationCard";


export const KycStatus = ({ user }: { user: any }) => {
  const bp = user.distributor_profile ?? user.business_profile ?? {};

  const kycStatus: string = (bp.kyc_status || "").toLowerCase();
  const aadhaarVerified = !!bp.aadhaar_verified;
  const panVerified = !!bp.pan_verified;
  const bankVerified = !!bp.bank_verified;

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

  const status = STATUS_META[kycStatus] ?? STATUS_META.pending;
  const StatusIcon = status.Icon;

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
      date: formatDate(bp.aadhaar_verified_at || bp.pan_verified_at),
      done: aadhaarVerified || panVerified,
    },
    {
      label: status.label,
      date: formatDate(bp.reviewed_at || bp.updated_at || bp.submitted_at),
      done: kycStatus === "verified" || kycStatus === "rejected",
    },
  ];

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
      status: bp.location_consent ? "Verified" : "Not applicable",
      verified: !!bp.location_consent,
      notApplicable: !bp.location_consent,
    },
  ];

  return (
    <div className={`kyc-status-page ${cardClass}`}>
      <FontImport />

      <div className="min-w-0">
        <h1 className="text-[20px] font-black tracking-[-0.01em] text-[#101828] sm:text-[22px]">
          KYC status
        </h1>
        <p className="mt-1 break-words text-[12px] leading-5 text-[#667085] sm:text-[13.5px]">
          Track and manage your KYC verification status.
        </p>
      </div>

      <section className="mt-2 min-w-0 rounded-[14px] border border-[#e7e9ee] bg-white p-4 sm:mt-4 sm:rounded-[16px] sm:p-5 lg:p-6">
        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start xl:gap-8">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#667085] sm:text-[13.5px]">
              Overall KYC status
            </p>

            <div className="mt-3 flex min-w-0 items-center gap-3 sm:gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14"
                style={{ backgroundColor: status.bg }}
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

        <div
          className="mt-5 flex min-w-0 items-start gap-3 rounded-[12px] p-3.5 sm:mt-8 sm:gap-4 sm:rounded-[14px] sm:p-4"
          style={{ backgroundColor: status.bg }}
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

        <div className="mt-4 flex min-w-0 items-start gap-2 border-t border-[#f0f2f5] pt-4 sm:mt-6">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#98a2b3]" />

          <p className="min-w-0 break-words text-[11px] leading-5 text-[#98a2b3] sm:text-[12px]">
            <span className="font-semibold">Last updated:</span>{" "}
            {formatDateTime(bp.updated_at || user.updated_at)}
          </p>
        </div>
      </section>

      <div className="mt-4 grid min-w-0 grid-cols-1 items-start gap-4 sm:mt-6 sm:gap-5 lg:grid-cols-2">
        <KycDetailsCard user={user} status={status} />
        <DocumentVerificationCard bp={bp} documents={documents} />
      </div>
    </div>
  );
};
