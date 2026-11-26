"use client";

import { motion } from "framer-motion";
import { MapPin, Home, Building2 } from "lucide-react";


/* Address type options */
export const ADDRESS_TYPES = [
  { value: "Home", label: "Home", icon: Home },
  { value: "Office", label: "Office", icon: Building2 },
  { value: "Other", label: "Other", icon: MapPin },
] as const;


export const OTHER_OPTION = "__OTHER__";


/* ============================================================
   IndiaPost response parser
============================================================ */
export interface AreaOption {
  value: string;
  label: string;
  state: string;
  city: string;
  taluk: string;
  village: string;
  office: string;
}


export function buildAreaLabel(o: {
  office?: string;
  taluk?: string;
  village?: string;
}): string {
  const parts: string[] = [];
  if (o.office) parts.push(o.office);
  const extra = [o.taluk, o.village].filter(Boolean).join(", ");
  if (extra) parts.push(extra);
  return parts.join(" — ") || "Unknown area";
}


export function parseIndiaPostData(raw: unknown): {
  states: string[];
  cities: string[];
  areas: AreaOption[];
} {
  if (!raw || typeof raw !== "object")
    return { states: [], cities: [], areas: [] };

  const root = raw as Record<string, unknown>;
  const outer = root.data as Record<string, unknown> | undefined;

  const candidates: unknown[] = [
    root.data,
    root.offices,
    root.records,
    root.results,
    root.post_offices,
  ];
  if (outer && typeof outer === "object") {
    candidates.push(outer.data, outer.offices, outer.records, outer.results);
  }

  let offices: Record<string, unknown>[] = [];
  for (const c of candidates) {
    if (Array.isArray(c)) {
      offices = c as Record<string, unknown>[];
      break;
    }
  }

  const stateSet = new Set<string>();
  const citySet = new Set<string>();
  const areas: AreaOption[] = [];
  const seenAreas = new Set<string>();

  for (const o of offices) {
    const state = (o.state_name as string | undefined)?.trim();
    const city =
      (o.city_name as string | undefined)?.trim() ||
      (o.district as string | undefined)?.trim();
    const office = (o.office_name as string | undefined)?.trim();
    const taluk = (o.taluk_name as string | undefined)?.trim();
    const village = (o.village_name as string | undefined)?.trim();

    if (state) stateSet.add(state);
    if (city) citySet.add(city);

    if (office) {
      const key = `${office}|${taluk}|${village}`;
      if (!seenAreas.has(key)) {
        seenAreas.add(key);
        areas.push({
          value: key,
          label: buildAreaLabel({ office, taluk, village }),
          state: state || "",
          city: city || "",
          taluk: taluk || "",
          village: village || "",
          office,
        });
      }
    }
  }

  return {
    states: Array.from(stateSet).sort(),
    cities: Array.from(citySet).sort(),
    areas: areas.sort((a, b) => a.label.localeCompare(b.label)),
  };
}


/* ============================================================
   Custom Dropdown (dark theme)
============================================================ */
export interface SelectOption {
  value: string;
  label: string;
}


export function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        checked ? "bg-[#111111]" : "bg-[#DCDCDA]"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
        style={{ x: checked ? 20 : 0 }}
      />
    </button>
  );
}


export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  addressName: string;
}
