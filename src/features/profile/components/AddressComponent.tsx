"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Edit2, Trash2, CheckCircle, Home, Building2, Phone, User, Globe, X, Loader2, CreditCard, Truck, AlertCircle, Stamp } from "lucide-react";
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/lib/redux/api/addressApi";
import { useGetIndiaPostPincodeQuery } from "@/lib/redux/api/indiaPostApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import Loding from "@/components/common/Loding";
import { ADDRESS_TYPES, OTHER_OPTION, ToggleSwitch, parseIndiaPostData } from "@/features/profile/components/AddressComponent.parts/support";
import { CustomDropdown } from "@/features/profile/components/AddressComponent.parts/CustomDropdown";
import { DeleteConfirmModal } from "@/features/profile/components/AddressComponent.parts/DeleteConfirmModal";


export interface Address {
  id: number;
  user_id: number;
  recipient_name: string;
  contact_number: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postcode: string;
  post_office: string;
  billing_post_office: string;
  country: string;
  is_default: boolean;
  is_billing: boolean;
  is_delivery: boolean;
  type?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  billing_recipient_name?: string;
  billing_contact_number?: string;
  billing_address_line_1?: string;
  billing_address_line_2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postcode?: string;
  billing_country?: string;
}

export interface AddressFormData {
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
  is_default: boolean;
  is_billing: boolean;
  is_delivery: boolean;
  type?: string;
  billing_recipient_name?: string;
  billing_contact_number?: string;
  billing_address_line_1?: string;
  billing_address_line_2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postcode?: string;
  billing_country?: string;
}

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
  initialData?: Address | null;
  isLoading: boolean;
}

