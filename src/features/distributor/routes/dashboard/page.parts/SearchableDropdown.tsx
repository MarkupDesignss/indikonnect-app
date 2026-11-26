"use client";

import { CalendarDays, Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownOption, SearchableDropdownProps } from "@/features/distributor/routes/dashboard/page.parts/support";


// --------------------------------------------------
// Searchable dropdown
// --------------------------------------------------

export function SearchableDropdown<T extends string | number>({
  id,
  label,
  options,
  value,
  onChange,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
  featuredOption,
  featuredLabel = "CURRENT WEEK",
}: SearchableDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectedOption = options.find((option) => option.value === value);

  const normalizedQuery = query.trim().toLowerCase();

  const matchesQuery = (option: DropdownOption<T>) =>
    `${option.label} ${option.description ?? ""}`
      .toLowerCase()
      .includes(normalizedQuery);

  const showFeaturedOption = Boolean(
    featuredOption && matchesQuery(featuredOption),
  );

  const filteredOptions = options.filter(
    (option) =>
      matchesQuery(option) &&
      !(featuredOption && option.value === featuredOption.value),
  );

  const chooseOption = (option: DropdownOption<T>) => {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <label
        id={`${id}-label`}
        htmlFor={`${id}-trigger`}
        className="mb-2 block text-[12px] font-semibold text-[#5a6276] sm:text-[13px]"
      >
        {label}
      </label>

      <button
        id={`${id}-trigger`}
        type="button"
        aria-label={`${label}: ${selectedOption?.label ?? "Select an option"}`}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        disabled={disabled}
        onClick={() => setOpen((previous) => !previous)}
        className="group flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-[13px] border border-[#E4E4E4] bg-white px-3.5 text-left outline-none transition-all focus-visible:border-[#242424] focus-visible:ring-4 focus-visible:ring-[#242424]/10 disabled:cursor-not-allowed disabled:bg-[#f7f8fa] disabled:text-[#98a2b3] sm:px-4"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            id={`${id}-value`}
            className="truncate text-[13px] font-bold leading-5 text-[#101828]"
          >
            {selectedOption?.label ?? "Select an option"}
          </span>

          {selectedOption?.description && (
            <span className="truncate text-[10px] leading-4 text-[#8a92a6] sm:text-[11px]">
              {selectedOption.description}
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-[#7c879b] transition-transform duration-200 ${
            open ? "rotate-180 text-[#262626]" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.99 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+8px)] z-[80] w-full min-w-[220px] overflow-hidden rounded-[16px] border border-[#E4E4E4] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.13)]"
          >
            <div className="border-b border-[#eef1f5] p-3">
              <div className="flex h-10 items-center gap-2.5 rounded-[11px] border border-[#e6eaf0] bg-[#f8fafc] px-3 transition-colors focus-within:border-[#333333] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#333333]/10">
                <Search size={15} className="shrink-0 text-[#8a92a6]" />

                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={`Search ${label.toLowerCase()} options`}
                  autoComplete="off"
                  className="h-full min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#101828] outline-none placeholder:text-[#98a2b3]"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[16px] leading-none text-[#8a92a6]"
                  >
                    ×
                  </button>
                )}
              </div>

              <p className="mt-2 px-1 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#98a2b3]">
                {filteredOptions.length + (showFeaturedOption ? 1 : 0)} options
              </p>
            </div>

            <div
              id={`${id}-listbox`}
              role="listbox"
              aria-label={`${label} options`}
              className="thin-scroll max-h-[270px] overflow-y-auto p-2"
            >
              {showFeaturedOption && featuredOption && (
                <div className="mb-2">
                  <p className="px-2 pb-1.5 pt-1 text-[9px] font-black tracking-[0.12em] text-[#1f9d6b]">
                    {featuredLabel}
                  </p>

                  <button
                    type="button"
                    role="option"
                    aria-selected={featuredOption.value === value}
                    onClick={() => chooseOption(featuredOption)}
                    className={`flex w-full items-center gap-2.5 rounded-[11px] border px-3 py-2.5 text-left transition-colors ${
                      featuredOption.value === value
                        ? "border-[#D0D0D0] bg-[#F2F2F2]"
                        : "border-[#E7E7E7] bg-[#FAFAFA]"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-white text-[#1f9d6b] ring-1 ring-[#d9eee2]">
                      <CalendarDays size={15} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-extrabold text-[#101828]">
                        {featuredOption.label}
                      </span>

                      {featuredOption.description && (
                        <span className="mt-0.5 block truncate text-[10px] text-[#667085]">
                          {featuredOption.description}
                        </span>
                      )}
                    </span>

                    {featuredOption.value === value && (
                      <Check size={15} className="shrink-0 text-[#1f9d6b]" />
                    )}
                  </button>
                </div>
              )}

              {filteredOptions.length > 0 ? (
                <div className="space-y-1">
                  {filteredOptions.map((option) => {
                    const isSelected = option.value === value;

                    return (
                      <button
                        key={String(option.value)}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => chooseOption(option)}
                        className={`flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left transition-colors ${
                          isSelected
                            ? "bg-[#EFEFEF] text-[#202020]"
                            : "text-[#344054]"
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-bold">
                            {option.label}
                          </span>

                          {option.description && (
                            <span className="mt-0.5 block truncate text-[10px] text-[#8a92a6]">
                              {option.description}
                            </span>
                          )}
                        </span>

                        {isSelected && (
                          <Check
                            size={15}
                            className="shrink-0 text-[#262626]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : !showFeaturedOption ? (
                <div className="px-3 py-7 text-center">
                  <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f4f7] text-[#8a92a6]">
                    <Search size={15} />
                  </span>

                  <p className="mt-2 text-[11px] font-bold text-[#475467]">
                    No results found
                  </p>

                  <p className="mt-1 text-[10px] text-[#98a2b3]">
                    {emptyMessage}
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
