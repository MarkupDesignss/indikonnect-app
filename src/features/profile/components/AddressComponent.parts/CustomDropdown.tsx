"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { OTHER_OPTION, SelectOption } from "@/features/profile/components/AddressComponent.parts/support";


export function CustomDropdown({
  value,
  options,
  placeholder,
  onChange,
  hasError,
  includeOther = false,
  disabled = false,
}: {
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  includeOther?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const allOptions: SelectOption[] = includeOther
    ? [...options, { value: OTHER_OPTION, label: "Other (type manually)" }]
    : options;

  const selectedLabel =
    value === OTHER_OPTION
      ? "Other (type manually)"
      : options.find((o) => o.value === value)?.label || value;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`flex h-[42px] w-full items-center justify-between gap-2 rounded-[6px] border bg-white px-3.5 text-left text-[12px] transition-all duration-150 ${
          hasError
            ? "border-[#D66A6A] bg-[#FFF9F9]"
            : "border-[#D7D7D5] hover:border-[#BDBDBA]"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span
          className={`truncate ${
            selectedLabel ? "text-[#222222]" : "text-[#999999]"
          }`}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#999999] transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 z-[10002] mt-1 max-h-[220px] overflow-y-auto rounded-[6px] border border-[#E4E4E2] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
          >
            {allOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] transition-colors ${
                    isSelected
                      ? "bg-[#F1F1F0] text-[#111111]"
                      : "text-[#222222] hover:bg-[#FAFAF9]"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#111111]" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
