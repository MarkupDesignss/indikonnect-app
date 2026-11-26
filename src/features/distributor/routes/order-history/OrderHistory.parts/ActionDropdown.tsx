"use client";

import { Star, Loader2, MoreVertical, Truck, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ActionDropdownProps, EMERALD, canShowInvoice, normalizeStatus } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";


export const ActionDropdown = ({
  order,
  onReview,
  onViewReview,
  onTrack,
  onInvoiceDownload,
  isInvoiceLoading = false,
}: ActionDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUp: false,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 190;
  const MENU_OFFSET_X = 12;

  const updateCoords = () => {
    if (!buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();

    const menuHeight = 200;

    const spaceBelow = window.innerHeight - rect.bottom;

    const openUp = spaceBelow < menuHeight + 20;

    let left = rect.right + MENU_OFFSET_X - MENU_WIDTH;

    if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8;
    }

    if (left < 8) {
      left = 8;
    }

    setCoords({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left,
      width: MENU_WIDTH,
      openUp,
    });
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
    }

    setIsOpen((value) => !value);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = () => updateCoords();

    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = (e: MouseEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const deliveryStatus = normalizeStatus(order.delivery_status);
  const orderStatus = normalizeStatus(order.order_status);

  const hasReview = !!order.is_reviewed;

  const canReview =
    deliveryStatus === "delivered" || orderStatus === "delivered";

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const menu = isOpen
    ? createPortal(
      <AnimatePresence>
        <motion.div
          ref={menuRef}
          initial={{
            opacity: 0,
            y: coords.openUp ? 6 : -6,
            scale: 0.98,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: coords.openUp ? 6 : -6,
            scale: 0.98,
          }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: coords.width,
            transform: coords.openUp ? "translateY(-100%)" : "translateY(0)",
            zIndex: 9999,
          }}
          className="overflow-hidden rounded-[8px] border border-[#e5e9ef] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.15)]"
        >
          <button
            onClick={() => handleAction(onTrack)}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] hover:bg-[#f7f8fa]"
          >
            <Truck
              className="h-3.5 w-3.5 flex-shrink-0"
              style={{ color: EMERALD }}
            />

            <span>Track Shipment</span>
          </button>

          {canShowInvoice(order) && (
            <button
              type="button"
              disabled={isInvoiceLoading}
              onClick={() => handleAction(onInvoiceDownload)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] hover:bg-[#f7f8fa] disabled:opacity-50"
            >
              {isInvoiceLoading ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#3955A6]" />
              )}
              <span>{isInvoiceLoading ? "Loading invoice..." : "Download Invoice"}</span>
            </button>
          )}

          {canReview && (
            <button
              onClick={() =>
                handleAction(hasReview ? onViewReview : onReview)
              }
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] hover:bg-[#f7f8fa]"
            >
              <Star
                className={`h-3.5 w-3.5 flex-shrink-0 ${hasReview
                  ? "fill-[#B8935A] text-[#B8935A]"
                  : "text-[#B8935A]"
                  }`}
              />

              <span>{hasReview ? "View Review" : "Write Review"}</span>
            </button>
          )}
        </motion.div>
      </AnimatePresence>,
      document.body,
    )
    : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label="Actions"
        className={`flex h-8 w-8 items-center justify-center rounded-[6px] border transition-colors ${isOpen
          ? "border-[#0E1B3D]/30 bg-[#f7f8fa] text-[#0E1B3D]"
          : "border-[#e5e9ef] bg-white text-[#344054] hover:bg-[#f7f8fa]"
          }`}
      >
        <MoreVertical size={16} />
      </button>

      {menu}
    </div>
  );
};
