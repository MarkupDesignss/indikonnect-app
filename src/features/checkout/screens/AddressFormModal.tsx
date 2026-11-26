"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, User, Phone, Home, Building2, Globe, CheckCircle2, Loader2, CreditCard, ChevronDown, MapPin } from "lucide-react";

import { Address, AddressFormData } from "@/features/checkout/screens/CheckoutPage";
import { useGetIndiaPostPincodeQuery } from "@/lib/redux/api/indiaPostApi";
import { ADDRESS_TYPES, AddressFormModalProps, BillingAddressData, OTHER_OPTION, emptyBillingAddress, parseIndiaPostData } from "@/features/checkout/screens/AddressFormModal.parts/support";
import { CustomDropdown } from "@/features/checkout/screens/AddressFormModal.parts/CustomDropdown";


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

const AddressTypeSelector = ({ value, onChange }: { value: AddressFormData["type"]; onChange: (value: AddressFormData["type"]) => void }) => (
  <div className="md:col-span-2">
    <Label>Address Type</Label>
    <div className="grid grid-cols-3 gap-2">
      {ADDRESS_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.value;
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
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
    post_office: "",
    billing_post_office: "",
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

  const [stateOther, setStateOther] = useState(false);
  const [cityOther, setCityOther] = useState(false);
  const [billingStateOther, setBillingStateOther] = useState(false);
  const [billingCityOther, setBillingCityOther] = useState(false);

  const [selectedArea, setSelectedArea] = useState("");
  const [billingSelectedArea, setBillingSelectedArea] = useState("");

  const [manualArea, setManualArea] = useState("");
  const [billingManualArea, setBillingManualArea] = useState("");

  /* ============================================================
     PINCODE LOOKUP
  ============================================================ */
  const [postcodeForLookup, setPostcodeForLookup] = useState("");
  const [billingPostcodeForLookup, setBillingPostcodeForLookup] = useState("");

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

  /* Auto-fill state and city for the current pincode. */
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
      const area = mainAreas[0];
      setSelectedArea(area.value);
      setFormData((previous) => {
        const next = {
          ...previous,
          state: previous.state || area.state,
          city: previous.city || area.city,
          post_office: area.office,
          address_line_1:
            previous.address_line_1 ||
            [area.office, area.taluk, area.village].filter(Boolean).join(", "),
        };
        if (next.is_billing) {
          next.billing_post_office = area.office;
        } else if (!next.billing_post_office) {
          next.billing_post_office = area.office;
        }
        return next;
      });
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
      const area = billingAreas[0];
      setBillingSelectedArea(area.value);
      setBillingAddress((previous) => ({
        ...previous,
        state: previous.state || area.state,
        city: previous.city || area.city,
        post_office: area.office,
        billing_post_office: area.office,
        address_line_1:
          previous.address_line_1 ||
          [area.office, area.taluk, area.village].filter(Boolean).join(", "),
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
     SYNC billing_post_office when is_billing toggles ON
  ============================================================ */
  useEffect(() => {
    if (!formData.is_billing) return;
    if (formData.billing_post_office === formData.post_office) return;
    setFormData((previous) =>
      previous.is_billing
        ? { ...previous, billing_post_office: previous.post_office }
        : previous,
    );
  }, [formData.is_billing, formData.post_office, formData.billing_post_office]);

  const resetFormState = useCallback(() => {
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
        post_office: initialData.post_office || "",
        billing_post_office: initialData.billing_post_office || "",
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
        billing_post_office?: string;
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
          post_office: addressWithBilling.billing_post_office || "",
          billing_post_office:
            addressWithBilling.billing_post_office ||
            initialData.billing_post_office ||
            "",
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
          post_office: initialData.post_office || "",
          billing_post_office:
            initialData.billing_post_office || initialData.post_office || "",
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
        post_office: "",
        billing_post_office: "",
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

    // ❌ Removed post_office validation (made optional)

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

    // ❌ Removed billing_post_office validation (made optional)

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
      post_office: formData.post_office,
      // If same billing, mirror delivery post office; otherwise the billing form's value
      billing_post_office: formData.is_billing
        ? formData.post_office
        : billingAddress.billing_post_office,
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
      submitData.billing_post_office = formData.post_office;
    } else {
      submitData.billing_recipient_name = billingAddress.recipient_name;
      submitData.billing_contact_number = billingAddress.contact_number;
      submitData.billing_address_line_1 = billingAddress.address_line_1;
      submitData.billing_address_line_2 = billingAddress.address_line_2;
      submitData.billing_city = billingAddress.city;
      submitData.billing_state = billingAddress.state;
      submitData.billing_postcode = billingAddress.postcode;
      submitData.billing_country = billingAddress.country;
      submitData.billing_post_office = billingAddress.billing_post_office;
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
      post_office: "",
      billing_post_office: previous.is_billing ? "" : previous.billing_post_office,
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
      post_office: "",
      billing_post_office: "",
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
      if (next.is_billing) {
        next.billing_post_office = area.office;
      }
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
                <AddressTypeSelector value={formData.type} onChange={(type) => setFormData(previous => ({ ...previous, type }))} />

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
                      onChange={(e) =>
                        handleMainFieldChange("post_office", e.target.value)
                      }
                      className={simpleInputClass(errors.post_office)}
                      placeholder="Enter post office / area"
                    />
                  )}
                  <p className="mt-1 text-[9px] text-[#888888]">
                    Pick your nearest post office / village. State, city,
                    post office & address line 1 will be auto-filled.
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
                        className={simpleInputClass()}
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
                    setFormData((prev) => {
                      const next = { ...prev, is_billing: checked };
                      if (checked) {
                        next.billing_post_office = next.post_office;
                      }
                      return next;
                    });
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
                              value={billingAddress.billing_post_office}
                              onChange={(e) =>
                                updateBillingField(
                                  "billing_post_office",
                                  e.target.value,
                                )
                              }
                              className={simpleInputClass(
                                billingErrors.billing_post_office,
                              )}
                              placeholder="Enter billing post office"
                            />
                          )}

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
                                    billing_post_office: v,
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