"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TrackingSearchOption } from "@/features/distributor/routes/dashboard/page.parts/support";


export function TrackingSearchSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  disabled = false,
}: {
  options: TrackingSearchOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((option) => option.value === value);
  const filtered = options.filter((option) =>
    `${option.label} ${option.value} ${option.detail ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const choose = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={placeholder}
        disabled={disabled || options.length === 0}
        onClick={() => {
          setOpen((previous) => !previous);
          setQuery("");
          setActiveIndex(0);
        }}
        className="flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-[#D8E2F0] bg-white px-3 text-left text-[13px] font-semibold text-[#293447] outline-none focus:border-[#3768C6] focus:ring-4 focus:ring-[#3768C6]/10 disabled:cursor-not-allowed disabled:bg-[#F4F6F9]"
      >
        <Search size={15} className="shrink-0 text-[#8190A7]" />
        <span
          className={`min-w-0 flex-1 truncate ${!selected ? "text-[#98A2B3]" : ""}`}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-[#64748B] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[110] min-w-[240px] overflow-hidden rounded-xl border border-[#D8E2F0] bg-white shadow-[0_16px_40px_rgba(18,35,70,.17)]">
          <div className="border-b border-[#E8EDF5] p-2.5">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8795AA]"
              />
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded={open}
                aria-autocomplete="list"
                aria-label={searchPlaceholder}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setOpen(false);
                  } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveIndex((index) =>
                      Math.min(index + 1, Math.max(0, filtered.length - 1)),
                    );
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex((index) => Math.max(index - 1, 0));
                  } else if (event.key === "Enter" && filtered[activeIndex]) {
                    event.preventDefault();
                    choose(filtered[activeIndex].value);
                  }
                }}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-lg border border-[#DDE5EF] bg-[#F8FAFC] pl-9 pr-3 text-[12px] text-[#293447] outline-none focus:border-[#3768C6] focus:bg-white"
              />
            </div>
            <p className="mt-2 px-1 text-[10px] text-[#8793A5]">
              {filtered.length} of {options.length} options
            </p>
          </div>
          <div
            role="listbox"
            aria-label={placeholder}
            className="max-h-[260px] overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length ? (
              filtered.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => choose(option.value)}
                  className={`flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[12px] transition ${activeIndex === index ? "bg-[#EFF5FF]" : ""}`}
                >
                  <span className="min-w-0">
                    <span className="block font-semibold text-[#293447]">
                      {option.label}
                    </span>
                    {option.detail && (
                      <span className="mt-0.5 block break-all text-[10px] text-[#8793A5]">
                        {option.detail}
                      </span>
                    )}
                  </span>
                  {option.value === value && (
                    <Check size={15} className="shrink-0 text-[#2A7E60]" />
                  )}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-center text-[12px] text-[#8793A5]">
                No matching results
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
