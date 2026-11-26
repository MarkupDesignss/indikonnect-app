"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, ArrowRight } from "lucide-react";


/* =========================================================
   EMPTY CART DRAWER
========================================================= */

export const EmptyCartDrawer = ({
  isOpen,
  onClose,
  onContinueShopping,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContinueShopping: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="empty-cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[2000] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            key="empty-cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
            className="fixed right-0 top-0 z-[2001] flex h-full w-full max-w-[420px] flex-col border-l border-[#E4E4E2] bg-white font-lato shadow-[-18px_0_60px_rgba(0,0,0,0.14)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E6E6E4] px-6 py-5">
              <h3 className="text-[18px] font-semibold text-[#171717]">
                Your Cart
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4E4E2] bg-white text-[#111111] transition-all duration-200 hover:bg-[#F4F4F3]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#F1F1F0]">
                <ShoppingBag className="h-10 w-10 text-[#111111]" />
              </div>
              <h4 className="mb-2 text-[20px] font-semibold text-[#171717]">
                Your cart is empty
              </h4>
              <p className="text-[13px] leading-relaxed text-[#888888]">
                Looks like you haven&apos;t added anything yet. Please continue
                shopping to discover our latest collections.
              </p>
            </div>
            <div className="flex flex-col gap-3 border-t border-[#E6E6E4] bg-white px-6 py-5">
              <button
                type="button"
                onClick={onContinueShopping}
                className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-[#111111] px-4 py-3 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-[#292929]"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-[7px] border border-[#D7D7D5] bg-white px-4 py-3 text-[12px] font-medium text-[#555555] transition-all duration-200 hover:bg-[#FAFAF9]"
              >
                Cancel
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
