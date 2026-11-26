"use client";

import { HandCoins, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BankedTcSide } from "@/features/distributor/routes/dashboard/page.parts/support";


// --------------------------------------------------
// BANKED TC PLACEMENT POPUP
// --------------------------------------------------

export function BankedTcModal({
  isOpen,
  availableCount,
  isLoading,
  pendingSide,
  onClose,
  onSelectSide,
}: {
  isOpen: boolean;
  availableCount: number;
  isLoading: boolean;
  pendingSide: BankedTcSide | null;
  onClose: () => void;
  onSelectSide: (side: BankedTcSide) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && availableCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[4px]"
          onClick={() => !isLoading && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="banked-tc-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] overflow-hidden rounded-[22px] border border-[#E8E8E8] bg-white shadow-[0_30px_100px_rgba(0,0,0,.25)]"
          >
            <div className="border-b border-[#EBEBEB] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#171717] text-white">
                    <HandCoins size={20} />
                  </span>
                  <div>
                    <h3
                      id="banked-tc-title"
                      className="text-[18px] font-bold tracking-[-.035em] text-[#191919]"
                    >
                      Place Banked TC
                    </h3>
                    <p className="mt-1 text-[11px] text-[#888888]">
                      Choose the placement side for your banked TC
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  aria-label="Close placement dialog"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#E9E9E9] text-[#666666] disabled:opacity-50"
                >
                  <span className="text-[21px] leading-none">×</span>
                </button>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-[13px] border border-[#EBEBEB] bg-[#FAFAFA] px-4 py-3">
                <div>
                  <p className="text-[10px] font-medium text-[#828282]">
                    Available balance
                  </p>
                  <p className="text-[12px] font-semibold text-[#262626]">
                    Banked TC available for placement
                  </p>
                </div>
                <span className="dashboard-number text-[25px] font-bold text-[#191919]">
                  {availableCount}
                </span>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <p className="mb-3 text-[12px] font-semibold text-[#353535]">
                Select a leg to place TC
              </p>
              <div className="grid grid-cols-2 gap-3">
                {([1, 2] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    disabled={isLoading}
                    onClick={() => onSelectSide(side)}
                    className="group flex min-h-[134px] flex-col items-center justify-center rounded-[15px] border border-[#E5E7EB] bg-[#FAFAFB] px-3 py-4 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#607CDA] text-[16px] font-bold text-white">
                      {isLoading && pendingSide === side ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : side === 1 ? (
                        "L"
                      ) : (
                        "R"
                      )}
                    </span>
                    <span className="mt-3 text-[13px] font-bold text-[#252525]">
                      {side === 1 ? "Left leg" : "Right leg"}
                    </span>
                    <span className="mt-1 text-[10px] text-[#888888]">
                      Place on {side === 1 ? "left" : "right"} side
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-[11px] border border-[#EAEAEA] bg-[#FBFBFB] p-3">
                <Info size={15} className="mt-0.5 shrink-0 text-[#888888]" />
                <p className="text-[10.5px] leading-[18px] text-[#777777]">
                  Placement is submitted immediately. Please verify the correct
                  side before selecting.
                </p>
              </div>
              {isLoading && (
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#5F5F5F]">
                  <Loader2 size={14} className="animate-spin" />
                  Placing your TC...
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
