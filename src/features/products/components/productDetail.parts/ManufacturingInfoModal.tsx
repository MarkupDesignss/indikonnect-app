
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Building2,
  Globe,
  Eye,
} from "lucide-react";

type ManufacturingInfo = {
  country?: string;
  manufacturedBy?: string;
  manufacturerAddress?: string;
  marketedBy?: string;
};

type Props = {
  showManufacturingInfo: boolean;
  setShowManufacturingInfo: (show: boolean) => void;
  manufacturingInfo?: ManufacturingInfo | null;
};

export default function ManufacturingInfoModal({
  showManufacturingInfo,
  setShowManufacturingInfo,
  manufacturingInfo,
}: Props) {
  const [portalReady, setPortalReady] = useState(false);

  const closeModal = () => {
    setShowManufacturingInfo(false);
  };

  // Client-side portal initialization
  useEffect(() => {
    setPortalReady(true);
  }, []);

  // Body scroll lock and Escape key
  useEffect(() => {
    if (!portalReady || !showManufacturingInfo) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowManufacturingInfo(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [portalReady, showManufacturingInfo, setShowManufacturingInfo]);

  const info = manufacturingInfo ?? {};

  const details = [
    {
      label: "Country Of Manufacture",
      value: info.country,
      icon: Globe,
    },
    {
      label: "Manufactured By",
      value: info.manufacturedBy,
      icon: Building2,
    },
    {
      label: "Manufacturer Address",
      value: info.manufacturerAddress,
      icon: MapPin,
    },
    {
      label: "Marketed By",
      value: info.marketedBy,
      icon: Building2,
    },
  ].filter(
    ({ value }) => String(value ?? "").trim().length > 0
  );

  const modalContent = (
    <AnimatePresence>
      {showManufacturingInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483647,
          }}
          className="flex items-center justify-center bg-black/55 px-4 py-5 backdrop-blur-[3px]"
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="manufacturing-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-[14px] bg-white shadow-2xl"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-[#EAEAEA] px-5 py-4 sm:px-6">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#999]">
                  <Eye className="h-4 w-4" />
                  Product Information
                </p>

                <h3
                  id="manufacturing-modal-title"
                  className="mt-1 text-[20px] font-semibold text-[#111] sm:text-[22px]"
                >
                  Manufacturer Details
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close manufacturer details"
                className="rounded-full p-2 text-[#777] transition hover:bg-[#F3F3F3] hover:text-[#111]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MANUFACTURER DETAILS */}
            <div className="max-h-[65vh] space-y-3 overflow-y-auto px-5 py-5 sm:px-6">
              {details.length > 0 ? (
                details.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-[9px] border border-[#E7E7E7] bg-[#FAFAFA] p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-[#888]" />

                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#999]">
                        {label}
                      </p>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-[13px] font-medium leading-6 text-[#292929]">
                      {value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-[#888]">
                  Manufacturer information is not available.
                </p>
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-[#EAEAEA] px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={closeModal}
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

  // Render modal directly inside document.body
  if (!portalReady) return null;

  return createPortal(modalContent, document.body);
}
