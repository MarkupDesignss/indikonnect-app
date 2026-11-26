"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Search } from "lucide-react";
import { BaseBAOption } from "@/features/distributor/routes/TC-Bank/TCBankPage.parts/support";

export function BaseBASearch({
  options,
  value,
  onChange,
  disabled,
  loading,
}: {
  options: BaseBAOption[];
  value: string;
  onChange: (baseId: string) => void;
  disabled: boolean;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((base) =>
      `${base.value} ${base.label}`.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const choose = (baseId: string) => {
    onChange(baseId);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-label="Select base BA ID"
        aria-haspopup="listbox"
        aria-expanded={open && !disabled}
        disabled={disabled}
        onClick={() => {
          setQuery("");
          setOpen((previous) => !previous);
        }}
        className="flex h-[44px] w-full items-center gap-2.5 rounded-[10px] border border-[#E2E7EE] bg-white px-3.5 text-left text-[12px] font-medium text-[#293447] outline-none transition focus:border-[#78899C] focus:ring-2 focus:ring-[#78899C]/15 disabled:cursor-not-allowed disabled:bg-[#F6F7F9] disabled:text-[#9AA3B0]"
      >
        <Search size={15} className="shrink-0 text-[#8592A5]" />
        <span
          className={`min-w-0 flex-1 truncate ${!value ? "text-[#98A2B3]" : ""}`}
        >
          {selected?.label ||
            value ||
            (loading
              ? "Loading base BA IDs..."
              : options.length
                ? "Search / select base BA ID"
                : "No base BA ID available")}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-[#5E718B] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[90] min-w-[230px] overflow-hidden rounded-[12px] border border-[#E2E7EE] bg-white shadow-[0_14px_42px_rgba(16,24,40,0.16)]">
          <div className="border-b border-[#EDF0F4] p-2.5">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#929CAC]"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setOpen(false);
                  if (event.key === "Enter" && filtered.length) {
                    event.preventDefault();
                    choose(filtered[0].value);
                  }
                }}
                role="combobox"
                aria-expanded={open}
                aria-controls="base-ba-search-options"
                aria-autocomplete="list"
                placeholder="Search BA ID or member name..."
                aria-label="Search Base BA ID"
                className="h-10 w-full rounded-[9px] border border-[#DFE5ED] bg-[#F8FAFC] pl-9 pr-3 text-[12px] text-[#293447] outline-none focus:border-[#78899C] focus:bg-white"
              />
            </div>
            <p className="mt-2 px-1 text-[10px] text-[#8490A0]">
              {filtered.length} of {options.length} base accounts
            </p>
          </div>
          <div
            id="base-ba-search-options"
            role="listbox"
            aria-label="Base BA IDs"
            className="max-h-[260px] overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length ? (
              filtered.map((base) => (
                <button
                  key={base.value}
                  type="button"
                  role="option"
                  aria-selected={base.value === value}
                  onClick={() => choose(base.value)}
                  className={`flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[12px] font-semibold text-[#293447] transition hover:bg-[#F3F6FA] ${base.value === value ? "bg-[#F3F6FA]" : ""}`}
                >
                  <span className="min-w-0 break-words">{base.label}</span>
                  {base.value === value && (
                    <CheckCircle2
                      size={15}
                      className="shrink-0 text-[#31805A]"
                    />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-5 text-center text-[11px] text-[#8792A1]">
                No matching Base BA ID found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
