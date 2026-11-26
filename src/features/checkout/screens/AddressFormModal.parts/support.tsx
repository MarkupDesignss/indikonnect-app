"use client";

import { Home, Building2, MapPin } from "lucide-react";
import { Address, AddressFormData } from "@/features/checkout/screens/CheckoutPage";


export interface BillingAddressData {
  recipient_name: string;
  contact_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postcode: string;
  post_office: string;
  billing_post_office: string;
  country: string;
}


export interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
  initialData?: Address | null;
  isLoading: boolean;
  inline?: boolean;
}


export const emptyBillingAddress: BillingAddressData = {
  recipient_name: "",
  contact_number: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postcode: "",
  post_office: "",
  billing_post_office: "",
  country: "India",
};


export const ADDRESS_TYPES = [
  { value: "Home", label: "Home", icon: Home },
  { value: "Office", label: "Office", icon: Building2 },
  { value: "Other", label: "Other", icon: MapPin },
] as const;


export const OTHER_OPTION = "__OTHER__";


/* ============================================================
   Parsed office entry
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
  if (!raw || typeof raw !== "object") {
    return { states: [], cities: [], areas: [] };
  }

  const root = raw as Record<string, unknown>;
  const outer =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : undefined;
  const nested =
    outer?.data && typeof outer.data === "object" && !Array.isArray(outer.data)
      ? (outer.data as Record<string, unknown>)
      : undefined;

  const containers = [root, outer, nested].filter(
    (item): item is Record<string, unknown> => Boolean(item),
  );
  const arrayKeys = [
    "data",
    "offices",
    "records",
    "results",
    "post_offices",
    "post_office",
    "PostOffice",
    "postOffice",
    "office_list",
  ];

  let offices: Record<string, unknown>[] = [];
  for (const container of containers) {
    for (const key of arrayKeys) {
      const value = container[key];
      if (Array.isArray(value)) {
        offices = value.filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) && typeof item === "object" && !Array.isArray(item),
        );
        if (offices.length) break;
      }
    }
    if (offices.length) break;
  }

  const readText = (
    office: Record<string, unknown>,
    keys: string[],
  ): string => {
    for (const key of keys) {
      const value = office[key];
      if (typeof value === "string" || typeof value === "number") {
        const text = String(value).trim();
        if (text) return text;
      }
    }
    return "";
  };

  const stateSet = new Set<string>();
  const citySet = new Set<string>();
  const areas: AreaOption[] = [];
  const seenAreas = new Set<string>();

  for (const officeData of offices) {
    const state = readText(officeData, [
      "state_name",
      "state",
      "State",
      "stateName",
      "StateName",
    ]);
    const city = readText(officeData, [
      "city_name",
      "city",
      "City",
      "cityName",
      "district",
      "District",
      "district_name",
      "districtName",
    ]);
    const office = readText(officeData, [
      "office_name",
      "office",
      "Office",
      "name",
      "Name",
      "officeName",
      "PostOfficeName",
    ]);
    const taluk = readText(officeData, [
      "taluk_name",
      "taluk",
      "Taluk",
      "block",
      "Block",
      "sub_district",
      "subDistrict",
    ]);
    const village = readText(officeData, [
      "village_name",
      "village",
      "Village",
      "locality",
      "Locality",
    ]);

    if (state) stateSet.add(state);
    if (city) citySet.add(city);

    if (office) {
      const key = `${office}|${taluk}|${village}`;
      if (!seenAreas.has(key)) {
        seenAreas.add(key);
        areas.push({
          value: key,
          label: buildAreaLabel({ office, taluk, village }),
          state,
          city,
          taluk,
          village,
          office,
        });
      }
    }
  }

  return {
    states: Array.from(stateSet).sort((a, b) => a.localeCompare(b)),
    cities: Array.from(citySet).sort((a, b) => a.localeCompare(b)),
    areas: areas.sort((a, b) => a.label.localeCompare(b.label)),
  };
}


/* ============================================================
   Reusable custom dropdown
============================================================ */
export interface SelectOption {
  value: string;
  label: string;
}
