"use client";

import { Phone, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { CorrectionRequest, RED, SectionHeader, collectCorrectionRequests, formatApiDate, parseApiDate, sectionClass } from "@/features/distributor/routes/profile/page.parts/support";


export function PhoneChangeRequestCard({
  user,
  onClick,
  nextAllowedAt,
  canResubmit,
}: {
  user: any;
  onClick: () => void;
  nextAllowedAt?: string | null;
  canResubmit?: boolean;
}) {
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    setCurrentTime(Date.now());
    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const phoneRequests: CorrectionRequest[] = collectCorrectionRequests(
    user,
  ).filter((request) => request?.type === "phone_request");

  const latestRequest = phoneRequests[0] ?? null;
  const rawStatus = latestRequest?.status?.toLowerCase() ?? null;

  type UIState = "none" | "pending" | "approved" | "completed" | "rejected";

  const uiState: UIState =
    rawStatus === "pending"
      ? "pending"
      : rawStatus === "approved"
        ? "approved"
        : rawStatus === "completed"
          ? "completed"
          : rawStatus === "rejected"
            ? "rejected"
            : "none";

  const allowedTimestamp = parseApiDate(nextAllowedAt);

  const cooldownActive =
    currentTime !== null &&
    allowedTimestamp !== null &&
    currentTime < allowedTimestamp;

  const remainingMilliseconds =
    cooldownActive && currentTime !== null && allowedTimestamp !== null
      ? Math.max(0, allowedTimestamp - currentTime)
      : 0;

  const statusMeta: Record<
    Exclude<UIState, "none">,
    {
      label: string;
      color: string;
      bg: string;
      dot: string;
      description: string;
    }
  > = {
    pending: {
      label: "Pending",
      color: "#B8935A",
      bg: "#f8f1e4",
      dot: "#B8935A",
      description:
        "Your phone number change request has been submitted and is awaiting admin review.",
    },
    approved: {
      label: "Approved",
      color: "#1f9d6b",
      bg: "#eaf7f0",
      dot: "#1f9d6b",
      description:
        "Your request was approved. A verification link has been sent to your registered email. Please use it to complete the change.",
    },
    completed: {
      label: "Completed",
      color: "#141414",
      bg: "#f5f5f5",
      dot: "#141414",
      description: "Your phone number was changed successfully.",
    },
    rejected: {
      label: "Rejected",
      color: RED,
      bg: "#fef3f2",
      dot: RED,
      description:
        "Your phone number change request was rejected by the admin.",
    },
  };

  const meta = uiState !== "none" ? statusMeta[uiState] : null;

  const showChangeButton =
    currentTime !== null &&
    uiState !== "pending" &&
    uiState !== "approved" &&
    !cooldownActive &&
    canResubmit === true;

  const changeButtonLabel =
    uiState === "rejected"
      ? "Request Phone Change Again"
      : uiState === "completed"
        ? "Change Phone Number Again"
        : "Change Your Phone Number";

  const showCooldownSection =
    cooldownActive && uiState !== "pending" && uiState !== "approved";

  const showCombinedCard = meta !== null || showCooldownSection;

  return (
    <section className={`${sectionClass} mt-5`}>
      <SectionHeader
        title="Phone Number"
        subtitle="Phone number changes are reviewed by the admin."
      />

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8E97]">
            Registered phone number
          </p>
          <p className="mt-1 break-all text-[15px] font-bold text-[#253858]">
            {user?.phone || "Not available"}
          </p>
        </div>

        {showChangeButton && (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex min-h-[43px] shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#2957A8] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#1D468D] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
          >
            <Phone size={15} />
            {changeButtonLabel}
          </button>
        )}
      </div>

      {showCombinedCard && (
        <div
          className="mt-4 rounded-[10px] border px-3 py-3 sm:px-4"
          style={{
            backgroundColor: meta?.bg ?? "#fafafa",
            borderColor: meta ? `${meta.color}33` : "#e9edf2",
          }}
        >
          {meta && (
            <>
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.dot }}
                />
                <p
                  className="text-[11px] font-bold uppercase tracking-wide sm:text-[11.5px]"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </p>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-[#667085]">
                {meta.description}
              </p>
            </>
          )}

          {uiState === "rejected" && (
            <>
              {(latestRequest.rejected_at || latestRequest.updated_at) && (
                <p className="mt-2 text-[10.5px] text-[#8A8E97]">
                  Rejected on{" "}
                  {formatApiDate(
                    latestRequest.rejected_at || latestRequest.updated_at,
                  )}
                </p>
              )}
              {(latestRequest.rejected_reason || latestRequest.reason) && (
                <div className="mt-2.5 rounded-[12px] border border-[#d92d2033] bg-white/70 px-2.5 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8E97]">
                    Admin remark
                  </p>
                  <p className="mt-1 break-words text-[10.5px] leading-4 text-[#4B4D56]">
                    {latestRequest.rejected_reason || latestRequest.reason}
                  </p>
                </div>
              )}
            </>
          )}

          {(uiState === "pending" || uiState === "approved") &&
            latestRequest?.created_at && (
              <p className="mt-2 text-[10.5px] text-[#8A8E97]">
                Submitted on {formatApiDate(latestRequest.created_at)}
              </p>
            )}

          {showCooldownSection && (
            <>
              <div className="mt-3 flex items-start gap-2">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[#141414]"
                />
                <p className="text-[11px] leading-5 text-[#667085]">
                  You can submit another phone number change request after the
                  cooldown period ends.
                </p>
              </div>
              {nextAllowedAt && (
                <p className="mt-2.5 break-words text-[10.5px] text-[#667085]">
                  Next request available:{" "}
                  <span className="font-semibold text-[#141414]">
                    {formatApiDate(nextAllowedAt) || nextAllowedAt}
                  </span>
                </p>
              )}
            </>
          )}

          {uiState === "approved" && (
            <div className="mt-2.5 flex items-start gap-2 rounded-[12px] border border-[#1f9d6b33] bg-white/70 px-2.5 py-2">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-[#1f9d6b]"
              />
              <p className="text-[10.5px] leading-4 text-[#4B4D56]">
                A secure link has been sent to you. Please open it to change
                your phone number. If you didn't receive it, contact admin.
              </p>
            </div>
          )}

          {uiState === "completed" && (
            <p className="mt-2 text-[10.5px] text-[#8A8E97]">
              You may request another change when permitted.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
