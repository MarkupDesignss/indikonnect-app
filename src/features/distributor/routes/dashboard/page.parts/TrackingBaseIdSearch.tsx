"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";


// --------------------------------------------------
// Searchable Base BA ID selector for Tracking Center
// --------------------------------------------------
export function TrackingBaseIdSearch({
  ids,
  value,
  onChange,
  loading,
}: {
  ids: string[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = ids.filter((id) =>
    id.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const disabled = loading || ids.length === 0;

  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-label="Select Base BA ID"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          setQuery("");
          setActiveIndex(0);
          setOpen((prev) => !prev);
        }}
        className="flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-[#D8E2F0] bg-white px-3 text-left text-[13px] font-semibold text-[#293447] outline-none focus:border-[#3768C6] focus:ring-4 focus:ring-[#3768C6]/10 disabled:cursor-not-allowed disabled:bg-[#F4F6F9]"
      >
        <Search size={15} className="shrink-0 text-[#8190A7]" />
        <span
          className={`min-w-0 flex-1 truncate ${!value ? "text-[#98A2B3]" : ""}`}
        >
          {value ||
            (loading
              ? "Loading accounts..."
              : ids.length
                ? "Search / select Base BA ID"
                : "No Base BA IDs available")}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-[#64748B] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[100] min-w-[240px] overflow-hidden rounded-xl border border-[#D8E2F0] bg-white shadow-[0_16px_40px_rgba(18,35,70,.17)]">
          <div
            id="tracking-base-ids"
            role="listbox"
            aria-label="Base BA IDs"
            className="max-h-[260px] overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length ? (
              filtered.map((id, index) => (
                <button
                  key={id}
                  type="button"
                  role="option"
                  aria-selected={value === id}
                  onClick={() => choose(id)}
                  className={`flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[12px] font-semibold transition ${activeIndex === index ? "bg-[#EFF5FF]" : ""}`}
                >
                  <span className="truncate text-[#293447]">{id}</span>
                  {value === id && (
                    <Check size={15} className="shrink-0 text-[#2A7E60]" />
                  )}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-center text-[12px] text-[#8793A5]">
                No matching Base BA ID
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
