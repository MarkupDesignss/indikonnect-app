"use client";

import { X, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { CancelModalProps, ModalShell, OrderLinesPreview } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";
import { readCaughtMessage } from "@/lib/utils/readCaughtMessage";



export const CancelModal = ({
  isOpen,
  onClose,
  lines,
  reference,
  onSubmit,
  isUploading,
}: CancelModalProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError("");

    if (reason.trim().length < 10) {
      return setError("Please provide a valid reason (min 10 characters).");
    }

    setIsSubmitting(true);

    try {
      await onSubmit(reason.trim());

      onClose();
    } catch (err: unknown) {
      setError(readCaughtMessage(err, "data", "message") || readCaughtMessage(err, "message") || "Failed to cancel order.");

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
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FEF2F2]">
            <X className="h-4 w-4 text-[#DC2626]" />
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#171717]">
              Cancel Order
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

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
          <p className="text-[11px] leading-4 text-[#B24C4C]">
            <strong>Warning:</strong> All {lines.length} cancellable item
            {lines.length === 1 ? "" : "s"} of this order will be cancelled.
            This action cannot be undone.
          </p>
        </div>

        <OrderLinesPreview lines={lines} />

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-black">
            Reason for Cancellation <span className="text-[#B24C4C]">*</span>
          </label>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please tell us why you want to cancel..."
            maxLength={500}
            disabled={isSubmitting}
            className="min-h-[100px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-3 text-[12px] text-black outline-none focus:border-[#999999]"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
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
            Keep Order
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-1.5 rounded-[6px] border border-[#DC2626] bg-[#DC2626] px-4 py-2 text-[11px] font-medium text-white disabled:opacity-50"
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="h-3.5 w-3.5" />
                Cancel Order
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
