"use client";

import { MoreVertical, Eye, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ActionDropdownProps, EMERALD, INDIGO, isBuybackEnabled, normalizeStatus } from "@/features/distributor/routes/buy-back/BuyBack.parts/support";


export const ActionDropdown = ({
  order,
  onView,
  onBuyback,
  registrationBuybackEligible,
  displayStatus,
}: ActionDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUp: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    openUp: false,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 180;
  const MENU_OFFSET_X = 12;

  const normalizedStatus = normalizeStatus(
    displayStatus ?? order.delivery_status,
  );

  const isDelivered = normalizedStatus === "delivered";

  const buybackEnabled = isBuybackEnabled(order);

  const showBuybackOption =
    isDelivered && buybackEnabled && registrationBuybackEligible;

  const updateCoords = () => {
    if (!buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();

    const menuHeight = showBuybackOption ? 100 : 60;

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

    setIsOpen((v) => !v);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handler = () => {
      updateCoords();
    };

    window.addEventListener("scroll", handler, true);

    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("scroll", handler, true);

      window.removeEventListener("resize", handler);
    };
  }, [isOpen, showBuybackOption]);

  useEffect(() => {
    if (!isOpen) return;

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
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: coords.openUp ? 6 : -6,
              scale: 0.98,
            }}
            transition={{
              duration: 0.15,
            }}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              transform: coords.openUp ? "translateY(-100%)" : "translateY(0)",
              zIndex: 9999,
            }}
            className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-[0_14px_40px_rgba(0,0,0,0.12)]"
          >
            <button
              onClick={() => handleAction(onView)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
            >
              <Eye
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{
                  color: INDIGO,
                }}
              />

              <span className="truncate">View</span>
            </button>

            {showBuybackOption && (
              <button
                onClick={() => handleAction(onBuyback)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
              >
                <RotateCcw
                  className="h-3.5 w-3.5 flex-shrink-0"
                  style={{
                    color: EMERALD,
                  }}
                />

                <span className="truncate">Buy Back</span>
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
        className={`flex h-9 w-9 items-center justify-center rounded-[9px] border transition-all duration-150 ${
          isOpen
            ? "border-neutral-900/25 bg-[#f7f8fa] text-neutral-950"
            : "border-[#e5e9ef] bg-white text-[#344054] hover:bg-[#f7f8fa]"
        }`}
      >
        <MoreVertical size={16} />
      </button>

      {menu}
    </div>
  );
};
