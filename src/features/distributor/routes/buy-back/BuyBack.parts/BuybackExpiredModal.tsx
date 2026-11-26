"use client";

import { X, AlertCircle, Ban, CalendarX } from "lucide-react";
import { BuybackExpiredModalProps } from "@/features/distributor/routes/buy-back/BuyBack.parts/support";
import { ModalShell } from "@/features/distributor/routes/buy-back/BuyBack.parts/ModalShell";


export const BuybackExpiredModal = ({
  isOpen,
  onClose,
  onContact,
}: BuybackExpiredModalProps) => {
  if (!isOpen) return null;

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
      <div className="border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-[#FBF3E4]">
              <CalendarX className="h-4 w-4 text-[#A9711F]" />
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
                Buyback Window Expired
              </h3>

              <p className="mt-0.5 text-[10px] text-[#888888] sm:text-[11px]">
                30-day registration window
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="rounded-[8px] border border-[#F3E2C7] bg-[#FDF9F1] p-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#A9711F]" />

            <div>
              <p className="text-[11.5px] leading-5 text-[#6B4E1F]">
                The 30-day buyback window from your registration completion date
                has expired. You can no longer initiate a new buyback request
                from here.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#E6E6E4] bg-white px-5 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] hover:text-[#171717]"
        >
          Close
        </button>

        <button
          type="button"
          onClick={onContact}
          className="flex items-center gap-1.5 rounded-[6px] border border-black bg-black px-4 py-2 text-[11px] font-medium text-white transition hover:bg-neutral-800"
        >
          <Ban className="h-3.5 w-3.5" />
          Contact Admin
        </button>
      </div>
    </ModalShell>
  );
};
