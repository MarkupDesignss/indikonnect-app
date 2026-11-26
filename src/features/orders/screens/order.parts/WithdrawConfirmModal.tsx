"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/features/orders/screens/order.parts/support";


/* ============================================================
   WITHDRAW CONFIRMATION MODAL (cancel + return share one shell)
============================================================ */

export function WithdrawConfirmModal({
  isOpen,
  order,
  isLoading,
  title,
  description,
  badgeLabel,
  note,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  order: any;
  isLoading: boolean;
  title: string;
  description: string;
  badgeLabel: string;
  note: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isLoading) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[14px] border border-[#E4E4E2] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.20)]"
          >
            <div className="border-b border-[#ECECE9] px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#FBF3E4]">
                    <AlertTriangle className="h-5 w-5 text-[#A9711F]" />
                  </div>

                  <div>
                    <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#171717]">
                      {title}
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-[#777777]">
                      {description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[7px] border border-[#E0E0DE] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="rounded-[9px] border border-[#E7E7E4] bg-[#FAFAF9] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#999999]">
                      Order Reference
                    </p>

                    <p className="mt-1 truncate text-[12px] font-semibold text-[#171717]">
                      {order?.order_reference || "N/A"}
                    </p>
                  </div>

                  <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[#EBD9B4] bg-[#FBF3E4] px-2.5 py-1 text-[9px] font-medium text-[#A9711F]">
                    <Clock className="h-3 w-3" />
                    {badgeLabel}
                  </span>
                </div>

                <div className="mt-3 border-t border-[#E9E9E6] pt-3">
                  <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#999999]">
                    Product
                  </p>

                  <p className="mt-1 truncate text-[12px] font-medium text-[#333333]">
                    {order?.product_name || "Order Item"}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#E9E9E6] pt-3">
                  <span className="text-[10px] text-[#888888]">
                    Item Amount
                  </span>

                  <span className="text-[13px] font-semibold text-[#171717]">
                    {formatPrice(
                      Number(order?.final_amount) ||
                        Number(order?.line_total) ||
                        Number(order?.amount_paid) ||
                        0,
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-[8px] border border-[#EFE2C6] bg-[#FFFBF2] px-3.5 py-3">
                <p className="text-[11px] leading-5 text-[#795F25]">{note}</p>
              </div>
            </div>

            <div className="border-t border-[#ECECE9] bg-white px-5 py-4">
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-[7px] border border-[#D9D9D6] bg-white px-4 py-2.5 text-[11px] font-medium text-[#555555] transition hover:bg-[#FAFAF9] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keep Request
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[7px] bg-[#A9711F] px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#8F5F18] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" />
                      {confirmLabel}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
