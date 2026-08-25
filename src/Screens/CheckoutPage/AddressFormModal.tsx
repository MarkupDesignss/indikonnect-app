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
  CheckCircle,
  Loader2,
  MapPin,
  CreditCard,
  ChevronUp,
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

  // NEW:
  // true = same form will render inline
  // false = normal modal popup
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
  const [formData, setFormData] =
    useState<AddressFormData>({
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

  const [billingAddress, setBillingAddress] =
    useState<BillingAddressData>({
      ...emptyBillingAddress,
    });

  const [errors, setErrors] =
    useState<
      Partial<Record<keyof AddressFormData, string>>
    >({});

  const [billingErrors, setBillingErrors] =
    useState<
      Partial<Record<keyof BillingAddressData, string>>
    >({});

  const showSeparateBillingForm =
    !formData.is_billing;

  /* =========================================================
     POPULATE / RESET FORM
  ========================================================= */

  useEffect(() => {
    if (initialData) {
      setFormData({
        recipient_name:
          initialData.recipient_name || "",

        contact_number:
          initialData.contact_number || "",

        address_line_1:
          initialData.address_line_1 || "",

        address_line_2:
          initialData.address_line_2 || "",

        city: initialData.city || "",

        state: initialData.state || "",

        postcode:
          initialData.postcode || "",

        country:
          initialData.country || "India",

        is_default:
          initialData.is_default === true,

        is_billing:
          initialData.is_billing === true,

        is_delivery:
          initialData.is_delivery === true,
      });

      // Support optional billing fields from API response.
      const addressWithBilling =
        initialData as Address & {
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
        addressWithBilling.billing_recipient_name ||
        addressWithBilling.billing_address_line_1 ||
        addressWithBilling.billing_city;

      if (hasBillingData) {
        setBillingAddress({
          recipient_name:
            addressWithBilling
              .billing_recipient_name || "",

          contact_number:
            addressWithBilling
              .billing_contact_number || "",

          address_line_1:
            addressWithBilling
              .billing_address_line_1 || "",

          address_line_2:
            addressWithBilling
              .billing_address_line_2 || "",

          city:
            addressWithBilling.billing_city || "",

          state:
            addressWithBilling.billing_state || "",

          postcode:
            addressWithBilling
              .billing_postcode || "",

          country:
            addressWithBilling
              .billing_country ||
            initialData.country ||
            "India",
        });

        setFormData((previous) => ({
          ...previous,
          is_billing: false,
        }));
      } else {
        setBillingAddress({
          recipient_name:
            initialData.recipient_name || "",

          contact_number:
            initialData.contact_number || "",

          address_line_1:
            initialData.address_line_1 || "",

          address_line_2:
            initialData.address_line_2 || "",

          city: initialData.city || "",

          state: initialData.state || "",

          postcode:
            initialData.postcode || "",

          country:
            initialData.country || "India",
        });

        setFormData((previous) => ({
          ...previous,
          is_billing: true,
        }));
      }
    } else {
      // New address
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

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateMainAddress = () => {
    const newErrors: Partial<
      Record<keyof AddressFormData, string>
    > = {};

    if (!formData.recipient_name.trim()) {
      newErrors.recipient_name =
        "Full name is required";
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number =
        "Phone number is required";
    }

    if (!formData.address_line_1.trim()) {
      newErrors.address_line_1 =
        "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city =
        "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state =
        "State is required";
    }

    if (!formData.postcode.trim()) {
      newErrors.postcode =
        "Postcode is required";
    }

    if (!formData.country.trim()) {
      newErrors.country =
        "Country is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateBillingAddress = () => {
    const newErrors: Partial<
      Record<keyof BillingAddressData, string>
    > = {};

    if (!billingAddress.recipient_name.trim()) {
      newErrors.recipient_name =
        "Billing name is required";
    }

    if (!billingAddress.contact_number.trim()) {
      newErrors.contact_number =
        "Billing phone is required";
    }

    if (!billingAddress.address_line_1.trim()) {
      newErrors.address_line_1 =
        "Billing address is required";
    }

    if (!billingAddress.city.trim()) {
      newErrors.city =
        "Billing city is required";
    }

    if (!billingAddress.state.trim()) {
      newErrors.state =
        "Billing state is required";
    }

    if (!billingAddress.postcode.trim()) {
      newErrors.postcode =
        "Billing postcode is required";
    }

    if (!billingAddress.country.trim()) {
      newErrors.country =
        "Billing country is required";
    }

    setBillingErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validateMainAddress()) {
      return;
    }

    if (
      !formData.is_billing &&
      !validateBillingAddress()
    ) {
      return;
    }

    const submitData = {
      ...formData,
    };

    if (formData.is_billing) {
      submitData.billing_recipient_name =
        formData.recipient_name;

      submitData.billing_contact_number =
        formData.contact_number;

      submitData.billing_address_line_1 =
        formData.address_line_1;

      submitData.billing_address_line_2 =
        formData.address_line_2 || "";

      submitData.billing_city =
        formData.city;

      submitData.billing_state =
        formData.state;

      submitData.billing_postcode =
        formData.postcode;

      submitData.billing_country =
        formData.country;
    } else {
      submitData.billing_recipient_name =
        billingAddress.recipient_name;

      submitData.billing_contact_number =
        billingAddress.contact_number;

      submitData.billing_address_line_1 =
        billingAddress.address_line_1;

      submitData.billing_address_line_2 =
        billingAddress.address_line_2;

      submitData.billing_city =
        billingAddress.city;

      submitData.billing_state =
        billingAddress.state;

      submitData.billing_postcode =
        billingAddress.postcode;

      submitData.billing_country =
        billingAddress.country;
    }

    await onSubmit(submitData);
  };

  /* =========================================================
     INPUT CLASS
  ========================================================= */

  const inputClass = (
    error?: string
  ) => `
    w-full px-4 py-2.5 bg-white border rounded-lg
    focus:ring-2 focus:ring-[#C9A227]/20
    focus:border-[#C9A227]
    transition-all outline-none text-black text-sm
    ${
      error
        ? "border-[#92403F]"
        : "border-[#E7DBC0]"
    }
  `;

  /* =========================================================
     BILLING FIELD UPDATE
  ========================================================= */

  const updateBillingField = (
    field: keyof BillingAddressData,
    value: string
  ) => {
    setBillingAddress((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (billingErrors[field]) {
      setBillingErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  };

  /* =========================================================
     FORM CONTENT
  ========================================================= */

  const formContent = (
    <form
      onSubmit={handleSubmit}
      className={
        inline
          ? "w-full"
          : "flex-1 overflow-y-auto min-h-0"
      }
    >
      <div className="p-6">
        {/* =================================================
            DELIVERY ADDRESS
        ================================================= */}

        <div className="mb-6">
       

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FULL NAME */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />

                <input
                  type="text"
                  value={
                    formData.recipient_name
                  }
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      recipient_name:
                        e.target.value,
                    });

                    if (
                      errors.recipient_name
                    ) {
                      setErrors(
                        (previous) => ({
                          ...previous,
                          recipient_name:
                            undefined,
                        })
                      );
                    }
                  }}
                  className={`${inputClass(
                    errors.recipient_name
                  )} pl-10`}
                  placeholder="Enter full name"
                />
              </div>

              {errors.recipient_name && (
                <p className="text-xs text-[#92403F] mt-1">
                  {errors.recipient_name}
                </p>
              )}
            </div>

            {/* PHONE */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />

                <input
                  type="text"
                  value={
                    formData.contact_number
                  }
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      contact_number:
                        e.target.value,
                    });

                    if (
                      errors.contact_number
                    ) {
                      setErrors(
                        (previous) => ({
                          ...previous,
                          contact_number:
                            undefined,
                        })
                      );
                    }
                  }}
                  className={`${inputClass(
                    errors.contact_number
                  )} pl-10`}
                  placeholder="Enter your phone number"
                />
              </div>

              {errors.contact_number && (
                <p className="text-xs text-[#92403F] mt-1">
                  {errors.contact_number}
                </p>
              )}
            </div>

            {/* ADDRESS LINE 1 */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                Address Line 1
              </label>

              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />

                <input
                  type="text"
                  value={
                    formData.address_line_1
                  }
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      address_line_1:
                        e.target.value,
                    });

                    if (
                      errors.address_line_1
                    ) {
                      setErrors(
                        (previous) => ({
                          ...previous,
                          address_line_1:
                            undefined,
                        })
                      );
                    }
                  }}
                  className={`${inputClass(
                    errors.address_line_1
                  )} pl-10`}
                  placeholder="Street address"
                />
              </div>

              {errors.address_line_1 && (
                <p className="text-xs text-[#92403F] mt-1">
                  {errors.address_line_1}
                </p>
              )}
            </div>

            {/* ADDRESS LINE 2 */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                Address Line 2 (Optional)
              </label>

              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />

                <input
                  type="text"
                  value={
                    formData.address_line_2
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address_line_2:
                        e.target.value,
                    })
                  }
                  className={`${inputClass()} pl-10`}
                  placeholder="Apartment, suite, unit, building"
                />
              </div>
            </div>

            {/* CITY */}

            <div>
              <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                City
              </label>

              <input
                type="text"
                value={formData.city}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    city: e.target.value,
                  });

                  if (errors.city) {
                    setErrors((previous) => ({
                      ...previous,
                      city: undefined,
                    }));
                  }
                }}
                className={inputClass(
                  errors.city
                )}
                placeholder="Enter city"
              />

              {errors.city && (
                <p className="text-xs text-[#92403F] mt-1">
                  {errors.city}
                </p>
              )}
            </div>

            {/* STATE */}

            <div>
              <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                State
              </label>

              <input
                type="text"
                value={formData.state}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    state: e.target.value,
                  });

                  if (errors.state) {
                    setErrors((previous) => ({
                      ...previous,
                      state: undefined,
                    }));
                  }
                }}
                className={inputClass(
                  errors.state
                )}
                placeholder="Enter state"
              />

              {errors.state && (
                <p className="text-xs text-[#92403F] mt-1">
                  {errors.state}
                </p>
              )}
            </div>

            {/* POSTCODE */}

            <div>
              <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                Postcode
              </label>

              <input
                type="text"
                value={
                  formData.postcode
                }
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    postcode:
                      e.target.value,
                  });

                  if (errors.postcode) {
                    setErrors((previous) => ({
                      ...previous,
                      postcode:
                        undefined,
                    }));
                  }
                }}
                className={inputClass(
                  errors.postcode
                )}
                placeholder="Enter postcode"
              />

              {errors.postcode && (
                <p className="text-xs text-[#92403F] mt-1">
                  {errors.postcode}
                </p>
              )}
            </div>

            {/* COUNTRY */}

            <div>
              <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                Country
              </label>

              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />

                <input
                  type="text"
                  value={
                    formData.country
                  }
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      country:
                        e.target.value,
                    });

                    if (errors.country) {
                      setErrors((previous) => ({
                        ...previous,
                        country:
                          undefined,
                      }));
                    }
                  }}
                  className={`${inputClass(
                    errors.country
                  )} pl-10`}
                  placeholder="Enter country"
                />
              </div>

              {errors.country && (
                <p className="text-xs text-[#92403F] mt-1">
                  {errors.country}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            ADDRESS OPTIONS
        ================================================= */}

        <div className="border-t border-[#EFE6D3] pt-5 space-y-3">
          {/* DEFAULT ADDRESS */}

          <label className="flex items-center justify-between gap-3 cursor-pointer p-3 rounded-xl border border-[#E7DBC0] hover:bg-[#FBF6EC] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C9A227]/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-[#C9A227]" />
              </div>

              <div>
                <p className="text-sm font-medium text-[#2B2420]">
                  Set as default address
                </p>

                <p className="text-xs text-[#8a7f6e]">
                  Use this address by default
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={
                formData.is_default
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_default:
                    e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-[#D9CFBA] text-[#C9A227] focus:ring-[#C9A227]/20 focus:ring-2"
            />
          </label>

          {/* BILLING ADDRESS */}

          <div className="rounded-xl border border-[#E7DBC0] overflow-hidden">
            <label className="flex items-center justify-between gap-3 cursor-pointer p-3 hover:bg-[#FBF6EC] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#92403F]/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-[#92403F]" />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#2B2420]">
                    Use same address for billing
                  </p>

                  <p className="text-xs text-[#8a7f6e]">
                    Billing and delivery address are the same
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={
                  formData.is_billing
                }
                onChange={(e) => {
                  const checked =
                    e.target.checked;

                  setFormData({
                    ...formData,
                    is_billing:
                      checked,
                  });

                  if (checked) {
                    setBillingErrors({});
                  }
                }}
                className="w-4 h-4 rounded border-[#D9CFBA] text-[#C9A227] focus:ring-[#C9A227]/20 focus:ring-2"
              />
            </label>

            {/* SEPARATE BILLING */}

            <AnimatePresence
              initial={false}
            >
              {showSeparateBillingForm && (
                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[#EFE6D3] bg-[#FBF6EC] p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[#92403F]/10 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-[#92403F]" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-serif text-base text-[#2B2420]">
                          Separate Billing Address
                        </h3>

                        <p className="text-xs text-[#8a7f6e]">
                          Enter a different address for billing
                        </p>
                      </div>

                      <ChevronUp className="w-4 h-4 text-[#8a7f6e]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* BILLING NAME */}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Billing Full Name
                        </label>

                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />

                          <input
                            type="text"
                            value={
                              billingAddress.recipient_name
                            }
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
                          <p className="text-xs text-[#92403F] mt-1">
                            {
                              billingErrors.recipient_name
                            }
                          </p>
                        )}
                      </div>

                      {/* BILLING PHONE */}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Billing Phone Number
                        </label>

                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />

                          <input
                            type="text"
                            value={
                              billingAddress.contact_number
                            }
                            onChange={(e) =>
                              updateBillingField(
                                "contact_number",
                                e.target.value
                              )
                            }
                            className={`${inputClass(
                              billingErrors.contact_number
                            )} pl-10`}
                            placeholder="+91 98765 43210"
                          />
                        </div>

                        {billingErrors.contact_number && (
                          <p className="text-xs text-[#92403F] mt-1">
                            {
                              billingErrors.contact_number
                            }
                          </p>
                        )}
                      </div>

                      {/* BILLING ADDRESS 1 */}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Billing Address Line 1
                        </label>

                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />

                          <input
                            type="text"
                            value={
                              billingAddress.address_line_1
                            }
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
                          <p className="text-xs text-[#92403F] mt-1">
                            {
                              billingErrors.address_line_1
                            }
                          </p>
                        )}
                      </div>

                      {/* BILLING ADDRESS 2 */}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Billing Address Line 2 (Optional)
                        </label>

                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />

                          <input
                            type="text"
                            value={
                              billingAddress.address_line_2
                            }
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

                      {/* BILLING CITY */}

                      <div>
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Billing City
                        </label>

                        <input
                          type="text"
                          value={
                            billingAddress.city
                          }
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

                        {billingErrors.city && (
                          <p className="text-xs text-[#92403F] mt-1">
                            {
                              billingErrors.city
                            }
                          </p>
                        )}
                      </div>

                      {/* BILLING STATE */}

                      <div>
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Billing State
                        </label>

                        <input
                          type="text"
                          value={
                            billingAddress.state
                          }
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

                        {billingErrors.state && (
                          <p className="text-xs text-[#92403F] mt-1">
                            {
                              billingErrors.state
                            }
                          </p>
                        )}
                      </div>

                      {/* BILLING POSTCODE */}

                      <div>
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Billing Postcode
                        </label>

                        <input
                          type="text"
                          value={
                            billingAddress.postcode
                          }
                          onChange={(e) =>
                            updateBillingField(
                              "postcode",
                              e.target.value
                            )
                          }
                          className={inputClass(
                            billingErrors.postcode
                          )}
                          placeholder="Enter postcode"
                        />

                        {billingErrors.postcode && (
                          <p className="text-xs text-[#92403F] mt-1">
                            {
                              billingErrors.postcode
                            }
                          </p>
                        )}
                      </div>

                      {/* BILLING COUNTRY */}

                      <div>
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Billing Country
                        </label>

                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />

                          <input
                            type="text"
                            value={
                              billingAddress.country
                            }
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
                          <p className="text-xs text-[#92403F] mt-1">
                            {
                              billingErrors.country
                            }
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

      {/* =================================================
          FORM FOOTER
      ================================================= */}

      <div
        className={`
          ${
            inline
              ? "border-t border-[#EFE6D3] mt-2 px-6 py-4"
              : "sticky bottom-0 z-20 bg-white border-t border-[#EFE6D3] px-6 py-4 shadow-[0_-8px_20px_-15px_rgba(43,36,32,0.25)]"
          }
        `}
      >
        <div className="flex items-center gap-3">
          {/* CANCEL ONLY IN MODAL */}
          {!inline && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white border border-[#E7DBC0] text-[#5C534A] rounded-lg hover:bg-[#F1E9D9] hover:border-[#D9CFBA] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`
              px-4 py-3
              bg-gradient-to-r from-[#2B2420] to-[#3d322b]
              text-white rounded-lg
              flex items-center justify-center gap-2
              hover:from-[#92403F] hover:to-[#7a3635]
              transition-all duration-200
              shadow-lg shadow-[#2B2420]/10
              disabled:opacity-70
              disabled:cursor-not-allowed
              ${
                inline
                  ? "w-full"
                  : "flex-1"
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {initialData
                  ? "Update Address"
                  : "Save Address"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );

  /* =========================================================
     INLINE MODE
  ========================================================= */

  if (inline) {
    return (
      <div className="w-full">
        {formContent}
      </div>
    );
  }

  /* =========================================================
     NORMAL MODAL MODE
  ========================================================= */

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => {
              if (!isLoading) {
                onClose();
              }
            }}
          />

          {/* MODAL */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* HEADER */}

              <div className="shrink-0 px-6 py-4 border-b border-[#EFE6D3] flex items-center justify-between bg-white">
                <div>
                  <h2 className="font-serif text-xl text-[#2B2420]">
                    {initialData
                      ? "Edit Address"
                      : "Add New Address"}
                  </h2>

                  <p className="text-xs text-[#8a7f6e] mt-1">
                    Enter your delivery address details
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-1.5 hover:bg-[#F1E9D9] rounded-lg text-[#a89c86] hover:text-[#2B2420] transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
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