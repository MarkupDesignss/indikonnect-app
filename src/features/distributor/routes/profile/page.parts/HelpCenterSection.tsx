"use client";

import { Phone, X, Mail, HelpCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "@/lib/slices/toastSlice";
import { useCreateCorrectionRequestMutation, CorrectionRequestType } from "@/lib/redux/api/distributor/userDashboardApi";
import { CorrectionRequest, GhostButton, MAX_PHONE_CHANGE_REASON_WORDS, MIN_PHONE_CHANGE_REASON_CHARACTERS, SaveButton, SectionHeader, collectCorrectionRequests, getErrorMessage, getWordCount, labelClass, sectionClass } from "@/features/distributor/routes/profile/page.parts/support";


// ============================================
// FIXED HELP CENTER SECTION
// ============================================

export function HelpCenterSection({ user }: { user: any }) {
  const dispatch = useDispatch();

  const [createCorrectionRequest, { isLoading }] =
    useCreateCorrectionRequestMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] =
    useState<CorrectionRequestType>("phone_request");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // ✅ FIX: flatten every possible API shape into a clean list.
  // `latest_correction_request` is an object keyed by type
  // ({ phone: {...}, email: {...} }), not a single request.
  const allRequests: CorrectionRequest[] = collectCorrectionRequests(user);

  const getLatestRequestForType = (type: string) =>
    allRequests.find((req) => req?.type === type) ?? null;

  const latestPhoneRequest = getLatestRequestForType("phone_request");
  const latestEmailRequest = getLatestRequestForType("email_request");

  const isLocked = (request: CorrectionRequest | null) => {
    const status = request?.status?.toLowerCase();
    return status === "pending" || status === "approved";
  };

  const isPhoneLocked = isLocked(latestPhoneRequest);
  const isEmailLocked = isLocked(latestEmailRequest);

  // ✅ FIX: if both are locked, don't let the modal open at all.
  const bothLocked = isPhoneLocked && isEmailLocked;

  const handleOpen = () => {
    setReason("");
    setError("");

    if (isPhoneLocked && isEmailLocked) {
      dispatch(
        showToast({
          message:
            "Both phone and email requests are already pending or approved. Please wait for admin review.",
          type: "info",
        }),
      );
      return;
    }

    // Auto-select the first unlocked type.
    if (!isPhoneLocked) {
      setRequestType("phone_request");
    } else if (!isEmailLocked) {
      setRequestType("email_request");
    } else {
      setRequestType("phone_request");
    }

    setIsModalOpen(true);
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedReason = reason.trim();

    if (trimmedReason.length < MIN_PHONE_CHANGE_REASON_CHARACTERS) {
      setError("Please enter at least 10 characters.");
      return;
    }

    if (getWordCount(trimmedReason) > MAX_PHONE_CHANGE_REASON_WORDS) {
      setError("Reason cannot exceed 150 words.");
      return;
    }

    // Strict check before submit.
    const isCurrentTypeLocked =
      requestType === "phone_request" ? isPhoneLocked : isEmailLocked;

    if (isCurrentTypeLocked) {
      const message = `A ${
        requestType === "phone_request" ? "phone" : "email"
      } request is already pending or approved.`;
      setError(message);
      dispatch(showToast({ message, type: "error" }));
      return;
    }

    try {
      const response = await createCorrectionRequest({
        type: requestType,
        reason: trimmedReason,
      }).unwrap();

      if (response?.success === false || response?.status === false) {
        const message = response.message || "Unable to send request.";
        setError(message);
        dispatch(showToast({ message, type: "error" }));
        return;
      }

      dispatch(
        showToast({
          message: response?.message || "Request sent successfully.",
          type: "success",
        }),
      );

      handleClose();
    } catch (err: unknown) {
      const message = getErrorMessage(
        err,
        "Something went wrong while sending the request.",
      );
      setError(message);
      dispatch(showToast({ message, type: "error" }));
    }
  };

  return (
    <section className={`${sectionClass} mt-5`}>
      <SectionHeader
        title="Help Center"
        subtitle="Raise a request to update your contact details"
      />

      {/* Status Display */}
      <div className="mb-4 space-y-3">
        {/* Phone Status */}
        {latestPhoneRequest && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[#E2EAF4] bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-[#52647E]" />
              <span className="text-[13px] font-semibold text-[#334155]">
                Phone Number Request
              </span>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                latestPhoneRequest.status === "pending"
                  ? "bg-[#F8F1E4] text-[#B8935A]"
                  : latestPhoneRequest.status === "approved"
                    ? "bg-[#EAF7F0] text-[#1f9d6b]"
                    : latestPhoneRequest.status === "rejected"
                      ? "bg-[#FEF3F2] text-[#d92d20]"
                      : "bg-[#F5F5F5] text-[#141414]"
              }`}
            >
              {latestPhoneRequest.status}
            </span>
          </div>
        )}

        {/* Email Status */}
        {latestEmailRequest && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[#E2EAF4] bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#52647E]" />
              <span className="text-[13px] font-semibold text-[#334155]">
                Email Address Request
              </span>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                latestEmailRequest.status === "pending"
                  ? "bg-[#F8F1E4] text-[#B8935A]"
                  : latestEmailRequest.status === "approved"
                    ? "bg-[#EAF7F0] text-[#1f9d6b]"
                    : latestEmailRequest.status === "rejected"
                      ? "bg-[#FEF3F2] text-[#d92d20]"
                      : "bg-[#F5F5F5] text-[#141414]"
              }`}
            >
              {latestEmailRequest.status}
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-[#64748B]">
          Need to change your registered phone number or email address? You can
          raise a request here.
        </p>

        <button
          type="button"
          onClick={handleOpen}
          disabled={bothLocked}
          className="inline-flex min-h-[43px] shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#2957A8] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#1D468D] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10 disabled:cursor-not-allowed disabled:bg-[#DDDEE1] disabled:text-[#888B91]"
        >
          <HelpCircle size={15} />
          {bothLocked ? "All requests pending" : "Open Help Center"}
        </button>
      </div>

      {isModalOpen && !bothLocked && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/55 p-3 backdrop-blur-[4px] sm:p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative my-auto w-full max-w-[480px] overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_28px_90px_-24px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#EFEFF1] px-5 py-5 sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F2F2F3] text-[#141414]">
                  <HelpCircle size={19} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#1B1B1B]">
                    Help Center Request
                  </h2>
                  <p className="text-[11.5px] text-[#8A8E97]">
                    Select what you want to change and provide a reason.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
            >
              {/* Type Selector */}
              <div>
                <label className={labelClass}>
                  What do you want to change?
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      !isPhoneLocked && setRequestType("phone_request")
                    }
                    disabled={isPhoneLocked}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                      requestType === "phone_request"
                        ? "border-[#2957A8] bg-[#F0F5FF] text-[#2957A8] ring-1 ring-[#2957A8]"
                        : "border-[#E8E9EC] bg-white text-[#667085] hover:bg-[#F8F9FA]"
                    } ${
                      isPhoneLocked ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <Phone
                      size={20}
                      className={
                        requestType === "phone_request"
                          ? "text-[#2957A8]"
                          : "text-[#8A8E97]"
                      }
                    />
                    <span className="text-[12px] font-bold">
                      Phone Number
                    </span>
                    {isPhoneLocked && (
                      <span className="text-[9px] font-bold text-red-500">
                        Locked
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      !isEmailLocked && setRequestType("email_request")
                    }
                    disabled={isEmailLocked}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                      requestType === "email_request"
                        ? "border-[#2957A8] bg-[#F0F5FF] text-[#2957A8] ring-1 ring-[#2957A8]"
                        : "border-[#E8E9EC] bg-white text-[#667085] hover:bg-[#F8F9FA]"
                    } ${
                      isEmailLocked ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <Mail
                      size={20}
                      className={
                        requestType === "email_request"
                          ? "text-[#2957A8]"
                          : "text-[#8A8E97]"
                      }
                    />
                    <span className="text-[12px] font-bold">
                      Email Address
                    </span>
                    {isEmailLocked && (
                      <span className="text-[9px] font-bold text-red-500">
                        Locked
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label htmlFor="help-reason" className={labelClass}>
                  Reason for Change{" "}
                  <span className="ml-0.5 text-red-500">*</span>
                </label>

                <textarea
                  id="help-reason"
                  rows={4}
                  value={reason}
                  onChange={(e) => {
                    const val = e.target.value;

                    if (getWordCount(val) > MAX_PHONE_CHANGE_REASON_WORDS) {
                      setReason(
                        val
                          .trim()
                          .split(/\s+/)
                          .slice(0, MAX_PHONE_CHANGE_REASON_WORDS)
                          .join(" "),
                      );
                      setError("Maximum 150 words are allowed.");
                      return;
                    }

                    setReason(val);
                    setError("");
                  }}
                  placeholder={`Enter reason for changing your ${
                    requestType === "phone_request" ? "phone number" : "email"
                  }`}
                  className={`box-border min-h-[110px] min-w-0 w-full resize-y rounded-[10px] border border-[#E8E9EC] bg-[#F8F8F9] px-3.5 py-3 text-[13px] leading-5 text-[#4B4D56] outline-none placeholder:text-[#8A8E97] transition-all focus:border-[#141414] focus:bg-white focus:ring-2 focus:ring-[#141414]/10 sm:px-[14px] ${
                    error ? "border-red-500 ring-2 ring-red-500/10" : ""
                  }`}
                />

                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                  {error ? (
                    <p className="text-[10.5px] text-red-500">{error}</p>
                  ) : (
                    <p className="text-[10.5px] text-[#8A8E97]">
                      Minimum 10 characters required.
                    </p>
                  )}

                  <span
                    className={`ml-auto shrink-0 text-[10.5px] ${
                      reason.trim().length >= 10
                        ? "text-[#1f9d6b]"
                        : "text-[#8A8E97]"
                    }`}
                  >
                    {getWordCount(reason)}/{MAX_PHONE_CHANGE_REASON_WORDS} words
                  </span>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#EFEFF1] pt-4 sm:flex-row sm:justify-end">
                <GhostButton text="Cancel" onClick={handleClose} />
                <SaveButton
                  text="Submit Request"
                  type="submit"
                  loading={isLoading}
                  disabled={
                    (requestType === "phone_request"
                      ? isPhoneLocked
                      : isEmailLocked) ||
                    reason.trim().length <
                      MIN_PHONE_CHANGE_REASON_CHARACTERS ||
                    getWordCount(reason) > MAX_PHONE_CHANGE_REASON_WORDS
                  }
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
