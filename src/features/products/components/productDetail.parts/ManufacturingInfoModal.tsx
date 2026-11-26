"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ProductDetailViewModel } from './useProductDetail';


export default function ManufacturingInfoModal({ showManufacturingInfo, setShowManufacturingInfo, manufacturingInfo }: Pick<ProductDetailViewModel, "showManufacturingInfo" | "setShowManufacturingInfo" | "manufacturingInfo">) {
  return (
<AnimatePresence>
        {showManufacturingInfo && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4"
            onClick={() => setShowManufacturingInfo(false)}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 16,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 16,
                scale: 0.97,
              }}
              transition={{
                duration: 0.2,
              }}
              className="w-full max-w-lg overflow-hidden rounded-[14px] bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E8E8E8] px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#999]">
                    Product Information
                  </p>

                  <h3 className="mt-1 text-[20px] font-semibold text-[#111] sm:text-[22px]">
                    Manufacturing Details
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowManufacturingInfo(false)}
                  className="rounded-full p-2 text-[#777] transition hover:bg-[#F3F3F3] hover:text-[#111]"
                  aria-label="Close manufacturing details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
                <div className="rounded-[9px] border border-[#E7E7E7] bg-[#FAFAFA] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#999]">
                    Country Of Manufacture
                  </p>

                  <p className="mt-1.5 text-[14px] font-semibold leading-6 text-[#222]">
                    {manufacturingInfo.country}
                  </p>
                </div>

                <div className="rounded-[9px] border border-[#E7E7E7] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#999]">
                    Manufactured By
                  </p>

                  <p className="mt-1.5 text-[13px] leading-6 text-[#444]">
                    {manufacturingInfo.manufacturedBy}
                  </p>
                </div>

                <div className="rounded-[9px] border border-[#E7E7E7] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#999]">
                    Marketed By
                  </p>

                  <p className="mt-1.5 text-[13px] leading-6 text-[#444]">
                    {manufacturingInfo.marketedBy}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#E8E8E8] px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => setShowManufacturingInfo(false)}
                  className="h-10 w-full rounded-[7px] bg-[#111] text-[12px] font-bold uppercase tracking-wide text-white transition hover:bg-[#2A2A2A]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
