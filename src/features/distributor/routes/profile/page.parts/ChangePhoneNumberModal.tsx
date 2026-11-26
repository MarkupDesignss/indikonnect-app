"use client";

import { Phone, ShieldCheck, X } from "lucide-react";
import { type FormEvent } from "react";
import { GhostButton, MAX_PHONE_CHANGE_REASON_WORDS, MIN_PHONE_CHANGE_REASON_CHARACTERS, SaveButton, getWordCount, labelClass } from "@/features/distributor/routes/profile/page.parts/support";


export function ChangePhoneNumberModal({
  reason,
  setReason,
  error,
  setError,
  loading,
  onClose,
  onSubmit,
}: {
  reason: string;
  setReason: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  loading: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/55 p-3 backdrop-blur-[4px] sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-phone-title"
    >
      <div className="relative my-auto w-full max-w-[480px] overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_28px_90px_-24px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#EFEFF1] px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F2F2F3] text-[#141414]">
              <Phone size={19} />
            </span>
            <div className="min-w-0">
              <h2
                id="change-phone-title"
                className="text-[17px] font-bold tracking-[-0.02em] text-[#1B1B1B]"
              >
                Change Phone Number
              </h2>
              <p className="text-[11.5px] text-[#8A8E97]">
                Tell the admin why you want to change your phone number.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close popup"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
        >
          <div className="rounded-[10px] border border-[#E8E9EC] bg-[#fafafa] p-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-[#141414]"
              />
              <p className="text-[11px] leading-5 text-[#667085]">
                Your request will be sent to the admin for review. Your
                registered phone number will not change until the request is
                approved and completed.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="phone-change-reason" className={labelClass}>
              Reason for Change
              <span className="ml-0.5 text-red-500">*</span>
            </label>

            <textarea
              id="phone-change-reason"
              rows={4}
              autoComplete="off"
              value={reason}
              onChange={(event) => {
                const nextValue = event.target.value;
                const words = nextValue.trim()
                  ? nextValue.trim().split(/\s+/)
                  : [];

                if (words.length > MAX_PHONE_CHANGE_REASON_WORDS) {
                  setReason(
                    words.slice(0, MAX_PHONE_CHANGE_REASON_WORDS).join(" "),
                  );
                  setError("Maximum 150 words are allowed.");
                  return;
                }

                setReason(nextValue);
                setError("");
              }}
              placeholder="Enter reason"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "phone-reason-error" : undefined}
              className={`box-border min-h-[110px] min-w-0 w-full resize-y rounded-[10px] border border-[#E8E9EC] bg-[#F8F8F9] px-3.5 py-3 text-[13px] leading-5 text-[#4B4D56] outline-none placeholder:text-[#8A8E97] transition-all focus:border-[#141414] focus:bg-white focus:ring-2 focus:ring-[#141414]/10 sm:px-[14px] ${
                error ? "border-red-500 ring-2 ring-red-500/10" : ""
              }`}
            />

            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
              {error ? (
                <p
                  id="phone-reason-error"
                  className="text-[10.5px] text-red-500"
                >
                  {error}
                </p>
              ) : (
                <p className="text-[10.5px] text-[#8A8E97]">
                  Minimum 10 characters required.
                </p>
              )}

              <span
                className={`ml-auto shrink-0 text-[10.5px] ${
                  reason.trim().length >= MIN_PHONE_CHANGE_REASON_CHARACTERS
                    ? "text-[#1f9d6b]"
                    : "text-[#8A8E97]"
                }`}
              >
                {getWordCount(reason)}/{MAX_PHONE_CHANGE_REASON_WORDS} words
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[#EFEFF1] pt-4 sm:flex-row sm:justify-end">
            <GhostButton text="Cancel" onClick={onClose} />
            <SaveButton
              text="Send Request"
              type="submit"
              loading={loading}
              disabled={
                reason.trim().length < MIN_PHONE_CHANGE_REASON_CHARACTERS ||
                getWordCount(reason) > MAX_PHONE_CHANGE_REASON_WORDS
              }
            />
          </div>
        </form>
      </div>
    </div>
  );
}
