"use client";

import { X, AlertCircle, Loader2, Undo2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ModalShell, OrderLinesPreview, WithdrawModalProps } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";


export const WithdrawModal = ({
  isOpen,
  onClose,
  lines,
  reference,
  title,
  message,
  onSubmit,
  isUploading,
}: WithdrawModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit();
      onClose();
    } catch (err: any) {
      setError(
        err?.data?.message || err?.message || "Failed to withdraw request.",
      );

      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FFFBEB]">
            <Undo2 className="h-4 w-4 text-[#B45309]" />
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#171717]">
              {title}
            </h3>
            <p className="text-[10px] text-[#999999]">{reference}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          disabled={isSubmitting || isUploading}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-5">
        <div className="mb-4 rounded-[7px] border border-[#FDE68A] bg-[#FFFBEB] p-3">
          <p className="text-[11px] leading-4 text-[#B45309]">
            <strong>Note:</strong> {message}
          </p>
        </div>

        <OrderLinesPreview lines={lines} />

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />

            <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] disabled:opacity-50"
          >
            Keep Request
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-1.5 rounded-[6px] border border-[#B45309] bg-[#B45309] px-4 py-2 text-[11px] font-medium text-white disabled:opacity-50"
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Withdrawing...
              </>
            ) : (
              <>
                <Undo2 className="h-3.5 w-3.5" />
                Confirm Withdraw
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
