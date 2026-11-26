"use client";

import { X, RotateCcw, MoreVertical, Undo2, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { OrderActionDropdownProps, getActiveReturnIds, getCancellableLines, getReturnableLines, getWithdrawCancelLines, isCancelReturnAllowed } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";


export const OrderActionDropdown = ({
  group,
  onReturn,
  onCancel,
  onWithdrawReturn,
  onWithdrawCancel,
}: OrderActionDropdownProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUp: false,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 210;

  const updateCoords = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const openUp = window.innerHeight - rect.bottom < 220;

    let left = rect.right - MENU_WIDTH;

    if (left < 8) left = 8;
    if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8;
    }

    setCoords({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left,
      width: MENU_WIDTH,
      openUp,
    });
  };

  const handleToggle = () => {
    if (!isOpen) updateCoords();
    setIsOpen((v) => !v);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handler = () => updateCoords();

    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return;

      setIsOpen(false);
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const canReturn = getReturnableLines(group.lines).length > 0;
  const canCancel = getCancellableLines(group.lines).length > 0;
  const canWithdrawReturn = getActiveReturnIds(group.lines).length > 0;
  const canWithdrawCancel = getWithdrawCancelLines(group.lines).length > 0;

  // is_cancel_return_allowed = false → Cancel / Return buttons hidden completely
  const permissionAllowed = group.lines.some(isCancelReturnAllowed);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const itemBase =
    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] disabled:cursor-not-allowed disabled:opacity-40";

  const menu = isOpen
    ? createPortal(
      <AnimatePresence>
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: coords.openUp ? 6 : -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: coords.openUp ? 6 : -6, scale: 0.98 }}
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
          {/* Before delivery → Cancel. After delivery → Return. */}
          {permissionAllowed && (canCancel || (!canCancel && !canReturn)) && (
            <button
              type="button"
              disabled={!canCancel}
              onClick={() => handleAction(onCancel)}
              className={`${itemBase} text-[#DC2626] hover:bg-[#FEF2F2]`}
            >
              <X className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Cancel Order</span>
            </button>
          )}

          {permissionAllowed && (canReturn || (!canCancel && !canReturn)) && (
            <button
              type="button"
              disabled={!canReturn}
              onClick={() => handleAction(onReturn)}
              className={`${itemBase} text-[#344054] hover:bg-[#f7f8fa]`}
            >
              <RotateCcw className="h-3.5 w-3.5 flex-shrink-0 text-[#EA580C]" />
              <span>Return Order</span>
            </button>
          )}

          {canWithdrawReturn && (
            <button
              type="button"
              onClick={() => handleAction(onWithdrawReturn)}
              className={`${itemBase} border-t border-[#f0f2f5] text-[#DC2626] hover:bg-[#FEF2F2]`}
            >
              <Undo2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Withdraw Return Request</span>
            </button>
          )}

          {canWithdrawCancel && (
            <button
              type="button"
              onClick={() => handleAction(onWithdrawCancel)}
              className={`${itemBase} border-t border-[#f0f2f5] text-[#B45309] hover:bg-[#FFFBEB]`}
            >
              <Undo2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Withdraw Cancel Request</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleAction(() => router.push("/contact/"))}
            className={`${itemBase} border-t border-[#f0f2f5] text-[#344054] hover:bg-[#f7f8fa]`}
          >
            <Info className="h-3.5 w-3.5 flex-shrink-0 text-[#3955A6]" />
            <span>Support</span>
          </button>
        </motion.div>
      </AnimatePresence>,
      document.body,
    )
    : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label="Order actions"
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
