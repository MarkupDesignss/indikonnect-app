"use client";

import { Loader2, ChevronDown, ArrowLeftRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PendingPlacement } from "@/lib/redux/api/distributor/distributorPendingPlacementsApi";


// ==================================================

// PLACE ACTION CELL

// ==================================================

export function PlaceAction({
  member,

  isPlacing,

  onPlace,
}: {
  member: PendingPlacement;

  isPlacing: boolean;

  onPlace: (baId: string, side: 1 | 2) => void;
}) {
  const [open, setOpen] = useState(false);

  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || isPlacing) {
      setMenuPosition(null);

      return;
    }

    // Keep the menu attached to the Place button even when the table scrolls.

    // Rendering through a portal prevents the table's overflow-x-auto from clipping it.

    const MENU_WIDTH = 144;

    const MENU_HEIGHT = 84;

    const VIEWPORT_GAP = 8;

    const updateMenuPosition = () => {
      const trigger = triggerRef.current;

      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();

      const menuWidth = menuRef.current?.offsetWidth || MENU_WIDTH;

      const menuHeight = menuRef.current?.offsetHeight || MENU_HEIGHT;

      const maxLeft = Math.max(
        VIEWPORT_GAP,
        window.innerWidth - menuWidth - VIEWPORT_GAP,
      );

      const left = Math.max(
        VIEWPORT_GAP,
        Math.min(rect.right - menuWidth, maxLeft),
      );

      const spaceBelow = window.innerHeight - rect.bottom;

      const openAbove =
        spaceBelow < menuHeight + VIEWPORT_GAP &&
        rect.top > menuHeight + VIEWPORT_GAP;

      const preferredTop = openAbove
        ? rect.top - menuHeight - 4
        : rect.bottom + 4;

      const maxTop = Math.max(
        VIEWPORT_GAP,
        window.innerHeight - menuHeight - VIEWPORT_GAP,
      );

      const top = Math.max(VIEWPORT_GAP, Math.min(preferredTop, maxTop));

      setMenuPosition({ top, left });
    };

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);

    // Capture scroll events from the table and other scrollable containers too.

    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);

      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, isPlacing]);

  const placeMember = (side: 1 | 2) => {
    setOpen(false);

    setMenuPosition(null);

    onPlace(member.ba_id, side);
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}

        type="button"

        onClick={() => setOpen((value) => !value)}

        disabled={isPlacing}

        aria-expanded={open}

        aria-haspopup="menu"

        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e5e9ef] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#3955A6] transition-colors hover:bg-[#f7f8fa] disabled:opacity-50"
      >
        {isPlacing ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <ArrowLeftRight size={12} />
        )}
        Place
        <ChevronDown
          size={12}

          className={
            open ? "rotate-180 transition-transform" : "transition-transform"
          }
        />
      </button>

      {open && !isPlacing && menuPosition && typeof document !== "undefined"
        ? createPortal(
            <>
              {/* Full-screen click-away layer; the menu is stacked above it. */}

              <button
                type="button"

                aria-label="Close placement menu"

                onClick={() => {
                  setOpen(false);

                  setMenuPosition(null);
                }}

                className="fixed inset-0 z-[2147483646] m-0 cursor-default border-0 bg-transparent p-0"
              />

              <div
                ref={menuRef}

                role="menu"

                style={{ top: menuPosition.top, left: menuPosition.left }}

                className="fixed z-[2147483647] w-36 overflow-hidden rounded-[10px] border border-[#e5e9ef] bg-white shadow-[0_8px_24px_-10px_rgba(16,24,40,0.2)]"
              >
                <button
                  type="button"

                  role="menuitem"

                  onClick={() => placeMember(1)}

                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[11px] font-semibold text-[#344054] hover:bg-[#f7f8fa]"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#eaf7f0] text-[9px] font-black text-[#18794e]">
                    L
                  </span>
                  Place Left
                </button>

                <button
                  type="button"

                  role="menuitem"

                  onClick={() => placeMember(2)}

                  className="flex w-full items-center gap-2 border-t border-[#f0f2f5] px-3 py-2.5 text-left text-[11px] font-semibold text-[#344054] hover:bg-[#f7f8fa]"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#eceffb] text-[9px] font-black text-[#3955A6]">
                    R
                  </span>
                  Place Right
                </button>
              </div>
            </>,

            document.body,
          )
        : null}
    </div>
  );
}
