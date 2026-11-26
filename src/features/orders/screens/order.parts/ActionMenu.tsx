"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { MAX_Z, MENU_ITEM_HEIGHT, MENU_WIDTH, MenuAction } from "@/features/orders/screens/order.parts/support";


export function ActionMenu({
  actions,
  title = "Actions",
}: {
  actions: MenuAction[];
  title?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    openUp: false,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuHeight = Math.max(actions.length, 1) * MENU_ITEM_HEIGHT + 8;

  const updateCoords = () => {
    if (!buttonRef.current) return;

    setIsMobile(window.innerWidth < 640);

    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < menuHeight + 16 && spaceAbove > spaceBelow;

    let left = rect.right - MENU_WIDTH;
    if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8;
    }
    if (left < 8) left = 8;

    setCoords({
      top: rect.bottom + 6,
      bottom: window.innerHeight - rect.top + 6,
      left,
      openUp,
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) updateCoords();
    setIsOpen((v) => !v);
  };

  useEffect(() => {
    if (!isOpen) return;

    const onScrollOrResize = () => updateCoords();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    document.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, menuHeight]);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [isOpen]);

  // Lock body scroll while mobile bottom sheet is open
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, isMobile]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const renderActions = () =>
    actions.length === 0 ? (
      <div className="px-4 py-3 text-[12px] text-[#98a2b3]">
        No actions available
      </div>
    ) : (
      actions.map((a) => (
        <button
          key={a.key}
          type="button"
          onClick={() => handleAction(a.onClick)}
          className={`flex w-full items-center gap-3 px-4 text-left text-[13px] font-medium transition-colors ${
            a.danger
              ? "text-[#DC2626] hover:bg-[#FEF2F2]"
              : "text-[#344054] hover:bg-[#F5F7FA]"
          }`}
          style={{ height: MENU_ITEM_HEIGHT }}
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            {a.icon}
          </span>
          <span className="truncate">{a.label}</span>
        </button>
      ))
    );

  const menu =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0"
            style={{ zIndex: MAX_Z, isolation: "isolate" }}
          >
            {isMobile ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsOpen(false)}
                />

                <motion.div
                  ref={menuRef}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ type: "tween", duration: 0.22 }}
                  className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-[20px] bg-white pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-12px_40px_rgba(16,24,40,0.25)]"
                >
                  <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-[#D0D5DD]" />

                  <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">
                    {title}
                  </p>

                  <div className="py-1">{renderActions()}</div>

                  <div className="px-4 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="h-11 w-full rounded-xl border border-[#E4E7EC] bg-white text-[13px] font-semibold text-[#475467]"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.14 }}
                style={{
                  position: "fixed",
                  left: coords.left,
                  width: MENU_WIDTH,
                  ...(coords.openUp
                    ? { bottom: coords.bottom }
                    : { top: coords.top }),
                  transformOrigin: coords.openUp ? "bottom right" : "top right",
                }}
                className="overflow-hidden rounded-[12px] border border-[#E4E7EC] bg-white py-1 shadow-[0_16px_40px_rgba(16,24,40,0.22)]"
              >
                {renderActions()}
              </motion.div>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`flex h-9 w-9 items-center justify-center rounded-[9px] border transition-colors ${
          isOpen
            ? "border-[#0E1B3D]/30 bg-[#F2F4F7] text-[#0E1B3D]"
            : "border-[#E4E7EC] bg-white text-[#344054] hover:bg-[#F7F8FA]"
        }`}
      >
        <MoreVertical size={16} />
      </button>

      {menu}
    </div>
  );
}
