"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

import { Address, AddressFormData } from "./CheckoutPage";

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

  /* ============================================================
     POPULATE / RESET
  ============================================================ */

  useEffect(() => {
    if (!isOpen && !inline) return;

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

        setFormData((previous) => ({
          ...previous,
          is_billing: false,
        }));
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

        setFormData((previous) => ({
          ...previous,
          is_billing: true,
        }));
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
      });

      setBillingAddress({
        ...emptyBillingAddress,
      });
    }

    setErrors({});
    setBillingErrors({});
  }, [initialData, isOpen, inline]);

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateMainAddress = () => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

    if (!formData.recipient_name.trim())
      newErrors.recipient_name = "Full name is required";

    if (!formData.contact_number.trim())
      newErrors.contact_number = "Phone number is required";

    if (!formData.address_line_1.trim())
      newErrors.address_line_1 = "Address is required";

    if (!formData.city.trim()) newErrors.city = "City is required";

    if (!formData.state.trim()) newErrors.state = "State is required";

    if (!formData.postcode.trim())
      newErrors.postcode = "Postcode is required";

    if (!formData.country.trim())
      newErrors.country = "Country is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateBillingAddress = () => {
    const newErrors: Partial<Record<keyof BillingAddressData, string>> = {};

    if (!billingAddress.recipient_name.trim())
      newErrors.recipient_name = "Billing name is required";

    if (!billingAddress.contact_number.trim())
      newErrors.contact_number = "Billing phone is required";

    if (!billingAddress.address_line_1.trim())
      newErrors.address_line_1 = "Billing address is required";

    if (!billingAddress.city.trim())
      newErrors.city = "Billing city is required";

    if (!billingAddress.state.trim())
      newErrors.state = "Billing state is required";

    if (!billingAddress.postcode.trim())
      newErrors.postcode = "Billing postcode is required";

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

    if (!formData.is_billing && !validateBillingAddress()) {
      return;
    }

    const submitData: any = {
      ...formData,
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

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  };

  const clearBillingError = (field: keyof BillingAddressData) => {
    if (!billingErrors[field]) return;

    setBillingErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  };

  const updateBillingField = (
    field: keyof BillingAddressData,
    value: string,
  ) => {
    setBillingAddress((previous) => ({
      ...previous,
      [field]: value,
    }));

    clearBillingError(field);
  };

  /* ============================================================
     INPUT STYLES
     Checkout page style:
     - white
     - thin #D7D7D5 border
     - 6px radius
     - compact typography
  ============================================================ */

  const inputClass = (error?: string) =>
    `h-[44px] w-full rounded-[6px] border bg-white pl-10 pr-3 text-[12px] text-[#222222] outline-none transition-all duration-150 placeholder:text-[#999999] ${error
      ? "border-[#D66A6A] bg-[#FFF9F9] focus:border-[#C94D4D] focus:ring-1 focus:ring-[#C94D4D]/10"
      : "border-[#D7D7D5] hover:border-[#BDBDBA] focus:border-[#999999] focus:ring-1 focus:ring-black/5"
    }`;

  const simpleInputClass = (error?: string) =>
    `h-[44px] w-full rounded-[6px] border bg-white px-3 text-[12px] text-[#222222] outline-none transition-all duration-150 placeholder:text-[#999999] ${error
      ? "border-[#D66A6A] bg-[#FFF9F9] focus:border-[#C94D4D] focus:ring-1 focus:ring-[#C94D4D]/10"
      : "border-[#D7D7D5] hover:border-[#BDBDBA] focus:border-[#999999] focus:ring-1 focus:ring-black/5"
    }`;

  const FieldError = ({ children }: { children?: string }) =>
    children ? (
      <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
        {children}
      </p>
    ) : null;

  /* ============================================================
     LABEL
  ============================================================ */

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

  /* ============================================================
     SECTION HEADER
  ============================================================ */

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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#111111] text-white">
        {icon}
      </div>

      <div className="min-w-0">
        <h3 className="text-[14px] font-medium text-[#171717]">{title}</h3>
        <p className="mt-0.5 text-[10px] text-[#888888]">{subtitle}</p>
      </div>
    </div>
  );

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
          <section className="overflow-hidden rounded-[7px] border border-[#E6E6E4] bg-white">
            <div className="px-4 pb-4 pt-5">
              <SectionHeader
                icon={<MapPin className="h-4 w-4" />}
                title="Delivery Address"
                subtitle="Where should we deliver your order?"
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* FULL NAME */}
                <div className="md:col-span-2">
                  <Label>Full Name</Label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />

                    <input
                      type="text"
                      value={formData.recipient_name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          recipient_name: e.target.value,
                        });
                        clearError("recipient_name");
                      }}
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
                      type="tel"
                      value={formData.contact_number}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          contact_number: e.target.value,
                        });
                        clearError("contact_number");
                      }}
                      className={inputClass(errors.contact_number)}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <FieldError>{errors.contact_number}</FieldError>
                </div>

                {/* ADDRESS 1 */}
                <div className="md:col-span-2">
                  <Label>Address Line 1</Label>

                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />

                    <input
                      type="text"
                      value={formData.address_line_1}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          address_line_1: e.target.value,
                        });
                        clearError("address_line_1");
                      }}
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

                {/* CITY */}
                <div>
                  <Label>City</Label>

                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      clearError("city");
                    }}
                    className={simpleInputClass(errors.city)}
                    placeholder="Enter city"
                  />

                  <FieldError>{errors.city}</FieldError>
                </div>

                {/* STATE */}
                <div>
                  <Label>State</Label>

                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      clearError("state");
                    }}
                    className={simpleInputClass(errors.state)}
                    placeholder="Enter state"
                  />

                  <FieldError>{errors.state}</FieldError>
                </div>

                {/* POSTCODE */}
                <div>
                  <Label>Postcode</Label>

                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => {
                      setFormData({ ...formData, postcode: e.target.value });
                      clearError("postcode");
                    }}
                    className={simpleInputClass(errors.postcode)}
                    placeholder="110001"
                  />

                  <FieldError>{errors.postcode}</FieldError>
                </div>

                {/* COUNTRY */}
                <div>
                  <Label>Country</Label>

                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />

                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => {
                        setFormData({ ...formData, country: e.target.value });
                        clearError("country");
                      }}
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
            {/* DEFAULT */}
            <label
              className={`group flex cursor-pointer items-center justify-between gap-4 rounded-[7px] border px-3.5 py-3 transition-all duration-150 ${formData.is_default
                  ? "border-[#111111] bg-[#FAFAF9]"
                  : "border-[#E6E6E4] bg-white hover:border-[#CFCFCD]"
                }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] ${formData.is_default
                      ? "bg-[#111111] text-white"
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
                className="h-4 w-4 shrink-0 cursor-pointer accent-black"
              />
            </label>

            {/* BILLING */}
            <div className="overflow-hidden rounded-[7px] border border-[#E6E6E4] bg-white">
              <label
                className={`flex cursor-pointer items-center justify-between gap-4 px-3.5 py-3 transition-colors ${formData.is_billing ? "bg-white" : "bg-[#FAFAF9]"
                  }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] ${formData.is_billing
                        ? "bg-[#F2F2F0] text-[#222222]"
                        : "bg-[#111111] text-white"
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

                    setFormData({
                      ...formData,
                      is_billing: checked,
                    });

                    if (checked) {
                      setBillingErrors({});
                    }
                  }}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-black"
                />
              </label>

              {/* SEPARATE BILLING */}
              <AnimatePresence initial={false}>
                {showSeparateBillingForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#E6E6E4] bg-[#FAFAF9] p-3.5 sm:p-4">
                      <div className="mb-4 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#111111] text-white">
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
                              type="tel"
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
                              placeholder="+91 98765 43210"
                            />
                          </div>

                          <FieldError>
                            {billingErrors.contact_number}
                          </FieldError>
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

                        {/* CITY */}
                        <div>
                          <Label>Billing City</Label>

                          <input
                            type="text"
                            value={billingAddress.city}
                            onChange={(e) =>
                              updateBillingField("city", e.target.value)
                            }
                            className={simpleInputClass(billingErrors.city)}
                            placeholder="Enter city"
                          />

                          <FieldError>{billingErrors.city}</FieldError>
                        </div>

                        {/* STATE */}
                        <div>
                          <Label>Billing State</Label>

                          <input
                            type="text"
                            value={billingAddress.state}
                            onChange={(e) =>
                              updateBillingField("state", e.target.value)
                            }
                            className={simpleInputClass(billingErrors.state)}
                            placeholder="Enter state"
                          />

                          <FieldError>{billingErrors.state}</FieldError>
                        </div>

                        {/* POSTCODE */}
                        <div>
                          <Label>Billing Postcode</Label>

                          <input
                            type="text"
                            value={billingAddress.postcode}
                            onChange={(e) =>
                              updateBillingField("postcode", e.target.value)
                            }
                            className={simpleInputClass(
                              billingErrors.postcode,
                            )}
                            placeholder="110001"
                          />

                          <FieldError>{billingErrors.postcode}</FieldError>
                        </div>

                        {/* COUNTRY */}
                        <div>
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
            ? "mt-4 border-t border-[#E6E6E4] pt-4"
            : "shrink-0 border-t border-[#E6E6E4] bg-white px-4 py-3.5 sm:px-5"
        }
      >
        <div
          className={`flex gap-2.5 ${inline ? "flex-col sm:flex-row" : ""}`}
        >
          {!inline && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-[44px] flex-1 rounded-[6px] border border-[#D7D7D5] bg-white px-4 text-[11px] font-medium text-[#555555] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`flex h-[44px] items-center justify-center gap-2 rounded-[6px] bg-[#111111] px-5 text-[11px] font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${inline ? "w-full sm:flex-1" : "flex-1"
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
          <span className="h-1 w-1 rounded-full bg-[#111111]" />
          <p className="text-center text-[9px] text-[#999999]">
            Your address details are securely saved
          </p>
          <span className="h-1 w-1 rounded-full bg-[#111111]" />
        </div>
      </div>
    </form>
  );

  /* ============================================================
     INLINE
  ============================================================ */

  if (inline) {
    return <div className="w-full">{formContent}</div>;
  }

  /* ============================================================
     MODAL
  ============================================================ */

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]"
            onClick={() => {
              if (!isLoading) {
                onClose();
              }
            }}
          />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 font-sans sm:p-5"
          >
            <div
              className="flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[8px] border border-[#E6E6E4] bg-[#F7F7F6] shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="shrink-0 border-b border-[#E6E6E4] bg-white px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[#111111] text-white">
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
                    onClick={onClose}
                    disabled={isLoading}
                    aria-label="Close"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:bg-[#F7F7F6] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-[15px] w-[15px]" />
                  </button>
                </div>

                {/* PROGRESS */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#EEEEEC]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.45, delay: 0.05 }}
                      className="h-full rounded-full bg-[#111111]"
                    />
                  </div>

                  <span className="text-[8px] font-medium text-[#888888]">
                    1 / 1
                  </span>
                </div>
              </div>

              {/* FORM */}
              {formContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}