"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, AlertCircle } from "lucide-react";
import { DeleteConfirmModalProps } from "@/features/profile/components/AddressComponent.parts/support";


export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  addressName,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-sans"
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF2F2]">
                  <AlertCircle className="h-5 w-5 text-[#B24C4C]" />
                </div>

                <h3 className="mb-1 text-[16px] font-semibold text-[#171717]">
                  Remove this address?
                </h3>
                <p className="text-[12px] text-[#888888]">
                  You&apos;re about to remove
                </p>
                <p className="mb-4 text-[12px] font-medium text-[#171717]">
                  &ldquo;{addressName}&rdquo;
                </p>

                <div className="mb-4 h-px w-full bg-[#E6E6E4]" />

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2.5 text-[11px] font-medium text-[#555555] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9]"
                  >
                    Keep it
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#B24C4C] px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#9C3F3F] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
