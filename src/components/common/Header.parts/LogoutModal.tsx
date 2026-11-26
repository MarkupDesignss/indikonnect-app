"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, LogOut as LogOutIcon, AlertCircle, Loader2 } from "lucide-react";


/* =========================================================
   LOGOUT MODAL
========================================================= */

export const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-lato"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-[10px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
              <div className="relative px-6 pb-5 pt-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F1F0]">
                  <LogOutIcon className="h-7 w-7 text-[#111111]" />
                </div>
                <h3 className="mb-2 text-[20px] font-semibold text-[#171717]">
                  Logout Confirmation
                </h3>
                <p className="text-[13px] leading-relaxed text-[#888888]">
                  Are you sure you want to logout? You&apos;ll need to login
                  again to access your account.
                </p>
              </div>
              <div className="mx-6 flex items-start gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#777777]" />
                <p className="text-[12px] leading-relaxed text-[#666666]">
                  Your session will be ended and you&apos;ll be redirected to
                  the current application home page.
                </p>
              </div>
              <div className="flex gap-3 border-t border-[#E6E6E4] bg-white px-6 py-5">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-[7px] border border-[#D7D7D5] bg-white px-4 py-3 text-[12px] font-medium text-[#555555] transition-all duration-200 hover:bg-[#FAFAF9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[7px] bg-[#111111] px-4 py-3 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
