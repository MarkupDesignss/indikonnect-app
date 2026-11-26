"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { SORT_LABELS, SortOption } from "@/features/products/screens/product.parts/support";


/* -------------------------------------------------------------------------- */
/* Custom Sort Dropdown                                                       */
/* -------------------------------------------------------------------------- */

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  const options = Object.keys(SORT_LABELS) as SortOption[];

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedIndex = Math.max(0, options.indexOf(value));

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const choose = (option: SortOption) => {
    onChange(option);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (
      !open &&
      (event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " ")
    ) {
      event.preventDefault();
      setActive(selectedIndex);
      setOpen(true);
      return;
    }

    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (active >= 0) choose(options[active]);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full" onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort products"
        onClick={() => {
          setActive(selectedIndex);
          setOpen((v) => !v);
        }}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-all focus-visible:outline-none ${
          open
            ? "border-[#111111] shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
            : "border-[#e5e1dc] hover:border-[#111111]"
        }`}
      >
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[.08em] text-[#8a8f98]">
            Sort by
          </span>

          <span className="truncate text-[14px] font-semibold text-[#111111]">
            {SORT_LABELS[value]}
          </span>
        </span>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="shrink-0 text-[#111111]"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 origin-top overflow-hidden rounded-xl border border-[#eae7e1] bg-white p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
          >
            {options.map((option, index) => {
              const isSelected = option === value;
              const isActive = index === active;

              return (
                <li
                  key={option}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
                    isActive ? "bg-[#f4f2ee]" : ""
                  } ${
                    isSelected ? "font-semibold text-black" : "text-[#454545]"
                  }`}
                >
                  {SORT_LABELS[option]}

                  {isSelected && <Check size={16} />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
