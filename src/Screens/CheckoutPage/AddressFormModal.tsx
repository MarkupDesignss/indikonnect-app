"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  User,
  Phone,
  Home,
  Building2,
  Globe,
  CheckCircle2,
  Loader2,
  CreditCard,
  ChevronDown,
  MapPin,
  Check,
} from "lucide-react";

import { Address, AddressFormData } from "./CheckoutPage";
import { useGetIndiaPostPincodeQuery } from "@/lib/redux/api/indiaPostApi";

interface BillingAddressData {
  recipient_name: string;
  contact_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
  initialData?: Address | null;
  isLoading: boolean;
  inline?: boolean;
}

const emptyBillingAddress: BillingAddressData = {
  recipient_name: "",
  contact_number: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "India",
};

const ADDRESS_TYPES = [
  { value: "Home", label: "Home", icon: Home },
  { value: "Office", label: "Office", icon: Building2 },
  { value: "Other", label: "Other", icon: MapPin },
] as const;

const OTHER_OPTION = "__OTHER__";

/* ============================================================
   Parsed office entry
============================================================ */
interface AreaOption {
  value: string;
  label: string;
  state: string;
  city: string;
  taluk: string;
  village: string;
  office: string;
}

function buildAreaLabel(o: {
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

function parseIndiaPostData(raw: unknown): {
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

  // India Post APIs can return the office array at different nesting levels.
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
interface SelectOption {
  value: string;
  label: string;
}

function CustomDropdown({
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
      : options.find((o) => o.value === value)?.label || "";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`flex h-[44px] w-full items-center justify-between gap-2 rounded-[6px] border bg-white px-3 text-left text-[12px] transition-all duration-150 ${
          hasError
            ? "border-[#D66A6A] bg-[#FFF9F9]"
            : "border-[#DDE7DF] hover:border-[#B9CFC1]"
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
            className="absolute left-0 right-0 z-50 mt-1 max-h-[220px] overflow-y-auto rounded-[6px] border border-[#E4EBE6] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
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
                      ? "bg-[#EAF6EF] text-[#16845B]"
                      : "text-[#222222] hover:bg-[#F8FBF8]"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#16845B]" />
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

export default function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  inline = false,
}: AddressFormModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    recipient_name: "",
    contact_number: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "India",
    is_default: true,
    is_billing: true,
    is_delivery: true,
    type: "Home",
  });

  const [billingAddress, setBillingAddress] = useState<BillingAddressData>({
    ...emptyBillingAddress,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressFormData, string>>
  >({});

  const [billingErrors, setBillingErrors] = useState<
    Partial<Record<keyof BillingAddressData, string>>
  >({});

  const showSeparateBillingForm = !formData.is_billing;

  /* "OTHER" toggles */
  const [stateOther, setStateOther] = useState(false);
  const [cityOther, setCityOther] = useState(false);
  const [billingStateOther, setBillingStateOther] = useState(false);
  const [billingCityOther, setBillingCityOther] = useState(false);

  /* Area selectors */
  const [selectedArea, setSelectedArea] = useState("");
  const [billingSelectedArea, setBillingSelectedArea] = useState("");

  /* Manual "other" area values */
  const [manualArea, setManualArea] = useState("");
  const [billingManualArea, setBillingManualArea] = useState("");

  /* ============================================================
     PINCODE LOOKUP
  ============================================================ */
  const [postcodeForLookup, setPostcodeForLookup] = useState("");
  const [billingPostcodeForLookup, setBillingPostcodeForLookup] = useState("");

  // Clear lookup arguments as soon as the user edits a pincode. This prevents
  // the previous pincode's response from remaining visible during the debounce.
  useEffect(() => {
    if (!inline && !isOpen) {
      setPostcodeForLookup("");
      return;
    }

    const pin = formData.postcode.trim();
    if (!/^\d{6}$/.test(pin)) {
      setPostcodeForLookup("");
      return;
    }

    const timer = window.setTimeout(() => setPostcodeForLookup(pin), 450);
    return () => window.clearTimeout(timer);
  }, [formData.postcode, isOpen, inline]);

  useEffect(() => {
    if (!inline && !isOpen) {
      setBillingPostcodeForLookup("");
      return;
    }

    const pin = billingAddress.postcode.trim();
    if (!/^\d{6}$/.test(pin)) {
      setBillingPostcodeForLookup("");
      return;
    }

    const timer = window.setTimeout(
      () => setBillingPostcodeForLookup(pin),
      450,
    );
    return () => window.clearTimeout(timer);
  }, [billingAddress.postcode, isOpen, inline]);

  const {
    currentData: pincodeData,
    isFetching: isPincodeFetching,
    isError: isPincodeError,
  } = useGetIndiaPostPincodeQuery(postcodeForLookup, {
    skip: !postcodeForLookup || (!inline && !isOpen),
    // Re-fetch when the modal subscribes again, even if this pincode was used before.
    refetchOnMountOrArgChange: true,
  });

  const {
    currentData: billingPincodeData,
    isFetching: isBillingPincodeFetching,
    isError: isBillingPincodeError,
  } = useGetIndiaPostPincodeQuery(billingPostcodeForLookup, {
    skip: !billingPostcodeForLookup || (!inline && !isOpen),
    refetchOnMountOrArgChange: true,
  });

  const { states: mainStates, cities: mainCities, areas: mainAreas } = useMemo(
    () => parseIndiaPostData(pincodeData ?? null),
    [pincodeData],
  );

  const {
    states: billingStates,
    cities: billingCities,
    areas: billingAreas,
  } = useMemo(
    () => parseIndiaPostData(billingPincodeData ?? null),
    [billingPincodeData],
  );

  /* Auto-fill state and city only for the currently entered pincode. */
  useEffect(() => {
    if (
      !pincodeData ||
      !postcodeForLookup ||
      postcodeForLookup !== formData.postcode
    ) {
      return;
    }

    if (mainStates.length === 1 && !stateOther) {
      setFormData((previous) => ({
        ...previous,
        state: previous.state || mainStates[0],
      }));
    }

    if (mainCities.length === 1 && !cityOther) {
      setFormData((previous) => ({
        ...previous,
        city: previous.city || mainCities[0],
      }));
    }
  }, [
    pincodeData,
    postcodeForLookup,
    formData.postcode,
    mainStates,
    mainCities,
    stateOther,
    cityOther,
  ]);

  useEffect(() => {
    if (
      !billingPincodeData ||
      !billingPostcodeForLookup ||
      billingPostcodeForLookup !== billingAddress.postcode
    ) {
      return;
    }

    if (billingStates.length === 1 && !billingStateOther) {
      setBillingAddress((previous) => ({
        ...previous,
        state: previous.state || billingStates[0],
      }));
    }

    if (billingCities.length === 1 && !billingCityOther) {
      setBillingAddress((previous) => ({
        ...previous,
        city: previous.city || billingCities[0],
      }));
    }
  }, [
    billingPincodeData,
    billingPostcodeForLookup,
    billingAddress.postcode,
    billingStates,
    billingCities,
    billingStateOther,
    billingCityOther,
  ]);

  /* Auto-select a single post office and use its location details. */
  useEffect(() => {
    if (
      postcodeForLookup !== formData.postcode ||
      mainAreas.length !== 1 ||
      selectedArea
    ) {
      return;
    }

    const area = mainAreas[0];
    setSelectedArea(area.value);
    setFormData((previous) => ({
      ...previous,
      state: previous.state || area.state,
      city: previous.city || area.city,
      address_line_1:
        previous.address_line_1 ||
        [area.office, area.taluk, area.village].filter(Boolean).join(", "),
    }));
  }, [postcodeForLookup, formData.postcode, mainAreas, selectedArea]);

  useEffect(() => {
    if (
      billingPostcodeForLookup !== billingAddress.postcode ||
      billingAreas.length !== 1 ||
      billingSelectedArea
    ) {
      return;
    }

    const area = billingAreas[0];
    setBillingSelectedArea(area.value);
    setBillingAddress((previous) => ({
      ...previous,
      state: previous.state || area.state,
      city: previous.city || area.city,
      address_line_1:
        previous.address_line_1 ||
        [area.office, area.taluk, area.village].filter(Boolean).join(", "),
    }));
  }, [
    billingPostcodeForLookup,
    billingAddress.postcode,
    billingAreas,
    billingSelectedArea,
  ]);

  const resetFormState = useCallback(() => {
    setFormData({
      recipient_name: "",
      contact_number: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "India",
      is_default: true,
      is_billing: true,
      is_delivery: true,
      type: "Home",
    });
    setBillingAddress({ ...emptyBillingAddress });
    setErrors({});
    setBillingErrors({});
    setStateOther(false);
    setCityOther(false);
    setBillingStateOther(false);
    setBillingCityOther(false);
    setSelectedArea("");
    setBillingSelectedArea("");
    setManualArea("");
    setBillingManualArea("");
    setPostcodeForLookup("");
    setBillingPostcodeForLookup("");
  }, []);

  const handleModalClose = useCallback(() => {
    if (isLoading) return;
    resetFormState();
    onClose();
  }, [isLoading, onClose, resetFormState]);

  /* ============================================================
     POPULATE / RESET
  ============================================================ */
  useEffect(() => {
    if (!isOpen && !inline) {
      resetFormState();
      return;
    }

    // Start every new modal session with fresh lookup arguments.
    setPostcodeForLookup("");
    setBillingPostcodeForLookup("");

    if (initialData) {
      setFormData({
        recipient_name: initialData.recipient_name || "",
        contact_number: initialData.contact_number || "",
        address_line_1: initialData.address_line_1 || "",
        address_line_2: initialData.address_line_2 || "",
        city: initialData.city || "",
        state: initialData.state || "",
        postcode: initialData.postcode || "",
        country: initialData.country || "India",
        is_default: initialData.is_default === true,
        is_billing: initialData.is_billing === true,
        is_delivery: initialData.is_delivery === true,
        type: (initialData as any).type || "Home",
      });

      const addressWithBilling = initialData as Address & {
        billing_recipient_name?: string;
        billing_contact_number?: string;
        billing_address_line_1?: string;
        billing_address_line_2?: string;
        billing_city?: string;
        billing_state?: string;
        billing_postcode?: string;
        billing_country?: string;
      };

      const hasBillingData =
        !!addressWithBilling.billing_recipient_name ||
        !!addressWithBilling.billing_address_line_1 ||
        !!addressWithBilling.billing_city;

      if (hasBillingData) {
        setBillingAddress({
          recipient_name: addressWithBilling.billing_recipient_name || "",
          contact_number: addressWithBilling.billing_contact_number || "",
          address_line_1: addressWithBilling.billing_address_line_1 || "",
          address_line_2: addressWithBilling.billing_address_line_2 || "",
          city: addressWithBilling.billing_city || "",
          state: addressWithBilling.billing_state || "",
          postcode: addressWithBilling.billing_postcode || "",
          country:
            addressWithBilling.billing_country ||
            initialData.country ||
            "India",
        });
        setFormData((previous) => ({ ...previous, is_billing: false }));
      } else {
        setBillingAddress({
          recipient_name: initialData.recipient_name || "",
          contact_number: initialData.contact_number || "",
          address_line_1: initialData.address_line_1 || "",
          address_line_2: initialData.address_line_2 || "",
          city: initialData.city || "",
          state: initialData.state || "",
          postcode: initialData.postcode || "",
          country: initialData.country || "India",
        });
        setFormData((previous) => ({ ...previous, is_billing: true }));
      }
    } else {
      setFormData({
        recipient_name: "",
        contact_number: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postcode: "",
        country: "India",
        is_default: true,
        is_billing: true,
        is_delivery: true,
        type: "Home",
      });
      setBillingAddress({ ...emptyBillingAddress });
    }

    setErrors({});
    setBillingErrors({});
    setStateOther(false);
    setCityOther(false);
    setBillingStateOther(false);
    setBillingCityOther(false);
    setSelectedArea("");
    setBillingSelectedArea("");
    setManualArea("");
    setBillingManualArea("");
  }, [initialData, isOpen, inline, resetFormState]);

  /* ============================================================
     VALIDATION
  ============================================================ */
  const validateMainAddress = () => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};
    if (!formData.recipient_name.trim())
      newErrors.recipient_name = "Full name is required";

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Phone number is required";
    } else if (!phoneRegex.test(formData.contact_number.trim())) {
      newErrors.contact_number = "Phone number must be exactly 10 digits";
    }

    if (!formData.address_line_1.trim())
      newErrors.address_line_1 = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    const postcodeRegex = /^[0-9]{6}$/;
    if (!formData.postcode.trim()) {
      newErrors.postcode = "Postcode is required";
    } else if (!postcodeRegex.test(formData.postcode.trim())) {
      newErrors.postcode = "Postcode must be exactly 6 digits";
    }

    if (!formData.country.trim())
      newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBillingAddress = () => {
    const newErrors: Partial<Record<keyof BillingAddressData, string>> = {};
    if (!billingAddress.recipient_name.trim())
      newErrors.recipient_name = "Billing name is required";

    const phoneRegex = /^[0-9]{10}$/;
    if (!billingAddress.contact_number.trim()) {
      newErrors.contact_number = "Billing phone is required";
    } else if (!phoneRegex.test(billingAddress.contact_number.trim())) {
      newErrors.contact_number = "Phone number must be exactly 10 digits";
    }

    if (!billingAddress.address_line_1.trim())
      newErrors.address_line_1 = "Billing address is required";
    if (!billingAddress.city.trim())
      newErrors.city = "Billing city is required";
    if (!billingAddress.state.trim())
      newErrors.state = "Billing state is required";

    const postcodeRegex = /^[0-9]{6}$/;
    if (!billingAddress.postcode.trim()) {
      newErrors.postcode = "Billing postcode is required";
    } else if (!postcodeRegex.test(billingAddress.postcode.trim())) {
      newErrors.postcode = "Postcode must be exactly 6 digits";
    }

    if (!billingAddress.country.trim())
      newErrors.country = "Billing country is required";

    setBillingErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ============================================================
     SUBMIT
  ============================================================ */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateMainAddress()) return;
    if (!formData.is_billing && !validateBillingAddress()) return;

    const submitData: any = {
      ...formData,
      type: formData.type || "Home",
    };

    if (formData.is_billing) {
      submitData.billing_recipient_name = formData.recipient_name;
      submitData.billing_contact_number = formData.contact_number;
      submitData.billing_address_line_1 = formData.address_line_1;
      submitData.billing_address_line_2 = formData.address_line_2 || "";
      submitData.billing_city = formData.city;
      submitData.billing_state = formData.state;
      submitData.billing_postcode = formData.postcode;
      submitData.billing_country = formData.country;
    } else {
      submitData.billing_recipient_name = billingAddress.recipient_name;
      submitData.billing_contact_number = billingAddress.contact_number;
      submitData.billing_address_line_1 = billingAddress.address_line_1;
      submitData.billing_address_line_2 = billingAddress.address_line_2;
      submitData.billing_city = billingAddress.city;
      submitData.billing_state = billingAddress.state;
      submitData.billing_postcode = billingAddress.postcode;
      submitData.billing_country = billingAddress.country;
    }

    await onSubmit(submitData);
  };

  /* ============================================================
     HELPERS
  ============================================================ */
  const clearError = (field: keyof AddressFormData) => {
    if (!errors[field]) return;
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const clearBillingError = (field: keyof BillingAddressData) => {
    if (!billingErrors[field]) return;
    setBillingErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const onMainPostcodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setPostcodeForLookup("");
    setFormData((previous) => ({
      ...previous,
      postcode: digitsOnly,
      city: "",
      state: "",
    }));
    setSelectedArea("");
    setManualArea("");
    setStateOther(false);
    setCityOther(false);
    clearError("postcode");
  };

  const onBillingPostcodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setBillingPostcodeForLookup("");
    setBillingAddress((previous) => ({
      ...previous,
      postcode: digitsOnly,
      city: "",
      state: "",
    }));
    setBillingSelectedArea("");
    setBillingManualArea("");
    setBillingStateOther(false);
    setBillingCityOther(false);
    clearBillingError("postcode");
  };

  const handleMainFieldChange = (
    field: keyof AddressFormData,
    value: string,
  ) => {
    if (field === "contact_number") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((previous) => ({ ...previous, [field]: digitsOnly }));
    } else {
      setFormData((previous) => ({ ...previous, [field]: value }));
    }
    clearError(field);
  };

  const updateBillingField = (
    field: keyof BillingAddressData,
    value: string,
  ) => {
    if (field === "contact_number") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setBillingAddress((previous) => ({ ...previous, [field]: digitsOnly }));
    } else {
      setBillingAddress((previous) => ({ ...previous, [field]: value }));
    }
    clearBillingError(field);
  };

  const onSelectMainArea = (value: string) => {
    setSelectedArea(value);
    setManualArea("");
    if (value === OTHER_OPTION || !value) return;

    const area = mainAreas.find((a) => a.value === value);
    if (!area) return;

    setFormData((previous) => {
      const next = { ...previous };
      if (!next.state && area.state) next.state = area.state;
      if (!next.city && area.city) next.city = area.city;
      if (!next.address_line_1.trim()) {
        next.address_line_1 = [area.office, area.taluk, area.village]
          .filter(Boolean)
          .join(", ");
      }
      return next;
    });
  };

  const onSelectBillingArea = (value: string) => {
    setBillingSelectedArea(value);
    setBillingManualArea("");
    if (value === OTHER_OPTION || !value) return;

    const area = billingAreas.find((a) => a.value === value);
    if (!area) return;

    setBillingAddress((previous) => {
      const next = { ...previous };
      if (!next.state && area.state) next.state = area.state;
      if (!next.city && area.city) next.city = area.city;
      if (!next.address_line_1.trim()) {
        next.address_line_1 = [area.office, area.taluk, area.village]
          .filter(Boolean)
          .join(", ");
      }
      return next;
    });
  };

  /* ============================================================
     STYLES
  ============================================================ */
  const inputClass = (error?: string) =>
    `h-[44px] w-full rounded-[6px] border bg-white pl-10 pr-3 text-[12px] text-[#222222] outline-none transition-all duration-150 placeholder:text-[#999999] ${
      error
        ? "border-[#D66A6A] bg-[#FFF9F9] focus:border-[#C94D4D] focus:ring-1 focus:ring-[#C94D4D]/10"
        : "border-[#DDE7DF] hover:border-[#B9CFC1] focus:border-[#16845B] focus:ring-2 focus:ring-[#16845B]/10"
    }`;

  const simpleInputClass = (error?: string) =>
    `h-[44px] w-full rounded-[6px] border bg-white px-3 text-[12px] text-[#222222] outline-none transition-all duration-150 placeholder:text-[#999999] ${
      error
        ? "border-[#D66A6A] bg-[#FFF9F9] focus:border-[#C94D4D] focus:ring-1 focus:ring-[#C94D4D]/10"
        : "border-[#DDE7DF] hover:border-[#B9CFC1] focus:border-[#16845B] focus:ring-2 focus:ring-[#16845B]/10"
    }`;

  const FieldError = ({ children }: { children?: string }) =>
    children ? (
      <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
        {children}
      </p>
    ) : null;

  const Label = ({
    children,
    optional,
  }: {
    children: React.ReactNode;
    optional?: boolean;
  }) => (
    <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#667168]">
      {children}
      {optional && (
        <span className="ml-1 font-normal normal-case tracking-normal text-[#999999]">
          (Optional)
        </span>
      )}
    </label>
  );

  const SectionHeader = ({
    icon,
    title,
    subtitle,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
  }) => (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#173E2B] text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-[14px] font-medium text-[#171717]">{title}</h3>
        <p className="mt-0.5 text-[10px] text-[#888888]">{subtitle}</p>
      </div>
    </div>
  );

  const AddressTypeSelector = () => (
    <div className="md:col-span-2">
      <Label>Address Type</Label>
      <div className="grid grid-cols-3 gap-2">
        {ADDRESS_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = formData.type === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() =>
                setFormData((previous) => ({
                  ...previous,
                  type: type.value,
                }))
              }
              className={`flex h-[44px] items-center justify-center gap-2 rounded-[6px] border text-[11px] font-medium transition-all duration-150 ${
                isSelected
                  ? "border-[#16845B] bg-[#EAF6EF] text-[#16845B]"
                  : "border-[#DDE7DF] bg-white text-[#667168] hover:border-[#B9CFC1] hover:bg-[#F8FBF8]"
              }`}
            >
              <Icon className="h-[14px] w-[14px]" />
              {type.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const PincodeHint = ({
    fetching,
    error,
    hasData,
  }: {
    fetching: boolean;
    error: boolean;
    hasData: boolean;
  }) => {
    if (fetching)
      return (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-[#888888]">
          <Loader2 className="h-3 w-3 animate-spin" /> Fetching area, city &
          state…
        </p>
      );
    if (error)
      return (
        <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
          Could not fetch pincode details. Enter details manually.
        </p>
      );
    if (hasData)
      return (
        <p className="mt-1 text-[10px] text-[#16845B]">
          ✓ Pincode verified — pick your delivery area below
        </p>
      );
    return null;
  };

  /* ============================================================
     FORM CONTENT
  ============================================================ */
  const formContent = (
    <form
      onSubmit={handleSubmit}
      className={
        inline ? "w-full" : "flex min-h-0 flex-1 flex-col overflow-hidden"
      }
    >
      <div className={inline ? "w-full" : "flex-1 overflow-y-auto"}>
        <div className={inline ? "space-y-5" : "px-4 py-4 sm:px-5 sm:py-5"}>
          {/* DELIVERY ADDRESS */}
          <section className="overflow-hidden rounded-[7px] border border-[#E4EBE6] bg-white">
            <div className="px-4 pb-4 pt-5">
              <SectionHeader
                icon={<MapPin className="h-4 w-4" />}
                title="Delivery Address"
                subtitle="Where should we deliver your order?"
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <AddressTypeSelector />

                {/* FULL NAME */}
                <div className="md:col-span-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                    <input
                      type="text"
                      value={formData.recipient_name}
                      onChange={(e) =>
                        handleMainFieldChange(
                          "recipient_name",
                          e.target.value,
                        )
                      }
                      className={inputClass(errors.recipient_name)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <FieldError>{errors.recipient_name}</FieldError>
                </div>

                {/* PHONE */}
                <div className="md:col-span-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.contact_number}
                      onChange={(e) =>
                        handleMainFieldChange(
                          "contact_number",
                          e.target.value,
                        )
                      }
                      className={inputClass(errors.contact_number)}
                      placeholder="Enter Your contact number"
                      maxLength={10}
                    />
                  </div>
                  <FieldError>{errors.contact_number}</FieldError>
                </div>

                {/* POSTCODE */}
                <div className="md:col-span-2">
                  <Label>Postcode</Label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.postcode}
                    onChange={(e) => onMainPostcodeChange(e.target.value)}
                    className={simpleInputClass(errors.postcode)}
                    placeholder="Enter a valid Indian PIN code"
                    maxLength={6}
                  />
                  <FieldError>{errors.postcode}</FieldError>
                  <PincodeHint
                    fetching={isPincodeFetching}
                    error={isPincodeError}
                    hasData={
                      mainStates.length > 0 ||
                      mainCities.length > 0 ||
                      mainAreas.length > 0
                    }
                  />
                </div>

                {/* STATE */}
                <div>
                  <Label>State</Label>
                  {mainStates.length > 0 ? (
                    <>
                      <CustomDropdown
                        value={stateOther ? OTHER_OPTION : formData.state}
                        placeholder="Select state"
                        onChange={(v) => {
                          if (v === OTHER_OPTION) {
                            setStateOther(true);
                            handleMainFieldChange("state", "");
                          } else {
                            setStateOther(false);
                            handleMainFieldChange("state", v);
                          }
                        }}
                        includeOther
                        hasError={!!errors.state}
                        options={mainStates.map((s) => ({
                          value: s,
                          label: s,
                        }))}
                      />
                      {stateOther && (
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) =>
                            handleMainFieldChange("state", e.target.value)
                          }
                          className={`${simpleInputClass(
                            errors.state,
                          )} mt-2`}
                          placeholder="Enter your state"
                          autoFocus
                        />
                      )}
                    </>
                  ) : (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) =>
                        handleMainFieldChange("state", e.target.value)
                      }
                      className={simpleInputClass(errors.state)}
                      placeholder="Enter state"
                    />
                  )}
                  <FieldError>{errors.state}</FieldError>
                </div>

                {/* CITY */}
                <div>
                  <Label>City / District</Label>
                  {mainCities.length > 0 ? (
                    <>
                      <CustomDropdown
                        value={cityOther ? OTHER_OPTION : formData.city}
                        placeholder="Select city"
                        onChange={(v) => {
                          if (v === OTHER_OPTION) {
                            setCityOther(true);
                            handleMainFieldChange("city", "");
                          } else {
                            setCityOther(false);
                            handleMainFieldChange("city", v);
                          }
                        }}
                        includeOther
                        hasError={!!errors.city}
                        options={mainCities.map((c) => ({
                          value: c,
                          label: c,
                        }))}
                      />
                      {cityOther && (
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            handleMainFieldChange("city", e.target.value)
                          }
                          className={`${simpleInputClass(
                            errors.city,
                          )} mt-2`}
                          placeholder="Enter your city"
                          autoFocus
                        />
                      )}
                    </>
                  ) : (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        handleMainFieldChange("city", e.target.value)
                      }
                      className={simpleInputClass(errors.city)}
                      placeholder="Enter city"
                    />
                  )}
                  <FieldError>{errors.city}</FieldError>
                </div>

                {/* DELIVERY AREA */}
                {mainAreas.length > 0 && (
                  <div className="md:col-span-2">
                    <Label>Delivery Area / Post Office</Label>
                    <CustomDropdown
                      value={selectedArea}
                      placeholder="Select delivery area"
                      onChange={onSelectMainArea}
                      includeOther
                      options={mainAreas.map((a) => ({
                        value: a.value,
                        label: a.label,
                      }))}
                    />
                    <p className="mt-1 text-[9px] text-[#888888]">
                      Pick your nearest post office / village. State, city &
                      address line 1 will be auto-filled.
                    </p>

                    {selectedArea === OTHER_OPTION && (
                      <div className="mt-2">
                        <Label>Enter your Area / Locality</Label>
                        <input
                          type="text"
                          value={manualArea}
                          onChange={(e) => {
                            const v = e.target.value;
                            setManualArea(v);
                            // keep address line 1 in sync only if user hasn't typed anything else
                            setFormData((prev) => ({
                              ...prev,
                              address_line_1: v,
                            }));
                          }}
                          className={simpleInputClass()}
                          placeholder="e.g. Village / Colony / Sector"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ADDRESS 1 */}
                <div className="md:col-span-2">
                  <Label>Address Line 1</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                    <input
                      type="text"
                      value={formData.address_line_1}
                      onChange={(e) =>
                        handleMainFieldChange(
                          "address_line_1",
                          e.target.value,
                        )
                      }
                      className={inputClass(errors.address_line_1)}
                      placeholder="House no., street, locality"
                    />
                  </div>
                  <FieldError>{errors.address_line_1}</FieldError>
                </div>

                {/* ADDRESS 2 */}
                <div className="md:col-span-2">
                  <Label optional>Address Line 2</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                    <input
                      type="text"
                      value={formData.address_line_2}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address_line_2: e.target.value,
                        })
                      }
                      className={inputClass()}
                      placeholder="Apartment, suite, unit, building"
                    />
                  </div>
                </div>

                {/* COUNTRY */}
                <div className="md:col-span-2">
                  <Label>Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) =>
                        handleMainFieldChange("country", e.target.value)
                      }
                      className={`${simpleInputClass(errors.country)} pl-10`}
                      placeholder="India"
                    />
                  </div>
                  <FieldError>{errors.country}</FieldError>
                </div>
              </div>
            </div>
          </section>

          {/* ADDRESS OPTIONS */}
          <section className="space-y-2.5">
            <label
              className={`group flex cursor-pointer items-center justify-between gap-4 rounded-[7px] border px-3.5 py-3 transition-all duration-150 ${
                formData.is_default
                  ? "border-[#16845B] bg-[#F1FAF4]"
                  : "border-[#E4EBE6] bg-white hover:border-[#B9CFC1]"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] ${
                    formData.is_default
                      ? "bg-[#16845B] text-white"
                      : "bg-[#F2F2F0] text-[#888888]"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#222222]">
                    Set as default address
                  </p>
                  <p className="mt-0.5 text-[9px] text-[#888888]">
                    Use this address automatically at checkout
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_default: e.target.checked,
                  })
                }
                className="h-4 w-4 shrink-0 cursor-pointer accent-[#16845B]"
              />
            </label>

            {/* BILLING */}
            <div className="overflow-hidden rounded-[7px] border border-[#E4EBE6] bg-white">
              <label
                className={`flex cursor-pointer items-center justify-between gap-4 px-3.5 py-3 transition-colors ${
                  formData.is_billing ? "bg-white" : "bg-[#F8FBF8]"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] ${
                      formData.is_billing
                        ? "bg-[#F2F2F0] text-[#222222]"
                        : "bg-[#173E2B] text-white"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#222222]">
                      Same billing address
                    </p>
                    <p className="mt-0.5 text-[9px] text-[#888888]">
                      Billing and delivery details are the same
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_billing}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData({ ...formData, is_billing: checked });
                    if (checked) setBillingErrors({});
                  }}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-[#16845B]"
                />
              </label>

              <AnimatePresence initial={false}>
                {showSeparateBillingForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#E4EBE6] bg-[#F8FBF8] p-3.5 sm:p-4">
                      <div className="mb-4 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#173E2B] text-white">
                          <CreditCard className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[12px] font-medium text-[#222222]">
                            Separate Billing Address
                          </h4>
                          <p className="mt-0.5 text-[9px] text-[#888888]">
                            Enter different billing details
                          </p>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 rotate-180 text-[#999999]" />
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {/* NAME */}
                        <div className="md:col-span-2">
                          <Label>Billing Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                            <input
                              type="text"
                              value={billingAddress.recipient_name}
                              onChange={(e) =>
                                updateBillingField(
                                  "recipient_name",
                                  e.target.value,
                                )
                              }
                              className={inputClass(
                                billingErrors.recipient_name,
                              )}
                              placeholder="Enter billing full name"
                            />
                          </div>
                          <FieldError>
                            {billingErrors.recipient_name}
                          </FieldError>
                        </div>

                        {/* PHONE */}
                        <div className="md:col-span-2">
                          <Label>Billing Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                            <input
                              type="text"
                              inputMode="numeric"
                              value={billingAddress.contact_number}
                              onChange={(e) =>
                                updateBillingField(
                                  "contact_number",
                                  e.target.value,
                                )
                              }
                              className={inputClass(
                                billingErrors.contact_number,
                              )}
                              placeholder="9876543210"
                              maxLength={10}
                            />
                          </div>
                          <FieldError>
                            {billingErrors.contact_number}
                          </FieldError>
                        </div>

                        {/* POSTCODE */}
                        <div className="md:col-span-2">
                          <Label>Billing Postcode</Label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={billingAddress.postcode}
                            onChange={(e) =>
                              onBillingPostcodeChange(e.target.value)
                            }
                            className={simpleInputClass(
                              billingErrors.postcode,
                            )}
                            placeholder="110001"
                            maxLength={6}
                          />
                          <FieldError>{billingErrors.postcode}</FieldError>
                          <PincodeHint
                            fetching={isBillingPincodeFetching}
                            error={isBillingPincodeError}
                            hasData={
                              billingStates.length > 0 ||
                              billingCities.length > 0 ||
                              billingAreas.length > 0
                            }
                          />
                        </div>

                        {/* AREA */}
                        {billingAreas.length > 0 && (
                          <div className="md:col-span-2">
                            <Label>Billing Area / Post Office</Label>
                            <CustomDropdown
                              value={billingSelectedArea}
                              placeholder="Select area"
                              onChange={onSelectBillingArea}
                              includeOther
                              options={billingAreas.map((a) => ({
                                value: a.value,
                                label: a.label,
                              }))}
                            />

                            {billingSelectedArea === OTHER_OPTION && (
                              <div className="mt-2">
                                <Label>Enter your Area / Locality</Label>
                                <input
                                  type="text"
                                  value={billingManualArea}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setBillingManualArea(v);
                                    setBillingAddress((prev) => ({
                                      ...prev,
                                      address_line_1: v,
                                    }));
                                  }}
                                  className={simpleInputClass()}
                                  placeholder="e.g. Village / Colony / Sector"
                                  autoFocus
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* ADDRESS */}
                        <div className="md:col-span-2">
                          <Label>Billing Address Line 1</Label>
                          <div className="relative">
                            <Home className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                            <input
                              type="text"
                              value={billingAddress.address_line_1}
                              onChange={(e) =>
                                updateBillingField(
                                  "address_line_1",
                                  e.target.value,
                                )
                              }
                              className={inputClass(
                                billingErrors.address_line_1,
                              )}
                              placeholder="House no., street, locality"
                            />
                          </div>
                          <FieldError>
                            {billingErrors.address_line_1}
                          </FieldError>
                        </div>

                        {/* ADDRESS 2 */}
                        <div className="md:col-span-2">
                          <Label optional>Billing Address Line 2</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                            <input
                              type="text"
                              value={billingAddress.address_line_2}
                              onChange={(e) =>
                                updateBillingField(
                                  "address_line_2",
                                  e.target.value,
                                )
                              }
                              className={inputClass()}
                              placeholder="Apartment, suite, unit, building"
                            />
                          </div>
                        </div>

                        {/* STATE */}
                        <div>
                          <Label>Billing State</Label>
                          {billingStates.length > 0 ? (
                            <>
                              <CustomDropdown
                                value={
                                  billingStateOther
                                    ? OTHER_OPTION
                                    : billingAddress.state
                                }
                                placeholder="Select state"
                                onChange={(v) => {
                                  if (v === OTHER_OPTION) {
                                    setBillingStateOther(true);
                                    updateBillingField("state", "");
                                  } else {
                                    setBillingStateOther(false);
                                    updateBillingField("state", v);
                                  }
                                }}
                                includeOther
                                hasError={!!billingErrors.state}
                                options={billingStates.map((s) => ({
                                  value: s,
                                  label: s,
                                }))}
                              />
                              {billingStateOther && (
                                <input
                                  type="text"
                                  value={billingAddress.state}
                                  onChange={(e) =>
                                    updateBillingField("state", e.target.value)
                                  }
                                  className={`${simpleInputClass(
                                    billingErrors.state,
                                  )} mt-2`}
                                  placeholder="Enter your state"
                                  autoFocus
                                />
                              )}
                            </>
                          ) : (
                            <input
                              type="text"
                              value={billingAddress.state}
                              onChange={(e) =>
                                updateBillingField("state", e.target.value)
                              }
                              className={simpleInputClass(
                                billingErrors.state,
                              )}
                              placeholder="Enter state"
                            />
                          )}
                          <FieldError>{billingErrors.state}</FieldError>
                        </div>

                        {/* CITY */}
                        <div>
                          <Label>Billing City / District</Label>
                          {billingCities.length > 0 ? (
                            <>
                              <CustomDropdown
                                value={
                                  billingCityOther
                                    ? OTHER_OPTION
                                    : billingAddress.city
                                }
                                placeholder="Select city"
                                onChange={(v) => {
                                  if (v === OTHER_OPTION) {
                                    setBillingCityOther(true);
                                    updateBillingField("city", "");
                                  } else {
                                    setBillingCityOther(false);
                                    updateBillingField("city", v);
                                  }
                                }}
                                includeOther
                                hasError={!!billingErrors.city}
                                options={billingCities.map((c) => ({
                                  value: c,
                                  label: c,
                                }))}
                              />
                              {billingCityOther && (
                                <input
                                  type="text"
                                  value={billingAddress.city}
                                  onChange={(e) =>
                                    updateBillingField("city", e.target.value)
                                  }
                                  className={`${simpleInputClass(
                                    billingErrors.city,
                                  )} mt-2`}
                                  placeholder="Enter your city"
                                  autoFocus
                                />
                              )}
                            </>
                          ) : (
                            <input
                              type="text"
                              value={billingAddress.city}
                              onChange={(e) =>
                                updateBillingField("city", e.target.value)
                              }
                              className={simpleInputClass(
                                billingErrors.city,
                              )}
                              placeholder="Enter city"
                            />
                          )}
                          <FieldError>{billingErrors.city}</FieldError>
                        </div>

                        {/* COUNTRY */}
                        <div className="md:col-span-2">
                          <Label>Billing Country</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                            <input
                              type="text"
                              value={billingAddress.country}
                              onChange={(e) =>
                                updateBillingField("country", e.target.value)
                              }
                              className={`${simpleInputClass(
                                billingErrors.country,
                              )} pl-10`}
                              placeholder="India"
                            />
                          </div>
                          <FieldError>{billingErrors.country}</FieldError>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className={
          inline
            ? "mt-4 border-t border-[#E4EBE6] pt-4"
            : "shrink-0 border-t border-[#E4EBE6] bg-white px-4 py-3.5 sm:px-5"
        }
      >
        <div
          className={`flex gap-2.5 ${inline ? "flex-col sm:flex-row" : ""}`}
        >
          {!inline && (
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isLoading}
              className="h-[44px] flex-1 rounded-[6px] border border-[#DDE7DF] bg-white px-4 text-[11px] font-medium text-[#555555] transition hover:border-[#B9CFC1] hover:bg-[#F8FBF8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`flex h-[44px] items-center justify-center gap-2 rounded-[6px] bg-[#173E2B] px-5 text-[11px] font-semibold text-white transition hover:bg-[#1B5538] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
              inline ? "w-full sm:flex-1" : "flex-1"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving Address...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {initialData ? "Update Address" : "Save & Continue"}
                </span>
              </>
            )}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-[#16845B]" />
          <p className="text-center text-[9px] text-[#999999]">
            Your address details are securely saved
          </p>
          <span className="h-1 w-1 rounded-full bg-[#16845B]" />
        </div>
      </div>
    </form>
  );

  if (inline) {
    return <div className="w-full">{formContent}</div>;
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[9999] bg-black/35 backdrop-blur-[2px]"
            onClick={() => {
              if (!isLoading) handleModalClose();
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 font-sans sm:p-5"
          >
            <div
              className="flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[8px] border border-[#E4EBE6] bg-[#F7FAF8] shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 border-b border-[#E4EBE6] bg-white px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[#173E2B] text-white">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <span className="text-[8px] font-medium uppercase tracking-[0.14em] text-[#888888]">
                          Checkout
                        </span>
                        <span className="h-[3px] w-[3px] rounded-full bg-[#B0B0AD]" />
                        <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-[#AAAAAA]">
                          Address
                        </span>
                      </div>
                      <h2 className="truncate text-[16px] font-medium text-[#171717] sm:text-[18px]">
                        {initialData ? "Edit Address" : "Add New Address"}
                      </h2>
                      <p className="mt-0.5 text-[9px] text-[#888888]">
                        Enter your delivery details to continue
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    disabled={isLoading}
                    aria-label="Close"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#DDE7DF] bg-white text-[#777777] transition hover:border-[#B9CFC1] hover:bg-[#F8FBF8] hover:text-[#173E2B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-[15px] w-[15px]" />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#EEEEEC]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.45, delay: 0.05 }}
                      className="h-full rounded-full bg-[#16845B]"
                    />
                  </div>
                  <span className="text-[8px] font-medium text-[#888888]">
                    1 / 1
                  </span>
                </div>
              </div>
              {formContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}