function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: AddressFormModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
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
    is_default: false,
    is_billing: true,
    is_delivery: true,
    type: "Home",
  });

  const [billingAddress, setBillingAddress] = useState({
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
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressFormData, string>>
  >({});
  const [billingErrors, setBillingErrors] = useState<
    Partial<Record<keyof typeof billingAddress, string>>
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
     PINCODE LOOKUP — debounced
  ============================================================ */
  const [postcodeForLookup, setPostcodeForLookup] = useState("");
  const [billingPostcodeForLookup, setBillingPostcodeForLookup] = useState("");

  useEffect(() => {
    const pin = formData.postcode.trim();
    const t = setTimeout(() => {
      setPostcodeForLookup(/^\d{6}$/.test(pin) ? pin : "");
    }, 500);
    return () => clearTimeout(t);
  }, [formData.postcode]);

  useEffect(() => {
    const pin = billingAddress.postcode.trim();
    const t = setTimeout(() => {
      setBillingPostcodeForLookup(/^\d{6}$/.test(pin) ? pin : "");
    }, 500);
    return () => clearTimeout(t);
  }, [billingAddress.postcode]);

  const {
    data: pincodeData,
    isFetching: isPincodeFetching,
    isError: isPincodeError,
  } = useGetIndiaPostPincodeQuery(postcodeForLookup, {
    skip: !postcodeForLookup,
  });

  const {
    data: billingPincodeData,
    isFetching: isBillingPincodeFetching,
    isError: isBillingPincodeError,
  } = useGetIndiaPostPincodeQuery(billingPostcodeForLookup, {
    skip: !billingPostcodeForLookup,
  });

  const { states: mainStates, cities: mainCities, areas: mainAreas } = useMemo(
    () => parseIndiaPostData(pincodeData ?? null),
    [pincodeData]
  );

  const {
    states: billingStates,
    cities: billingCities,
    areas: billingAreas,
  } = useMemo(
    () => parseIndiaPostData(billingPincodeData ?? null),
    [billingPincodeData]
  );

  /* Auto-fill single state / city */
  useEffect(() => {
    if (mainStates.length === 1 && !formData.state && !stateOther) {
      setFormData((p) => ({ ...p, state: mainStates[0] }));
    }
  }, [mainStates, formData.state, stateOther]);

  useEffect(() => {
    if (mainCities.length === 1 && !formData.city && !cityOther) {
      setFormData((p) => ({ ...p, city: mainCities[0] }));
    }
  }, [mainCities, formData.city, cityOther]);

  useEffect(() => {
    if (
      billingStates.length === 1 &&
      !billingAddress.state &&
      !billingStateOther
    ) {
      setBillingAddress((p) => ({ ...p, state: billingStates[0] }));
    }
  }, [billingStates, billingAddress.state, billingStateOther]);

  useEffect(() => {
    if (
      billingCities.length === 1 &&
      !billingAddress.city &&
      !billingCityOther
    ) {
      setBillingAddress((p) => ({ ...p, city: billingCities[0] }));
    }
  }, [billingCities, billingAddress.city, billingCityOther]);

  /* ============================================================
     AUTO-SELECT AREA FROM EXISTING post_office (EDIT MODE)
     Jab pincode API se data aata hai, toh agar user ke paas pehle se
     post_office saved hai, toh usko dropdown mein match karke select kar lo.
  ============================================================ */
  useEffect(() => {
    if (
      postcodeForLookup !== formData.postcode ||
      mainAreas.length === 0 ||
      selectedArea
    ) {
      return;
    }

    if (formData.post_office) {
      const matchedArea = mainAreas.find(
        (a) => a.office.toLowerCase() === formData.post_office.toLowerCase()
      );
      
      if (matchedArea) {
        setSelectedArea(matchedArea.value);
        return;
      } else {
        setSelectedArea(formData.post_office);
        return;
      }
    }

    if (mainAreas.length === 1) {
      const a = mainAreas[0];
      setSelectedArea(a.value);
      setFormData((p) => ({
        ...p,
        state: p.state || a.state,
        city: p.city || a.city,
        post_office: a.office,
        billing_post_office: p.is_billing ? a.office : p.billing_post_office,
      }));
    }
  }, [postcodeForLookup, formData.postcode, mainAreas, selectedArea, formData.post_office]);

  useEffect(() => {
    if (
      billingPostcodeForLookup !== billingAddress.postcode ||
      billingAreas.length === 0 ||
      billingSelectedArea
    ) {
      return;
    }

    if (billingAddress.post_office || billingAddress.billing_post_office) {
      const targetVal = billingAddress.post_office || billingAddress.billing_post_office;
      const matchedArea = billingAreas.find(
        (a) => a.office.toLowerCase() === targetVal.toLowerCase()
      );

      if (matchedArea) {
        setBillingSelectedArea(matchedArea.value);
        return;
      } else {
        setBillingSelectedArea(targetVal);
        return;
      }
    }

    if (billingAreas.length === 1) {
      const a = billingAreas[0];
      setBillingSelectedArea(a.value);
      setBillingAddress((p) => ({
        ...p,
        state: p.state || a.state,
        city: p.city || a.city,
        post_office: a.office,
        billing_post_office: a.office,
      }));
    }
  }, [
    billingPostcodeForLookup,
    billingAddress.postcode,
    billingAreas,
    billingSelectedArea,
    billingAddress.post_office,
    billingAddress.billing_post_office
  ]);

  /* ============================================================
     Keep billing_post_office in sync while is_billing is ON
  ============================================================ */
  useEffect(() => {
    if (!formData.is_billing) return;
    if (formData.billing_post_office === formData.post_office) return;
    setFormData((prev) =>
      prev.is_billing
        ? { ...prev, billing_post_office: prev.post_office }
        : prev
    );
  }, [formData.is_billing, formData.post_office, formData.billing_post_office]);

  /* Validation helpers */
  const validatePhoneNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length === 0) return true;
    return /^[0-9]{10}$/.test(digitsOnly);
  };

  const validatePostcode = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length === 0) return true;
    return /^[0-9]{6}$/.test(digitsOnly);
  };

  const formatPhoneNumber = (value: string) =>
    value.replace(/\D/g, "").slice(0, 10);

  const formatPostcode = (value: string) =>
    value.replace(/\D/g, "").slice(0, 6);

  /* Populate / reset */
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        recipient_name: initialData.recipient_name || "",
        contact_number: initialData.contact_number || "",
        address_line_1: initialData.address_line_1 || "",
        address_line_2: initialData.address_line_2 || "",
        city: initialData.city || "",
        state: initialData.state || "",
        postcode: initialData.postcode || "",
        post_office: initialData.post_office || "",
        billing_post_office: initialData.billing_post_office || "",
        country: initialData.country || "India",
        is_default: initialData.is_default === true,
        is_billing: initialData.is_billing === true,
        is_delivery: initialData.is_delivery === true,
        type: initialData.type || "Home",
      });

      const hasBillingData =
        initialData.billing_recipient_name ||
        initialData.billing_address_line_1 ||
        initialData.billing_city;

      if (hasBillingData) {
        setBillingAddress({
          recipient_name: initialData.billing_recipient_name || "",
          contact_number: initialData.billing_contact_number || "",
          address_line_1: initialData.billing_address_line_1 || "",
          address_line_2: initialData.billing_address_line_2 || "",
          city: initialData.billing_city || "",
          state: initialData.billing_state || "",
          postcode: initialData.billing_postcode || "",
          post_office: initialData.billing_post_office || "",
          billing_post_office:
            initialData.billing_post_office || initialData.post_office || "",
          country:
            initialData.billing_country || initialData.country || "India",
        });
        setFormData((prev) => ({ ...prev, is_billing: false }));
      } else {
        setBillingAddress({
          recipient_name: initialData.recipient_name || "",
          contact_number: initialData.contact_number || "",
          address_line_1: initialData.address_line_1 || "",
          address_line_2: initialData.address_line_2 || "",
          city: initialData.city || "",
          state: initialData.state || "",
          postcode: initialData.postcode || "",
          post_office: initialData.post_office || "",
          billing_post_office:
            initialData.billing_post_office || initialData.post_office || "",
          country: initialData.country || "India",
        });
        setFormData((prev) => ({ ...prev, is_billing: true }));
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
        post_office: "",
        billing_post_office: "",
        country: "India",
        is_default: false,
        is_billing: true,
        is_delivery: true,
        type: "Home",
      });
      setBillingAddress({
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
      });
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
  }, [initialData, isOpen]);

  const validateMainAddress = () => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};
    if (!formData.recipient_name.trim())
      newErrors.recipient_name = "Full name is required";
    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Phone number is required";
    } else if (!validatePhoneNumber(formData.contact_number)) {
      newErrors.contact_number = "Please enter a valid 10-digit phone number";
    }
    if (!formData.address_line_1.trim())
      newErrors.address_line_1 = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.postcode.trim()) {
      newErrors.postcode = "Postcode is required";
    } else if (!validatePostcode(formData.postcode)) {
      newErrors.postcode = "Please enter a valid 6-digit postcode";
    }
    // ❌ Removed post_office validation (made optional)
    if (!formData.country.trim())
      newErrors.country = "Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBillingAddress = () => {
    const newErrors: Partial<Record<keyof typeof billingAddress, string>> = {};
    if (!billingAddress.recipient_name.trim())
      newErrors.recipient_name = "Billing name is required";
    if (!billingAddress.contact_number.trim()) {
      newErrors.contact_number = "Billing phone is required";
    } else if (!validatePhoneNumber(billingAddress.contact_number)) {
      newErrors.contact_number = "Please enter a valid 10-digit phone number";
    }
    if (!billingAddress.address_line_1.trim())
      newErrors.address_line_1 = "Billing address is required";
    if (!billingAddress.city.trim())
      newErrors.city = "Billing city is required";
    if (!billingAddress.state.trim())
      newErrors.state = "Billing state is required";
    if (!billingAddress.postcode.trim()) {
      newErrors.postcode = "Billing postcode is required";
    } else if (!validatePostcode(billingAddress.postcode)) {
      newErrors.postcode = "Please enter a valid 6-digit postcode";
    }
    // ❌ Removed billing_post_office validation (made optional)
    if (!billingAddress.country.trim())
      newErrors.country = "Billing country is required";
    setBillingErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMainAddress()) return;
    if (!formData.is_billing && !validateBillingAddress()) return;

    const cleanFormData: any = {
      ...formData,
      contact_number: formData.contact_number.replace(/\D/g, ""),
      postcode: formData.postcode.replace(/\D/g, ""),
      type: formData.type || "Home",
      post_office: formData.post_office,
      billing_post_office: formData.is_billing
        ? formData.post_office
        : billingAddress.billing_post_office,
    };

    if (!formData.is_billing) {
      cleanFormData.billing_recipient_name = billingAddress.recipient_name;
      cleanFormData.billing_contact_number =
        billingAddress.contact_number.replace(/\D/g, "");
      cleanFormData.billing_address_line_1 = billingAddress.address_line_1;
      cleanFormData.billing_address_line_2 = billingAddress.address_line_2 || "";
      cleanFormData.billing_city = billingAddress.city;
      cleanFormData.billing_state = billingAddress.state;
      cleanFormData.billing_postcode = billingAddress.postcode.replace(
        /\D/g,
        ""
      );
      cleanFormData.billing_country = billingAddress.country;
      cleanFormData.billing_post_office = billingAddress.billing_post_office;
    } else {
      cleanFormData.billing_recipient_name = cleanFormData.recipient_name;
      cleanFormData.billing_contact_number = cleanFormData.contact_number;
      cleanFormData.billing_address_line_1 = cleanFormData.address_line_1;
      cleanFormData.billing_address_line_2 = cleanFormData.address_line_2 || "";
      cleanFormData.billing_city = cleanFormData.city;
      cleanFormData.billing_state = cleanFormData.state;
      cleanFormData.billing_postcode = cleanFormData.postcode;
      cleanFormData.billing_country = cleanFormData.country;
      cleanFormData.billing_post_office = cleanFormData.post_office;
    }

    await onSubmit(cleanFormData);
  };

  /* ============================================================
     STYLES
  ============================================================ */
  const inputClass = (error?: string) =>
    `h-[42px] w-full rounded-[6px] border bg-white px-3.5 text-[12px] text-[#222222] outline-none transition placeholder:text-[#999999] ${
      error
        ? "border-[#D66A6A] bg-[#FFF9F9] focus:border-[#C94D4D] focus:ring-1 focus:ring-[#C94D4D]/10"
        : "border-[#D7D7D5] hover:border-[#BDBDBA] focus:border-[#999999] focus:ring-1 focus:ring-black/5"
    }`;

  const Label = ({
    children,
    optional,
  }: {
    children: React.ReactNode;
    optional?: boolean;
  }) => (
    <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
      {children}
      {optional && (
        <span className="ml-1 font-normal normal-case tracking-normal text-[#999999]">
          (Optional)
        </span>
      )}
    </label>
  );

  const updateBillingField = (
    field: keyof typeof billingAddress,
    value: string
  ) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
    if (billingErrors[field]) {
      setBillingErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneChange = (
    value: string,
    field: "contact_number" | "billing_contact_number"
  ) => {
    const formatted = formatPhoneNumber(value);
    if (field === "contact_number") {
      setFormData({ ...formData, contact_number: formatted });
      if (errors.contact_number) {
        setErrors((prev) => ({ ...prev, contact_number: undefined }));
      }
    } else {
      updateBillingField("contact_number", formatted);
    }
  };

  /* Main postcode change — resets derived fields */
  const handleMainPostcodeChange = (value: string) => {
    const formatted = formatPostcode(value);
    setFormData((prev) => ({
      ...prev,
      postcode: formatted,
      city: "",
      state: "",
      post_office: "",
      billing_post_office: prev.is_billing ? "" : prev.billing_post_office,
    }));
    setSelectedArea("");
    setManualArea("");
    setStateOther(false);
    setCityOther(false);
    if (errors.postcode) {
      setErrors((prev) => ({ ...prev, postcode: undefined }));
    }
  };

  const handleBillingPostcodeChange = (value: string) => {
    const formatted = formatPostcode(value);
    setBillingAddress((prev) => ({
      ...prev,
      postcode: formatted,
      city: "",
      state: "",
      post_office: "",
      billing_post_office: "",
    }));
    setBillingSelectedArea("");
    setBillingManualArea("");
    setBillingStateOther(false);
    setBillingCityOther(false);
    if (billingErrors.postcode) {
      setBillingErrors((prev) => ({ ...prev, postcode: undefined }));
    }
  };

  const onSelectMainArea = (value: string) => {
    setSelectedArea(value);
    setManualArea("");
    if (value === OTHER_OPTION || !value) return;

    const area = mainAreas.find((a) => a.value === value);
    if (!area) {
      setFormData((prev) => ({
        ...prev,
        post_office: value,
        billing_post_office: prev.is_billing ? value : prev.billing_post_office,
      }));
      return;
    }

    setFormData((previous) => {
      const next = { ...previous };
      if (!next.state && area.state) next.state = area.state;
      if (!next.city && area.city) next.city = area.city;
      next.post_office = area.office;
      if (next.is_billing) next.billing_post_office = area.office;
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
    if (!area) {
      setBillingAddress((prev) => ({
        ...prev,
        billing_post_office: value,
      }));
      return;
    }

    setBillingAddress((previous) => {
      const next = { ...previous };
      if (!next.state && area.state) next.state = area.state;
      if (!next.city && area.city) next.city = area.city;
      next.post_office = area.office;
      next.billing_post_office = area.office;
      if (!next.address_line_1.trim()) {
        next.address_line_1 = [area.office, area.taluk, area.village]
          .filter(Boolean)
          .join(", ");
      }
      return next;
    });
  };

  /* ============================================================
     PINCODE HINT
  ============================================================ */
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
        <p className="mt-1 text-[10px] text-[#111111]">
          ✓ Pincode verified — pick your delivery area below
        </p>
      );
    return null;
  };

  /* ============================================================
     ADDRESS TYPE SELECTOR
  ============================================================ */
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
              className={`flex h-[42px] items-center justify-center gap-2 rounded-[6px] border text-[11px] font-medium transition-all duration-150 ${
                isSelected
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#D7D7D5] bg-white text-[#555555] hover:border-[#BDBDBA] hover:bg-[#FAFAF9]"
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-sans"
          >
            <div
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-[#F7F7F6] shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] bg-white px-5 py-4">
                <div>
                  <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#888888]">
                    {initialData ? "Editing" : "New entry"}
                  </p>
                  <h2 className="text-[16px] font-medium text-[#171717] sm:text-[18px]">
                    {initialData ? "Edit Address" : "Add New Address"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="min-h-0 flex-1 overflow-y-auto"
              >
                <div className="p-5">
                  {/* DELIVERY ADDRESS */}
                  <div className="mb-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#111111] text-white">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-medium text-[#171717]">
                          Delivery Address
                        </h3>
                        <p className="mt-0.5 text-[10px] text-[#888888]">
                          Where should we deliver your order?
                        </p>
                      </div>
                    </div>

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
                              setFormData({
                                ...formData,
                                recipient_name: e.target.value,
                              })
                            }
                            className={`${inputClass(
                              errors.recipient_name
                            )} pl-10`}
                            placeholder="Enter full name"
                            maxLength={100}
                          />
                        </div>
                        {errors.recipient_name && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                            {errors.recipient_name}
                          </p>
                        )}
                      </div>

                      {/* PHONE */}
                      <div className="md:col-span-2">
                        <Label>Phone Number (10 digits)</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.contact_number}
                            onChange={(e) =>
                              handlePhoneChange(
                                e.target.value,
                                "contact_number"
                              )
                            }
                            className={`${inputClass(
                              errors.contact_number
                            )} pl-10`}
                            placeholder="Enter 10-digit phone number"
                            maxLength={10}
                          />
                        </div>
                        {errors.contact_number ? (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                            {errors.contact_number}
                          </p>
                        ) : (
                          <p className="mt-1 text-[9px] text-[#888888]">
                            Enter exactly 10 digits
                          </p>
                        )}
                      </div>

                      {/* POSTCODE — first to drive lookups */}
                      <div className="md:col-span-2">
                        <Label>Postcode (6 digits)</Label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formData.postcode}
                          onChange={(e) =>
                            handleMainPostcodeChange(e.target.value)
                          }
                          className={inputClass(errors.postcode)}
                          placeholder="Enter 6-digit postcode"
                          maxLength={6}
                        />
                        {errors.postcode ? (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                            {errors.postcode}
                          </p>
                        ) : (
                          <PincodeHint
                            fetching={isPincodeFetching}
                            error={isPincodeError}
                            hasData={
                              mainStates.length > 0 ||
                              mainCities.length > 0 ||
                              mainAreas.length > 0
                            }
                          />
                        )}
                      </div>

                      {/* DELIVERY AREA / POST OFFICE → post_office (Optional) */}
                      <div className="md:col-span-2">
                        <Label optional>Delivery Area / Post Office</Label>
                        {mainAreas.length > 0 ? (
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
                        ) : (
                          <input
                            type="text"
                            value={formData.post_office}
                            onChange={(e) => {
                              const v = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                post_office: v,
                                billing_post_office: prev.is_billing
                                  ? v
                                  : prev.billing_post_office,
                              }));
                              if (errors.post_office) {
                                setErrors((prev) => ({
                                  ...prev,
                                  post_office: undefined,
                                }));
                              }
                            }}
                            className={inputClass(errors.post_office)}
                            placeholder="Enter post office / area"
                          />
                        )}
                        <p className="mt-1 text-[9px] text-[#888888]">
                          Pick your nearest post office / village. State,
                          city, post office & address line 1 will be
                          auto-filled.
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
                                setFormData((prev) => ({
                                  ...prev,
                                  post_office: v,
                                  address_line_1: v,
                                  billing_post_office: prev.is_billing
                                    ? v
                                    : prev.billing_post_office,
                                }));
                              }}
                              className={inputClass()}
                              placeholder="e.g. Village / Colony / Sector"
                              autoFocus
                            />
                          </div>
                        )}
                      </div>

                      {/* ADDRESS 1 */}
                      <div className="md:col-span-2">
                        <Label>Address Line 1</Label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                          <input
                            type="text"
                            value={formData.address_line_1}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address_line_1: e.target.value,
                              })
                            }
                            className={`${inputClass(
                              errors.address_line_1
                            )} pl-10`}
                            placeholder="Street address"
                          />
                        </div>
                        {errors.address_line_1 && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                            {errors.address_line_1}
                          </p>
                        )}
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
                            className={`${inputClass()} pl-10`}
                            placeholder="Apartment, suite, unit, building"
                          />
                        </div>
                      </div>

                      {/* STATE */}
                      <div>
                        <Label>State</Label>
                        {mainStates.length > 0 ? (
                          <>
                            <CustomDropdown
                              value={
                                stateOther ? OTHER_OPTION : formData.state
                              }
                              placeholder="Select state"
                              onChange={(v) => {
                                if (v === OTHER_OPTION) {
                                  setStateOther(true);
                                  setFormData((p) => ({ ...p, state: "" }));
                                } else {
                                  setStateOther(false);
                                  setFormData((p) => ({ ...p, state: v }));
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
                                  setFormData({
                                    ...formData,
                                    state: e.target.value,
                                  })
                                }
                                className={`${inputClass(errors.state)} mt-2`}
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
                              setFormData({
                                ...formData,
                                state: e.target.value,
                              })
                            }
                            className={inputClass(errors.state)}
                            placeholder="Enter state"
                          />
                        )}
                        {errors.state && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                            {errors.state}
                          </p>
                        )}
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
                                  setFormData((p) => ({ ...p, city: "" }));
                                } else {
                                  setCityOther(false);
                                  setFormData((p) => ({ ...p, city: v }));
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
                                  setFormData({
                                    ...formData,
                                    city: e.target.value,
                                  })
                                }
                                className={`${inputClass(errors.city)} mt-2`}
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
                              setFormData({
                                ...formData,
                                city: e.target.value,
                              })
                            }
                            className={inputClass(errors.city)}
                            placeholder="Enter city"
                          />
                        )}
                        {errors.city && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                            {errors.city}
                          </p>
                        )}
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
                              setFormData({
                                ...formData,
                                country: e.target.value,
                              })
                            }
                            className={`${inputClass(
                              errors.country
                            )} pl-10`}
                            placeholder="Enter country"
                          />
                        </div>
                        {errors.country && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                            {errors.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS OPTIONS */}
                  <div className="space-y-2.5 border-t border-[#E6E6E4] pt-4">
                    {/* DEFAULT */}
                    <div className="flex items-center justify-between gap-3 rounded-[7px] border border-[#E4E4E2] bg-white p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F0] text-[#888888]">
                          <Stamp className="h-4 w-4" />
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
                      <ToggleSwitch
                        checked={formData.is_default}
                        onChange={(checked) =>
                          setFormData({ ...formData, is_default: checked })
                        }
                      />
                    </div>

                    {/* BILLING */}
                    <div className="overflow-hidden rounded-[7px] border border-[#E4E4E2] bg-white">
                      <div className="flex items-center justify-between gap-3 p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F0] text-[#888888]">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-[#222222]">
                              Use same address for billing
                            </p>
                            <p className="mt-0.5 text-[9px] text-[#888888]">
                              Billing and delivery address are the same
                            </p>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={formData.is_billing}
                          onChange={(checked) => {
                            setFormData((prev) => {
                              const next = { ...prev, is_billing: checked };
                              if (checked) {
                                next.billing_post_office = next.post_office;
                              }
                              return next;
                            });
                            if (checked) setBillingErrors({});
                          }}
                        />
                      </div>

                      {/* SEPARATE BILLING FORM */}
                      <AnimatePresence initial={false}>
                        {showSeparateBillingForm && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[#E6E6E4] bg-[#FAFAF9] p-4">
                              <div className="mb-4 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#111111] text-white">
                                  <CreditCard className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-[12px] font-medium text-[#222222]">
                                    Separate Billing Address
                                  </h4>
                                  <p className="mt-0.5 text-[9px] text-[#888888]">
                                    Enter a different address for billing
                                  </p>
                                </div>
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
                                          e.target.value
                                        )
                                      }
                                      className={`${inputClass(
                                        billingErrors.recipient_name
                                      )} pl-10`}
                                      placeholder="Enter billing full name"
                                    />
                                  </div>
                                  {billingErrors.recipient_name && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.recipient_name}
                                    </p>
                                  )}
                                </div>

                                {/* PHONE */}
                                <div className="md:col-span-2">
                                  <Label>Billing Phone (10 digits)</Label>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                                    <input
                                      type="tel"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={billingAddress.contact_number}
                                      onChange={(e) =>
                                        handlePhoneChange(
                                          e.target.value,
                                          "billing_contact_number"
                                        )
                                      }
                                      className={`${inputClass(
                                        billingErrors.contact_number
                                      )} pl-10`}
                                      placeholder="Enter 10-digit phone number"
                                      maxLength={10}
                                    />
                                  </div>
                                  {billingErrors.contact_number ? (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.contact_number}
                                    </p>
                                  ) : (
                                    <p className="mt-1 text-[9px] text-[#888888]">
                                      Enter exactly 10 digits
                                    </p>
                                  )}
                                </div>

                                {/* POSTCODE */}
                                <div className="md:col-span-2">
                                  <Label>Billing Postcode (6 digits)</Label>
                                  <input
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={billingAddress.postcode}
                                    onChange={(e) =>
                                      handleBillingPostcodeChange(
                                        e.target.value
                                      )
                                    }
                                    className={inputClass(
                                      billingErrors.postcode
                                    )}
                                    placeholder="Enter 6-digit postcode"
                                    maxLength={6}
                                  />
                                  {billingErrors.postcode ? (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.postcode}
                                    </p>
                                  ) : (
                                    <PincodeHint
                                      fetching={isBillingPincodeFetching}
                                      error={isBillingPincodeError}
                                      hasData={
                                        billingStates.length > 0 ||
                                        billingCities.length > 0 ||
                                        billingAreas.length > 0
                                      }
                                    />
                                  )}
                                </div>

                                {/* BILLING AREA / POST OFFICE → billing_post_office (Optional) */}
                                <div className="md:col-span-2">
                                  <Label optional>Billing Area / Post Office</Label>
                                  {billingAreas.length > 0 ? (
                                    <CustomDropdown
                                      value={billingSelectedArea}
                                      placeholder="Select billing area"
                                      onChange={onSelectBillingArea}
                                      includeOther
                                      options={billingAreas.map((a) => ({
                                        value: a.value,
                                        label: a.label,
                                      }))}
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      value={
                                        billingAddress.billing_post_office
                                      }
                                      onChange={(e) =>
                                        updateBillingField(
                                          "billing_post_office",
                                          e.target.value
                                        )
                                      }
                                      className={inputClass(
                                        billingErrors.billing_post_office
                                      )}
                                      placeholder="Enter billing post office"
                                    />
                                  )}

                                  {billingSelectedArea === OTHER_OPTION && (
                                    <div className="mt-2">
                                      <Label>
                                        Enter your Area / Locality
                                      </Label>
                                      <input
                                        type="text"
                                        value={billingManualArea}
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          setBillingManualArea(v);
                                          setBillingAddress((prev) => ({
                                            ...prev,
                                            billing_post_office: v,
                                            address_line_1: v,
                                          }));
                                        }}
                                        className={inputClass()}
                                        placeholder="e.g. Village / Colony / Sector"
                                        autoFocus
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* ADDRESS 1 */}
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
                                          e.target.value
                                        )
                                      }
                                      className={`${inputClass(
                                        billingErrors.address_line_1
                                      )} pl-10`}
                                      placeholder="Street address"
                                    />
                                  </div>
                                  {billingErrors.address_line_1 && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.address_line_1}
                                    </p>
                                  )}
                                </div>

                                {/* ADDRESS 2 */}
                                <div className="md:col-span-2">
                                  <Label optional>
                                    Billing Address Line 2
                                  </Label>
                                  <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                                    <input
                                      type="text"
                                      value={billingAddress.address_line_2}
                                      onChange={(e) =>
                                        updateBillingField(
                                          "address_line_2",
                                          e.target.value
                                        )
                                      }
                                      className={`${inputClass()} pl-10`}
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
                                            updateBillingField(
                                              "state",
                                              e.target.value
                                            )
                                          }
                                          className={`${inputClass(
                                            billingErrors.state
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
                                        updateBillingField(
                                          "state",
                                          e.target.value
                                        )
                                      }
                                      className={inputClass(
                                        billingErrors.state
                                      )}
                                      placeholder="Enter state"
                                    />
                                  )}
                                  {billingErrors.state && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.state}
                                    </p>
                                  )}
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
                                            updateBillingField(
                                              "city",
                                              e.target.value
                                            )
                                          }
                                          className={`${inputClass(
                                            billingErrors.city
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
                                        updateBillingField(
                                          "city",
                                          e.target.value
                                        )
                                      }
                                      className={inputClass(
                                        billingErrors.city
                                      )}
                                      placeholder="Enter city"
                                    />
                                  )}
                                  {billingErrors.city && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.city}
                                    </p>
                                  )}
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
                                        updateBillingField(
                                          "country",
                                          e.target.value
                                        )
                                      }
                                      className={`${inputClass(
                                        billingErrors.country
                                      )} pl-10`}
                                      placeholder="Enter country"
                                    />
                                  </div>
                                  {billingErrors.country && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.country}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 z-[10001] shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="h-[44px] flex-1 rounded-[6px] border border-[#D7D7D5] bg-white px-4 text-[11px] font-medium text-[#555555] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex h-[44px] flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#111111] px-4 text-[11px] font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          {initialData ? "Update Address" : "Save Address"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface AddressComponentProps {
  onAddressClick?: (address: Address) => void;
  buttonPosition?: "top" | "bottom";
}

export default function AddressComponent({
  onAddressClick,
  buttonPosition = "top",
}: AddressComponentProps) {
  const dispatch = useAppDispatch();

  const {
    data: addressesData,
    isLoading: isAddressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useGetAddressesQuery();

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] =
    useSetDefaultAddressMutation();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  useEffect(() => {
    if (addressesData?.data) {
      setAddresses(addressesData.data);
    }
  }, [addressesData]);

  const getErrorMessage = (error: any): string => {
    if (error?.data?.errors) {
      const errorsObj = error.data.errors;
      const errorMessages = Object.values(errorsObj).flat();
      return errorMessages.join(", ");
    }
    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    return "Something went wrong. Please try again.";
  };

  const handleCreateAddress = async (data: AddressFormData) => {
    try {
      const createPayload = {
        ...data,
        type: data.type || "Home",
        is_default: data.is_default || false,
        is_billing: data.is_billing !== undefined ? data.is_billing : true,
        is_delivery: data.is_delivery !== undefined ? data.is_delivery : true,
        post_office: data.post_office,
        billing_post_office: data.billing_post_office,
      };

      await createAddress(createPayload).unwrap();
      dispatch(
        showToast({
          message: "Address added successfully!",
          type: "success",
        })
      );
      setIsModalOpen(false);
      refetchAddresses();
    } catch (error: any) {
      console.error("Failed to create address:", error);
      dispatch(
        showToast({
          message: getErrorMessage(error),
          type: "error",
        })
      );
      throw error;
    }
  };

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress) return;

    try {
      const updatePayload = {
        id: editingAddress.id,
        data: {
          ...data,
          type: data.type || "Home",
          is_default: data.is_default || false,
          is_billing: data.is_billing !== undefined ? data.is_billing : true,
          is_delivery: data.is_delivery !== undefined ? data.is_delivery : true,
          post_office: data.post_office,
          billing_post_office: data.billing_post_office,
        },
      };
      await updateAddress(updatePayload).unwrap();

      dispatch(
        showToast({
          message: "Address updated successfully!",
          type: "success",
        })
      );
      setIsModalOpen(false);
      setEditingAddress(null);
      refetchAddresses();
    } catch (error: any) {
      console.error("Failed to update address:", error);
      dispatch(
        showToast({
          message: getErrorMessage(error),
          type: "error",
        })
      );
      throw error;
    }
  };

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    setDeletingId(addressToDelete.id);
    try {
      await deleteAddress({ id: addressToDelete.id }).unwrap();
      dispatch(
        showToast({
          message: "Address deleted successfully!",
          type: "success",
        })
      );
      refetchAddresses();
      setDeleteModalOpen(false);
      setAddressToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete address:", error);
      dispatch(
        showToast({
          message: getErrorMessage(error),
          type: "error",
        })
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    setSettingDefaultId(id);
    try {
      await setDefaultAddress(id).unwrap();
      dispatch(
        showToast({
          message: "Default address updated!",
          type: "success",
        })
      );
      refetchAddresses();
    } catch (error: any) {
      console.error("Failed to set default:", error);
      dispatch(
        showToast({
          message: getErrorMessage(error),
          type: "error",
        })
      );
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleAddressClick = (address: Address) => {
    if (onAddressClick) onAddressClick(address);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
  };

  const AddAddressButton = () => (
    <button
      onClick={() => {
        setEditingAddress(null);
        setIsModalOpen(true);
      }}
      className="flex items-center gap-2 rounded-[6px] bg-[#111111] px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
    >
      <Plus className="h-3.5 w-3.5" />
      Add New Address
    </button>
  );

  if (isAddressesLoading) {
    return (
      <div className="flex items-center justify-center bg-white py-16 font-sans">
        <Loding />
      </div>
    );
  }

  if (addressesError) {
    return (
      <div className="py-16 text-center font-sans">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF2F2]">
          <AlertCircle className="h-5 w-5 text-[#B24C4C]" />
        </div>
        <h3 className="mb-1.5 text-[16px] font-semibold text-[#171717]">
          Couldn&apos;t load your addresses
        </h3>
        <p className="mb-4 text-[12px] text-[#888888]">
          Please try again in a moment
        </p>
        <button
          onClick={() => refetchAddresses()}
          className="rounded-[6px] bg-[#111111] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto font-sans">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
        >
          <h2 className="text-[20px] font-semibold text-[#171717]">
            Saved Addresses
          </h2>
          {buttonPosition === "top" && <AddAddressButton />}
        </motion.div>

        {/* ADDRESS LIST */}
        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[8px] border border-dashed border-[#DCDCDA] bg-white py-16 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F1F0]">
              <MapPin className="h-6 w-6 text-[#888888]" />
            </div>
            <h3 className="mb-1.5 text-[16px] font-semibold text-[#171717]">
              Your address book is empty
            </h3>
            <p className="mx-auto mb-5 max-w-md text-[12px] leading-5 text-[#888888]">
              Add your first address to make checkout faster next time.
            </p>
            <button
              onClick={() => {
                setEditingAddress(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-[6px] bg-[#111111] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Address
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-3.5 md:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
                {addresses.map((address) => (
                  <motion.div
                    key={address.id}
                    variants={itemVariants}
                    layout
                    exit="exit"
                    onClick={() => handleAddressClick(address)}
                    className={`group relative cursor-pointer overflow-hidden rounded-[8px] border bg-white transition ${
                      address.is_default
                        ? "border-[#111111]"
                        : "border-[#E4E4E2] hover:border-[#CFCFCC]"
                    }`}
                  >
                    {address.is_default && (
                      <div
                        className="absolute right-3 top-3 flex items-center justify-center rounded-full bg-[#111111] px-2.5 py-1"
                        title="Default address"
                      >
                        <span className="text-center text-[8px] font-bold uppercase tracking-[0.08em] text-white">
                          Default
                        </span>
                      </div>
                    )}

                    <div className="p-4">
                      <h4 className="mb-1 truncate pr-16 text-[13px] font-semibold text-[#171717]">
                        {address.recipient_name}
                      </h4>

                      <p className="text-[12px] leading-5 text-[#666666]">
                        {address.address_line_1}
                        {address.address_line_2
                          ? `, ${address.address_line_2}`
                          : ""}
                        <br />
                        {address.city}, {address.state} – {address.postcode}
                        <br />
                        {address.country}
                      </p>

                      {(address.post_office ||
                        address.billing_post_office) && (
                        <p className="mt-1 text-[10px] text-[#777777]">
                          {address.post_office && (
                            <>
                              <span className="font-medium text-[#555555]">
                                Post Office:
                              </span>{" "}
                              {address.post_office}
                            </>
                          )}
                          {address.post_office &&
                            address.billing_post_office && (
                              <span className="mx-1">·</span>
                            )}
                          {address.billing_post_office && (
                            <>
                              <span className="font-medium text-[#555555]">
                                Billing Post Office:
                              </span>{" "}
                              {address.billing_post_office}
                            </>
                          )}
                        </p>
                      )}

                      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#555555]">
                        <Phone className="h-3 w-3" />
                        {address.contact_number}
                      </p>

                      {address.type && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#F1F1F0] px-2.5 py-1 text-[9px] font-medium text-[#555555]">
                          {address.type}
                        </span>
                      )}
                    </div>

                    <div className="h-px bg-[#E6E6E4]" />

                    <div className="flex items-center justify-between bg-[#FAFAF9] px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {address.is_billing && (
                          <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-medium text-[#555555]">
                            <CreditCard className="h-2.5 w-2.5" />
                            Billing
                          </span>
                        )}
                        {address.is_delivery && (
                          <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-medium text-[#555555]">
                            <Truck className="h-2.5 w-2.5" />
                            Delivery
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {!address.is_default && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(address.id);
                            }}
                            disabled={
                              isSettingDefault &&
                              settingDefaultId === address.id
                            }
                            className="whitespace-nowrap px-2 py-1 text-[10px] font-semibold text-[#555555] underline underline-offset-2 transition hover:text-[#111111] disabled:opacity-50"
                            title="Set as Default"
                          >
                            {isSettingDefault &&
                            settingDefaultId === address.id ? (
                              <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                            ) : (
                              "Set default"
                            )}
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(address);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#888888] transition hover:bg-white hover:text-[#111111]"
                          title="Edit Address"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(address);
                          }}
                          disabled={isDeleting && deletingId === address.id}
                          className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#888888] transition hover:bg-white hover:text-[#B24C4C] disabled:opacity-50"
                          title="Delete Address"
                        >
                          {isDeleting && deletingId === address.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {buttonPosition === "bottom" && (
              <div className="mt-4 flex justify-end">
                <AddAddressButton />
              </div>
            )}
          </>
        )}
      </div>

      {/* ADDRESS FORM MODAL */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
        initialData={editingAddress}
        isLoading={isCreating || isUpdating}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        addressName={addressToDelete?.recipient_name || ""}
      />
    </>
  );
}